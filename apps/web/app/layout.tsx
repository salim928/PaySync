import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["200", "300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WageNow — Earned Wage Access for the Modern Workforce",
    template: "%s | WageNow",
  },
  description:
    "Give employees real-time access to wages they've already accrued. No loans. No interest. Disbursed to mobile wallets in ~90 seconds.",
  metadataBase: new URL("https://wagenow.com.gh"),
  manifest: "/manifest.json",
  openGraph: {
    siteName: "WageNow",
    type: "website",
    locale: "en_GH",
  },
};

export const viewport: Viewport = {
  themeColor: "#18160f",
};

import { AuthProvider } from "@/lib/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="font-(family-name:--font-dm-sans)">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
