// lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Attempting to authorize user:", credentials?.username);
          
          if (!credentials?.username || !credentials?.password) {
            console.log("❌ Missing credentials");
            throw new Error("Missing username or password");
          }

          await connectToDatabase();
          console.log("✅ Connected to database");
          
          const user = await User.findOne({ username: credentials.username });
          if (!user) {
            console.log("❌ User not found:", credentials.username);
            throw new Error("User not found");
          }

          console.log("✅ User found:", user.username);

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            console.log("❌ Invalid password for user:", credentials.username);
            throw new Error("Invalid password");
          }

          console.log("✅ Password valid, authorizing user");

          return {
            id: user._id.toString(),
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            profileImage: user.profileImage ?? null,
            gender: user.gender ?? null,
          } as any;
        } catch (error) {
          console.error("❌ Authorization error:", error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.displayName = (user as any).displayName;
        token.role = (user as any).role;
        token.profileImage = (user as any).profileImage ?? null;
        token.gender = (user as any).gender ?? null;
      }

      /* ② ทุกครั้งที่ client เรียก updateSession() */
      if (trigger === "update" && session) {
        token.displayName = session.displayName ?? token.displayName;
        token.profileImage = session.profileImage ?? token.profileImage;
        token.gender = session.gender ?? token.gender;
        // ถ้ามีฟิลด์อื่นที่อยากอัปเดต เพิ่มได้ตรงนี้
      }
      return token;
    },

    async session({ session, token }) {
      
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.displayName = token.displayName as string;
        session.user.profileImage = token.profileImage ?? undefined;
        session.user.gender = token.gender ?? undefined;
        session.user.role = token.role as "user" | "admin";
      }
      
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
