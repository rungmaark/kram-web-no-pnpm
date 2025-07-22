// app/api/auth/post/create/route.ts

import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/Post";
import { uploadBufferToS3 } from "@/lib/uploadToS3";

export const runtime = "nodejs";      // ต้องใช้ Node runtime (ไม่ใช่ edge)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const text = String(form.get("content") ?? "");
  const location = String(form.get("location") ?? "");

  // ----- อัปโหลดรูปทั้งหมด -----
  const files = form.getAll("images") as File[];
  const images = [];

  for (const file of files) {
    // สร้าง buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // สร้าง key
    const ext = file.type.split("/")[1] || "jpg";
    const key = `posts/${session.user.id}/${uuid()}.${ext}`;

    // อัปโหลด
    await uploadBufferToS3(buffer, key, file.type);

    images.push({
      key,
      url: `/api/image?key=${encodeURIComponent(key)}`,
    });
  }

  // ----- บันทึกลง MongoDB -----
  await connectToDatabase();
  const newPost = await Post.create({
    userId: session.user.id,
    text,
    location,
    images,
  });

  return Response.json({ post: newPost }, { status: 201 });
}