// app/api/auth/post/[postId]/get/route.ts

import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: any // ❌ **เอา type ออก ให้เป็น any**
) {
  await connectToDatabase();
  const postId = params.postId;

  const post = await Post.findById(postId).populate(
    "author",
    "username displayName profileImage gender"
  );

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    _id: post._id,
    content: post.content,
    imageUrls: post.imageUrls,
    location: post.location,
    createdAt: post.createdAt,
    likesCount: post.likes.length,
    likedByMe: false,
    author: post.author,
  });
}
