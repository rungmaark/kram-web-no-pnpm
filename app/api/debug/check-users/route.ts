// app/api/debug/check-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json();
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "userIds array required" }, { status: 400 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    // Check each user ID
    const results = [];
    for (const userId of userIds) {
      try {
        const objectId = new mongoose.Types.ObjectId(userId);
        const user = await User.findById(objectId).select("username displayName interests MBTI").lean();
        results.push({
          userId,
          exists: !!user,
          user: user ? {
            username: user.username,
            displayName: user.displayName,
            interests: user.interests?.map(i => i.interestName) || [],
            MBTI: user.MBTI
          } : null
        });
      } catch (error) {
        results.push({
          userId,
          exists: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Check users error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}