// app/layout.tsx

import { Kanit } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";
import ThemeProvider from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import NextAuthSessionProvider from "./providers/session-provider";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  variable: "--font-kanit",
});
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ดึง session จาก NextAuth
  const session = await getServerSession(authOptions);

  // ✅ เขียน optional chaining ติดกัน, ประกาศครั้งเดียว
  const userId = session?.user?.id ?? "";
  const theme = session?.user?.theme || "system";

  return (
    <html lang="th" className={`${kanit.variable} ${theme === "dark" ? "dark" : ""}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="antialiased font-kanit">
        <NextAuthSessionProvider>
          <ThemeProvider>
            {children}
            <CookieConsent userId={userId} />
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
