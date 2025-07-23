// app/api/user-by-username/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const user = await User.findOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
  }).select("-password -__v");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    gender: user.gender,
    bio: user.bio,
    profileImage: user.profileImage,
    instagram: user.instagram,
    facebook: user.facebook,
    twitter: user.twitter,
    linkedin: user.linkedin,
    currentCity: user.currentCity,
    MBTI: user.MBTI,
    relationshipStatus: user.relationshipStatus,
    interests: user.interests,
    rawProfileText: user.rawProfileText,
    careers: user.careers,
    birthYear: user.birthYear
  });
}
