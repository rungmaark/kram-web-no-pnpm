// types/next.d.ts

export type NextApiResponseServerIO = {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

import { DefaultSession } from "next-auth";
import { DefaultJWT, JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      displayName: string;
      profileImage?: string;
      gender?: string;
      role: "user" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    displayName: string;
    username: string;
    role: "user" | "admin";
    profileImage?: string;
    gender?: string;
  }
}
