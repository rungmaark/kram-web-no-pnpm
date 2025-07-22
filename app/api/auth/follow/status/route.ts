// app/api/auth/follow/status/route.ts

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Follow from "@/models/Follow";
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const profileId = url.searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    const followerCount = await Follow.countDocuments({ following: profileId });
    const followingCount = await Follow.countDocuments({ follower: profileId });

    const isFollowing = await Follow.exists({
      follower: session.user.id,
      following: profileId,
    });

    return NextResponse.json({
      followerCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (err) {
    console.error("Error in follow/status:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
