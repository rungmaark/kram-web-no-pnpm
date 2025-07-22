// app/api/auth/post/by-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";
import User, { IUser } from "@/models/User";
import "@/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const [rawPosts, user] = await Promise.all([
    Post.find({ $or: [{ author: userId }, { userId }] })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("commentsCount")
      .lean<IPost[]>({ virtuals: true }),
    User.findById(userId)
      .select("username displayName gender profileImage")
      .lean<IUser>(),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const posts = rawPosts.map((p) => ({
    _id: p._id.toString(),
    content: (p as any).content ?? (p as any).text ?? "",
    imageUrls: p.images?.map((img) => img.url) ?? [],
    location: p.location ?? null,
    createdAt: p.createdAt,
    author: {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage ?? null,
      gender: user.gender,
    },
    likesCount: p.likesCount ?? p.likes?.length ?? 0,
    commentsCount: (p as any).commentsCount ?? 0,
    likedByMe: currentUserId
      ? p.likes?.some((id: any) => id.toString() === currentUserId)
      : false,
  }));

  return NextResponse.json({ posts, hasMore: posts.length === limit });
}
