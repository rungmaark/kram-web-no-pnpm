// components/SessionWrapper.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import ClientSessionProvider from "./ClientSessionProvider";
import { AuthContext } from "@/lib/auth-context";
import type { MinimalUser } from "@/types/User";
import { getSession } from "next-auth/react";

export default function SessionWrapper({
  children,
  userId,
  username,
  displayName,
  profileImage,
  gender,
}: {
  children: React.ReactNode;
  userId: string;
  username: string;
  displayName: string;
  profileImage?: string;
  gender?: string;
}) {
  // ① ค่าเริ่มต้น
  const initialUser: MinimalUser | null = useMemo(() => {
    if (userId && username) {
      return { userId, username, displayName, profileImage, gender };
    }
    return null;
  }, [userId, username, displayName, profileImage, gender]);

  // ② local state ไว้อัปเดตภายหลัง (เช่นหลังแก้โปรไฟล์)
  const [user, setUser] = useState<MinimalUser | null>(initialUser);

  /* ---------- ③ ฟัง broadcast ของ NextAuth ---------- */
  useEffect(() => {
    const channel = new BroadcastChannel("nextauth.message");

    const handler = (event: MessageEvent) => {
      if (event?.data?.event !== "session") return;

      const session = event.data?.data; // อาจเป็น null ถ้า sign-out
      if (session?.user) {
        const { id, username, displayName, profileImage, gender } =
          session.user;

        setUser({
          userId: id,
          username,
          displayName,
          profileImage: profileImage ?? undefined,
          gender: gender ?? undefined,
        });
      } else {
        setUser(null); // signed-out
      }
    };

    channel.addEventListener("message", handler);
    return () => channel.close();
  }, []);

  /* ---------- ④ optional: refetch เมื่อตัว tab กลับมา active ---------- */
  useEffect(() => {
    const onFocus = () => {
      getSession().then((s) => {
        if (s?.user) {
          const { id, username, displayName, profileImage, gender } = s.user;
          setUser({ userId: id, username, displayName, profileImage, gender });
        } else {
          setUser(null);
        }
      });
    };
    window.addEventListener("visibilitychange", onFocus);
    return () => window.removeEventListener("visibilitychange", onFocus);
  }, []);

  return (
    <ClientSessionProvider
      userId={userId}
      username={username}
      displayName={displayName}
      profileImage={profileImage}
      gender={gender}
    >
      {/* ③ ส่ง object ที่ถูกต้องเข้า Provider */}
      <AuthContext.Provider value={{ user, setUser }}>
        {children}
      </AuthContext.Provider>
    </ClientSessionProvider>
  );
}
