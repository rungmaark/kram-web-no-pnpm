// app/api/auth/follow/toggle/route.ts

import { getServerSession } from "next-auth";
import Follow from "@/models/Follow";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const myId = session.user?.id;
      if (!myId) {
        return NextResponse.json({ error: "User ID missing" }, { status: 400 });
      }
  
      const { targetUserId } = await req.json();
      const existing = await Follow.findOne({
        follower: myId,
        following: targetUserId,
      });
  
      if (existing) {
        await existing.deleteOne();
      } else {
        await Follow.create({ follower: myId, following: targetUserId });
      }
  
      const followerCount = await Follow.countDocuments({
        following: targetUserId,
      });
      const isFollowing = !existing;
  
      return NextResponse.json({ isFollowing, followerCount });
    } catch (err) {
      console.error("Error in follow/toggle:", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  