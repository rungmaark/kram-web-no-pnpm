// app/api/auth/check-google-user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { generateUsername } from "@/lib/utils/generateUsername";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!session || !email) {
    return NextResponse.json({ case: "unauthenticated" });
  }
  console.log("🔍 Session from check-google-user:", session?.user);

  await connectToDatabase();
  const user = await User.findOne({ email });

  if (user) {
    return NextResponse.json({ case: "existing", username: user.username });
  }

  // build a displayName fallback
  const displayName =
    session.user.displayName ??
    (session.user as any).name ?? // NextAuth’s default
    email.split("@")[0]; // email-prefix

  // now generate a username that won't collide
  const username = await generateUsername(email.split("@")[0]);

  const newUser = new User({
    email,
    username,
    displayName,
  });
  await newUser.save();

  return NextResponse.json({ case: "created", username });
}
