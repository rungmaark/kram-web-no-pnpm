// lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { IUser } from "@/models/User";
import User from "@/models/User";
import { clientPromise } from "./mongodbClient";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { generateUsername } from "./utils/generateUsername";

await connectToDatabase();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log(
            "🔐 Attempting to authorize user:",
            credentials?.username
          );

          if (!credentials?.username || !credentials?.password) {
            console.log("❌ Missing credentials");
            throw new Error("Missing username or password");
          }

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
      authorization: { params: { prompt: "select_account" } },
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
    signIn: "/signin",
    error: "/signin",
    newUser: "/auth/redirect",
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      const u = user as any;

      // ไม่ต้องทำอะไรถ้าไม่ใช่ Google
      if (account?.provider !== "google") return true;

      console.log("👀 Google →", {
        sub: account.providerAccountId,
        email: (user as any).email,
        name: user.name,
      });

      const email = (user as any).email?.toLowerCase();

      // ถ้า Google ไม่ส่ง email (rare) ให้ผ่านไปก่อน
      if (!email) return true;

      // match เฉพาะ doc ที่มี email และตรงเป๊ะ
      const existingUser = await User.findOne({
        email: { $exists: true, $eq: email },
      });

      return true;
    },
    async jwt({ token, user }) {
      // --- ❶ มี user มา → เพิ่ง login
      if (user) {
        const u = user as any;

        const dbUser: any = u.email
          ? (await User.findOne({ email: u.email }).lean()) ?? u
          : (await User.findById(u.id).lean()) ?? u; // 🔑 fall-back ด้วย _id

        // 2) เอา _id (MongoDB) ให้ sub/id ของ token แน่นอน
        const mongoId = (dbUser._id ?? dbUser.id ?? u.id).toString();
        token.sub = mongoId;
        token.id = mongoId;
        token.username = dbUser.username ?? null;
        token.displayName = dbUser.displayName ?? u.name ?? null;
        token.role = dbUser.role ?? "user";
        token.profileImage = dbUser.profileImage ?? null;
        token.gender = dbUser.gender ?? null;
        token.email = dbUser.email;
      }

      if (!user && token?.email) {
        const dbUser = await User.findOne({ email: token.email }).lean<IUser>();
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username ?? null;
          token.displayName = dbUser.displayName ?? null;
          token.role = dbUser.role ?? "user";
          token.profileImage = dbUser.profileImage ?? undefined;
          token.gender = dbUser.gender ?? undefined;
        }
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
        session.user.email = token.email as string;
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};
