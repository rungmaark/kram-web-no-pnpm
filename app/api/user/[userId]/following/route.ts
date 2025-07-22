// app/api/user/[userId]/following/route.ts

import { NextRequest, NextResponse } from "next/server";
import Follow from "@/models/Follow";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params; // ⬅️ ต้อง await

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const following = await Follow.find({ follower: userId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("following", "username displayName profileImage gender")
    .lean();

  return NextResponse.json(following.map((f) => f.following));
}
