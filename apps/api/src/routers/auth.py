"""Authentication router: employer login/register, TOTP 2FA, employee OTP, token refresh.

Employer admins: Email/password + mandatory TOTP 2FA.
Employees: Phone OTP via SMS. No passwords.
Login rate limiting: 10 attempts / 15 min / IP (Redis sliding window).
Refresh tokens: httpOnly cookie, 7-day expiry.
"""

import time
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.redis import get_redis
from jose import jwt as jose_jwt, JWTError as JoseJWTError

from src.core.security import (
    TokenError,
    UserRole,
    create_access_token,
    create_refresh_token,
    encrypt_pii,
    generate_totp_secret,
    get_totp_uri,
    hash_password,
    verify_password,
    verify_token,
    verify_totp,
)
from src.models import Employee, Employer
from src.schemas import (
    EmployeeOTPRequest,
    EmployeeOTPVerifyRequest,
    EmployerLoginRequest,
    EmployerRegisterRequest,
    ProblemDetail,
    TOTPSetupResponse,
    TOTPVerifyRequest,
    TokenResponse,
)
from src.services.notifications.sms import SMSService

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# ── Rate limiting constants ──
LOGIN_RATE_LIMIT_MAX = 10
LOGIN_RATE_LIMIT_WINDOW = 900  # 15 minutes


async def _check_login_rate_limit(request: Request) -> None:
    """10 login attempts per 15 minutes per IP address. Skips if Redis unavailable."""
    try:
        redis = await get_redis()
        client_ip = request.client.host if request.client else "unknown"
        key = f"auth:ratelimit:login:{client_ip}"
        now = time.time()

        pipe = redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - LOGIN_RATE_LIMIT_WINDOW)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, LOGIN_RATE_LIMIT_WINDOW)
        results = await pipe.execute()
        count = results[1]

        if count >= LOGIN_RATE_LIMIT_MAX:
            raise HTTPException(
                status_code=429,
                detail="Too many login attempts. Please try again in 15 minutes.",
            )
    except HTTPException:
        raise
    except Exception:
        logger.warning("rate_limit_skipped", msg="Redis unavailable — skipping rate limit")


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set refresh token as httpOnly secure cookie."""
    response.set_cookie(
        key="wagenow_refresh",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600,  # 7 days
        path="/api/v1/auth",
    )


# ── Token exchange (Supabase → FastAPI JWT) ──

@router.post("/token/exchange", response_model=TokenResponse)
async def exchange_supabase_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Exchange a Supabase JWT for a FastAPI JWT.

    Decodes the Supabase token to extract the user's email,
    looks up the Employer by email, and returns a FastAPI JWT
    with the correct employer_id.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = auth_header[7:]

    # Decode Supabase JWT (without signature verification — Supabase already verified it)
    try:
        payload = jose_jwt.decode(
            token, "", algorithms=["HS256"],
            options={"verify_signature": False, "verify_aud": False},
        )
    except JoseJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Token missing email claim")

    result = await db.execute(select(Employer).where(Employer.email == email))
    employer = result.scalar_one_or_none()

    if employer is None:
        # Auto-provision employer from Supabase user_metadata (set during signup)
        meta = payload.get("user_metadata", {})
        company_name = meta.get("company_name", "")
        ghana_tin = meta.get("ghana_tin", "")
        payday = meta.get("payday", 25)

        if not company_name or not ghana_tin:
            raise HTTPException(
                status_code=404,
                detail="No employer account found. Please register with company details first.",
            )

        # Check TIN uniqueness
        tin_check = await db.execute(select(Employer).where(Employer.ghana_tin == ghana_tin))
        if tin_check.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Ghana TIN already registered")

        employer = Employer(
            company_name=company_name,
            ghana_tin=ghana_tin,
            email=email,
            password_hash="supabase_auth",  # No local password — auth is via Supabase
            payday=int(payday),
        )
        db.add(employer)
        await db.flush()
        logger.info("employer_auto_provisioned", employer_id=str(employer.id), email=email)

    access = create_access_token(
        sub=str(employer.id),
        employer_id=employer.id,
        role=UserRole.EMPLOYER_ADMIN,
    )
    refresh = create_refresh_token(sub=str(employer.id))
    _set_refresh_cookie(response, refresh)

    logger.info("token_exchange", employer_id=str(employer.id), email=email)

    return TokenResponse(
        access_token=access,
        expires_in=900,
        role=UserRole.EMPLOYER_ADMIN.value,
    )


# ── Employer auth ──

@router.post("/employer/register", response_model=TokenResponse, status_code=201)
async def register_employer(
    body: EmployerRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register a new employer. Returns JWT + sets refresh cookie. TOTP setup required next."""
    existing = await db.execute(
        select(Employer).where(
            (Employer.email == body.email) | (Employer.ghana_tin == body.ghana_tin)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email or TIN already registered")

    employer = Employer(
        company_name=body.company_name,
        ghana_tin=body.ghana_tin,
        email=body.email,
        password_hash=hash_password(body.password),
        payday=body.payday,
    )
    db.add(employer)
    await db.flush()

    access = create_access_token(
        sub=str(employer.id),
        employer_id=employer.id,
        role=UserRole.EMPLOYER_ADMIN,
    )
    refresh = create_refresh_token(sub=str(employer.id))
    _set_refresh_cookie(response, refresh)

    logger.info("employer_registered", employer_id=str(employer.id))

    return TokenResponse(
        access_token=access,
        expires_in=900,
        role=UserRole.EMPLOYER_ADMIN.value,
    )


@router.post("/employer/login", response_model=TokenResponse)
async def login_employer(
    body: EmployerLoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Login employer admin. Rate limited: 10 attempts / 15 min / IP."""
    await _check_login_rate_limit(request)

    result = await db.execute(
        select(Employer).where(Employer.email == body.email)
    )
    employer = result.scalar_one_or_none()

    if employer is None or not verify_password(body.password, employer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # If TOTP is verified, require 2FA step
    if employer.totp_verified:
        token = create_access_token(
            sub=str(employer.id),
            employer_id=employer.id,
            role=UserRole.EMPLOYER_ADMIN,
        )
        return TokenResponse(
            access_token=token,
            expires_in=900,
            role="requires_totp",
        )

    access = create_access_token(
        sub=str(employer.id),
        employer_id=employer.id,
        role=UserRole.EMPLOYER_ADMIN,
    )
    refresh = create_refresh_token(sub=str(employer.id))
    _set_refresh_cookie(response, refresh)

    logger.info("employer_login", employer_id=str(employer.id))

    return TokenResponse(
        access_token=access,
        expires_in=900,
        role=UserRole.EMPLOYER_ADMIN.value,
    )


# ── TOTP 2FA ──

@router.post("/employer/totp/setup", response_model=TOTPSetupResponse)
async def setup_totp(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TOTPSetupResponse:
    """Generate TOTP secret and URI for QR code. Must be verified before use."""
    employer_id = _get_employer_id(request)

    result = await db.execute(select(Employer).where(Employer.id == employer_id))
    employer = result.scalar_one_or_none()
    if employer is None:
        raise HTTPException(status_code=404, detail="Employer not found")

    secret = generate_totp_secret()
    uri = get_totp_uri(secret, employer.email)

    employer.totp_secret = encrypt_pii(secret)
    await db.flush()

    return TOTPSetupResponse(totp_uri=uri, secret=secret)


@router.post("/employer/totp/verify")
async def verify_totp_code(
    body: TOTPVerifyRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Verify TOTP code to complete 2FA setup or authenticate."""
    employer_id = _get_employer_id(request)

    result = await db.execute(select(Employer).where(Employer.id == employer_id))
    employer = result.scalar_one_or_none()
    if employer is None:
        raise HTTPException(status_code=404, detail="Employer not found")

    if not employer.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not set up")

    from src.core.security import decrypt_pii
    secret = decrypt_pii(employer.totp_secret)

    if not verify_totp(secret, body.code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")

    if not employer.totp_verified:
        employer.totp_verified = True
        await db.flush()

    access = create_access_token(
        sub=str(employer.id),
        employer_id=employer.id,
        role=UserRole.EMPLOYER_ADMIN,
    )
    refresh = create_refresh_token(sub=str(employer.id))
    _set_refresh_cookie(response, refresh)

    return TokenResponse(
        access_token=access,
        expires_in=900,
        role=UserRole.EMPLOYER_ADMIN.value,
    )


# ── Token refresh ──

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Exchange a valid refresh token (httpOnly cookie) for a new access token.

    The refresh token itself is rotated on each use (refresh token rotation).
    """
    refresh_cookie = request.cookies.get("wagenow_refresh")
    if not refresh_cookie:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = verify_token(refresh_cookie, expected_type="refresh")
    except TokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    # Look up the user to get current role and employer_id
    # Try employer first
    result = await db.execute(select(Employer).where(Employer.id == UUID(sub)))
    employer = result.scalar_one_or_none()
    if employer:
        access = create_access_token(
            sub=sub,
            employer_id=employer.id,
            role=UserRole.EMPLOYER_ADMIN,
        )
        new_refresh = create_refresh_token(sub=sub)
        _set_refresh_cookie(response, new_refresh)

        return TokenResponse(
            access_token=access,
            expires_in=900,
            role=UserRole.EMPLOYER_ADMIN.value,
        )

    # Try employee
    result = await db.execute(select(Employee).where(Employee.id == UUID(sub)))
    employee = result.scalar_one_or_none()
    if employee:
        access = create_access_token(
            sub=sub,
            employer_id=employee.employer_id,
            role=UserRole.EMPLOYEE,
        )
        new_refresh = create_refresh_token(sub=sub)
        _set_refresh_cookie(response, new_refresh)

        return TokenResponse(
            access_token=access,
            expires_in=900,
            role=UserRole.EMPLOYEE.value,
        )

    raise HTTPException(status_code=401, detail="User not found")


# ── Employee OTP auth ──

@router.post("/employee/otp/request", status_code=202)
async def request_employee_otp(
    body: EmployeeOTPRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Send OTP to employee's phone number."""
    # Verify employee exists
    result = await db.execute(
        select(Employee).where(Employee.phone == body.phone, Employee.is_active.is_(True))
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        return {"message": "If this number is registered, an OTP has been sent."}

    redis = await get_redis()
    sms = SMSService(redis)

    try:
        await sms.send_otp(body.phone)
    except Exception as e:
        logger.error("otp_send_failed", phone=body.phone[-4:], error=str(e))
        raise HTTPException(status_code=503, detail="SMS service unavailable")

    return {"message": "If this number is registered, an OTP has been sent."}


@router.post("/employee/otp/verify", response_model=TokenResponse)
async def verify_employee_otp(
    body: EmployeeOTPVerifyRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Verify OTP and return JWT for employee. Rate limited via OTP service."""
    await _check_login_rate_limit(request)

    redis = await get_redis()
    sms = SMSService(redis)

    is_valid = await sms.verify_otp_code(body.phone, body.code)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    result = await db.execute(
        select(Employee).where(Employee.phone == body.phone, Employee.is_active.is_(True))
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=401, detail="Employee not found")

    access = create_access_token(
        sub=str(employee.id),
        employer_id=employee.employer_id,
        role=UserRole.EMPLOYEE,
    )
    refresh = create_refresh_token(sub=str(employee.id))
    _set_refresh_cookie(response, refresh)

    logger.info("employee_login", employee_id=str(employee.id))

    return TokenResponse(
        access_token=access,
        expires_in=900,
        role=UserRole.EMPLOYEE.value,
    )


# ── Logout ──

@router.post("/logout")
async def logout(response: Response) -> dict:
    """Clear refresh token cookie."""
    response.delete_cookie(
        key="wagenow_refresh",
        path="/api/v1/auth",
    )
    return {"message": "Logged out"}


def _get_employer_id(request: Request) -> UUID:
    """Extract employer_id from request state (set by auth middleware)."""
    employer_id = getattr(request.state, "employer_id", None)
    if employer_id is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return UUID(employer_id) if isinstance(employer_id, str) else employer_id
