// app/layout.tsx

import { Kanit } from "next/font/google";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";
import CookieConsent from "@/components/CookieConsent";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

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
  const username = session?.user?.username ?? "";
  const displayName = session?.user?.displayName ?? "";
  const profileImage = session?.user?.profileImage ?? ""
  const gender = session?.user?.gender ?? ""

  return (
    <html lang="th" className={kanit.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="antialiased font-kanit">
        <SessionWrapper userId={userId} username={username} displayName={displayName} profileImage={profileImage} gender={gender}>
          {children}
          <CookieConsent userId={userId} />
        </SessionWrapper>
      </body>
    </html>
  );
}
