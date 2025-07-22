// app/api/profile/confirm/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User, { type IUser } from "@/models/User";
import { encrypt } from "@/lib/encrypt";
import { indexUser } from "@/lib/indexProfile";
import { extractIndexData } from "@/models/User";

/* ---------- schema ---------- */
const Body = z.object({
  rawText: z.string().min(5),
  interests: z.array(z.string().min(1)).max(50),
});

export async function POST(req: NextRequest) {
  /* 1) auth */
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* 2) body */
  const body = Body.safeParse(await req.json());
  if (!body.success)
    return NextResponse.json(
      { error: body.error.errors[0].message },
      { status: 400 }
    );

  const { rawText, interests } = body.data;
  console.log("⏩ interests from client =", interests);

  /* 3) db */
  await connectToDatabase();

  /* --- concepts เดิมทุกคำ (30) --- */
  const docWithConcepts = await User.findById(session.user.id)
    .select("concepts")
    .lean<{ concepts?: string[] }>(); // ✅ ระบุ generic
  const concepts: string[] = docWithConcepts?.concepts ?? [];

  /* 1) เตรียม payload ที่ต้องการเซฟ */
  const pickedDocs = [...new Set(interests)].map((i) => ({
    interestName: i,
    category: "custom",
  }));

  /* 2) อัปเดตทีเดียว  */
  await User.updateOne(
    { _id: session.user.id },
    {
      $set: {
        rawProfileText: encrypt(rawText), // เข้ารหัสก่อนเก็บ
        interests: pickedDocs,
      },
    },
    { runValidators: true }
  );

  /* 3) ดึง doc เพื่อ log / re-index */
  const updated = await User.findById(session.user.id);
  console.log(
    "✅ interests in DB =",
    updated?.interests?.map(
      (x: { interestName: string; category: string }) => x.interestName
    )
  );

  if (updated) await indexUser(extractIndexData(updated));

  return NextResponse.json({ ok: true });
}
