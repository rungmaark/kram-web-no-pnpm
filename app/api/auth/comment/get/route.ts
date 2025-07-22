// app/api/auth/comment/get/route.ts
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Comment from "@/models/Comment";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return new Response("postId required", { status: 400 });

  let page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  if (isNaN(page) || page < 1) page = 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const raws = await Comment.find({ postId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "username displayName profileImage gender")
    .lean();

  const comments = raws.map((c: any) => ({
    _id: c._id.toString(),
    text: c.text,
    createdAt: c.createdAt,
    author: {
      username: c.userId.username,
      displayName: c.userId.displayName,
      profileImage: c.userId.profileImage,
      gender: c.userId.gender,
    },
  }));

  return Response.json({ comments, hasMore: comments.length === limit });
}
