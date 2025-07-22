// app/api/auth/post/get/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";
import User, { IUser } from "@/models/User";
import "@/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const uniParam = searchParams.get("university")?.trim();
  const careerParam = searchParams.get("career")?.trim();
  const limit = 10,
    skip = (page - 1) * limit;
  const session = await getServerSession(authOptions);
  const currentId = session?.user?.id;

  const textCond = q
    ? {
        $or: [
          { text: { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } },
        ],
      }
    : null;

  /* ----- ❶ หา userIds จาก University ----- */
  let uniCond: any = null;
  if (uniParam) {
    const uniArr = uniParam
      .split(",")
      .filter(Boolean)
      .map((s) => s.trim());
    const users = await User.find({
      locationTokens: { $in: uniArr.map((u) => new RegExp(`^${u}$`, "i")) },
    })
      .select("_id")
      .lean<{ _id: any }[]>();

    const userIds = users.map((u) => u._id);

    // ไม่มีผู้ใช้ตรงมหา’ลัย → คืนโพสต์ว่างทันที
    if (userIds.length === 0) {
      return NextResponse.json({ posts: [], hasMore: false });
    }

    uniCond = {
      $or: [{ author: { $in: userIds } }, { userId: { $in: userIds } }],
    };
  }

  /* ----- หา userIds จาก Career ----- */
  let careerCond: any = null;
  if (careerParam) {
    const careerArr = careerParam
      .split(",")
      .filter(Boolean)
      .map((s) => s.trim());

    // NOTE: ปรับ field ด้านล่างให้ตรงกับ schema จริงของคุณ
    const usersByCareer = await User.find({
      careers: { $in: careerArr.map((c) => new RegExp(`^${c}$`, "i")) },
    })
      .select("_id")
      .lean<{ _id: any }[]>();

    const careerUserIds = usersByCareer.map((u) => u._id);

    if (careerUserIds.length === 0) {
      return NextResponse.json({ posts: [], hasMore: false });
    }
    careerCond = {
      $or: [
        { author: { $in: careerUserIds } },
        { userId: { $in: careerUserIds } },
      ],
    };
  }

  /* ----- รวมทุกเงื่อนไข ----- */
  const conds = [textCond, uniCond, careerCond].filter(Boolean);
  const query = conds.length > 1 ? { $and: conds } : conds[0] ?? {};

  const raw = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("commentsCount") // ✅ ดึงจำนวนคอมเมนต์
    .lean<IPost[]>({ virtuals: true }); // ✅ ให้ virtual ติดมาด้วย

  /* ---------- ดึง user ของทั้งสองฟิลด์ (author | userId เดิม) ---------- */
  const authorIds = Array.from(
    new Set(
      raw
        .map((p) => (p as any).author ?? (p as any).userId) // post รุ่นเก่า-ใหม่
        .filter(Boolean)
        .map((id) => id.toString())
    )
  );

  const authors: IUser[] = await User.find({ _id: { $in: authorIds } })
    .select("username displayName profileImage gender")
    .lean<IUser[]>();

  const authorMap = new Map(authors.map((u) => [u._id.toString(), u]));

  const posts = raw.map((p) => {
    const ownerId = ((p as any).author ?? (p as any).userId)?.toString() || "";
    const user = authorMap.get(ownerId);

    return {
      _id: p._id.toString(),
      content: (p as any).content ?? p.text ?? "",
      imageUrls: p.images?.map((i) => i.url) ?? [],
      location: p.location ?? null,
      createdAt: p.createdAt,
      author: user
        ? {
            _id: user._id.toString(),
            username: user.username,
            displayName: user.displayName,
            profileImage: user.profileImage ?? null,
            gender: user.gender,
          }
        : null,
      likesCount: p.likes?.length ?? 0,
      commentsCount: (p as any).commentsCount ?? 0,
      likedByMe: currentId
        ? p.likes?.some((id) => id.toString() === currentId)
        : false,
    };
  });

  return NextResponse.json({ posts, hasMore: posts.length === limit });
}
