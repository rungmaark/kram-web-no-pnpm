// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password, displayName } = await req.json();

    if (!username || !password || !displayName) {
      return NextResponse.json({ error: "❌ Missing fields" }, { status: 400 });
    }

    if (!/^[a-z0-9._!]+$/.test(username)) {
      return NextResponse.json(
        { error: "❌ Username contains invalid characters" },
        { status: 400 }
      );
    }

    const TrimedUsername = username.trim();

    console.log("TrimedUsername:", TrimedUsername);

    await connectToDatabase();

    const existingUser = await User.findOne({ username: TrimedUsername });
    if (existingUser) {
      return NextResponse.json(
        { error: "❌ This username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: TrimedUsername,
      displayName,
      password: hashedPassword,
      email: undefined,
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { username: newUser.username, displayName: newUser.displayName },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "❌ Internal Server Error" },
      { status: 500 }
    );
  }
}
