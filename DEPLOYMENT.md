# WageNow Deployment Guide

> Frontend: **Vercel** (free) | Backend: **Railway** ($5 trial) | Database: **Supabase** (free)
> Alternative backend: **Render** (free tier)

---

## Quick Start: Push to GitHub

```bash
# 1. Initialize git (if not already)
cd wagenow
git init
git branch -M main

# 2. Create GitHub repo (using GitHub CLI)
gh repo create wagenow --private --source=. --remote=origin

# 3. Push
git add -A
git commit -m "Initial commit: WageNow EWA platform"
git push -u origin main
```

If you don't have `gh` CLI, create the repo at github.com/new and then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/wagenow.git
git push -u origin main
```

---

## Step 1: Supabase (Database)

Your Supabase project is already created.

### Run SQL migrations

Go to **Supabase Dashboard** > **SQL Editor** and run these files **in order**:

1. `supabase/migrations/001_core_schema.sql` — tables + triggers
2. `supabase/migrations/002_rls.sql` — row-level security policies
3. `supabase/migrations/003_indexes.sql` — performance indexes

### Get your secrets

From **Settings** > **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_KEY`
- `JWT Secret` → `SUPABASE_JWT_SECRET`

From **Settings** > **Database** > **Connection string** (URI tab):
- Copy the URI → `DATABASE_URL`

**Important**: If your DB password contains `?` or `#`, they must be URL-encoded in the connection string:
`?` → `%3F`, `#` → `%23`, `@` → `%40`

---

## Step 2: Deploy Backend

### Option A: Railway (recommended)

1. Go to [railway.app](https://railway.app) → sign in with GitHub
2. **New Project** → **Deploy from GitHub Repo** → select your repo
3. Set **Root Directory**: `apps/api`
4. Railway detects the `Dockerfile` automatically

**Add Redis**: Click **+ New** → **Database** → **Redis**

**Set environment variables** (API service → Variables tab):

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<openssl rand -hex 32>
ENCRYPTION_KEY=<python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
SUPABASE_SERVICE_KEY=<from Supabase>
SUPABASE_JWT_SECRET=<from Supabase → Settings → API → JWT Secret>
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=["https://your-app.vercel.app"]
PORT=8000
```

**Verify**: Visit `https://your-railway-url/api/v1/health`

### Option B: Render (free tier)

1. Go to [render.com](https://render.com) → sign in with GitHub
2. **New** → **Web Service** → connect your repo
3. Settings:
   - **Root Directory**: `apps/api`
   - **Runtime**: Docker
   - **Instance Type**: Free
4. Add the same environment variables as Railway above
5. Add a free **Redis** instance: **New** → **Redis**

---

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. **Add New** → **Project** → import your repo
3. Set **Root Directory**: `apps/web`
4. Framework: **Next.js** (auto-detected)

**Set environment variables** (Settings → Environment Variables):

```
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
SUPABASE_SERVICE_KEY=<from Supabase>
```

**Deploy** — Vercel builds and deploys automatically on every push.

---

## Step 4: Post-Deploy

1. **Update CORS**: In Railway/Render, set `CORS_ORIGINS` to your Vercel URL:
   ```
   CORS_ORIGINS=["https://your-app.vercel.app"]
   ```

2. **Run Supabase migrations** if you haven't (Step 1)

3. **Test the flow**:
   - Register an employer at `/register`
   - Login at `/login`
   - Verify dashboard loads with the "API backend not reachable" banner gone
   - Add employees via CSV upload

---

## Architecture

```
[Browser] → [Vercel / Next.js 16]
                  ↓ /api/v1/* (rewrite)
            [Railway / FastAPI]
                  ↓ queries
            [Supabase / PostgreSQL]
                  ↓ cache + OTP
            [Railway / Redis]
```

The Next.js app rewrites `/api/v1/*` requests to the FastAPI backend URL. This means:
- **Development**: API calls go to `http://localhost:8000`
- **Production**: API calls go to your Railway/Render URL

---

## Local Development

```bash
# Terminal 1: Start local DB + Redis
docker compose up -d

# Terminal 2: Start backend
cd apps/api
pip install -e ".[dev]"
# Run migrations
alembic upgrade head
# Start server
uvicorn src.main:app --reload --port 8000

# Terminal 3: Start frontend
cd apps/web
pnpm install
pnpm dev
```

Open http://localhost:3000

---

## Free Tier Limits

| Service   | Plan         | Limits                                      |
|-----------|------------- |---------------------------------------------|
| Vercel    | Hobby (free) | 100 GB bandwidth, serverless functions      |
| Railway   | Trial        | $5 free credit, then $5/mo hobby            |
| Render    | Free         | 750 hrs/mo, spins down after 15 min idle    |
| Supabase  | Free         | 500 MB DB, 1 GB storage, 50k monthly users  |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Invalid credentials" on login | Run SQL migrations in Supabase (Step 1) |
| 500 errors on API calls | Check Railway/Render logs. Verify `DATABASE_URL` encoding |
| CORS errors in browser | Update `CORS_ORIGINS` to match your exact Vercel URL |
| Supabase "Tenant not found" | Your Supabase project is paused. Restore it from the dashboard |
| Dashboard keeps refreshing | Clear cookies + localStorage, re-login |
| Backend health shows `"db": "fail"` | Check `DATABASE_URL` and that Supabase DB is unpaused |
