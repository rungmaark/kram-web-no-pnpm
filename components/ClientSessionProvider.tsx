// components/ClientSessionProvider.tsx

"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { CookiesProvider } from "@/app/context/CookiesContext";
import { Session } from "next-auth";

type ClientSessionProviderProps = {
  children: React.ReactNode;
  userId: string;
  username: string;
  displayName: string;
  profileImage?: string;
  gender?: string;
};

const ClientSessionSync = ({ children }: { children: React.ReactNode }) => {
  const { data: session, update } = useSession();

  useEffect(() => {
    const handler = (e: any) => {
      if (!session?.user || !e.detail) return;
      update({
        ...session,
        user: {
          ...session.user,
          ...e.detail, // ต้องมี { profileImage, gender }
        },
      });
    };

    window.addEventListener("kram:update-session", handler);
    return () => window.removeEventListener("kram:update-session", handler);
  }, [session, update]);

  return <>{children}</>;
};

const ClientSessionProvider: React.FC<ClientSessionProviderProps> = ({
  children,
  userId,
  username,
  displayName,
  profileImage,
  gender,
}) => {
  const session: Session = {
    user: {
      id: userId,
      username,
      displayName,
      profileImage: undefined, // ✅ default undefined
      gender: undefined, // ✅ default undefined
      role: "user",
    },
    expires: "", // ใส่วันหมดอายุจริงก็ได้
  };

  return (
    <SessionProvider session={session}>
      <ClientSessionSync>
        <CookiesProvider userId={userId} username={username}>
          {children}
        </CookiesProvider>
      </ClientSessionSync>
    </SessionProvider>
  );
};

export default ClientSessionProvider;
