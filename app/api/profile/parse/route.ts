// app/api/profile/parse/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { encrypt } from "@/lib/encrypt";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { indexUser } from "@/lib/indexProfile";
import { extractIndexData } from "@/lib/utils/extractIndexData";
// import { indexRawProfile } from "@/lib/indexRawProfile";

/* -------------------- Helper -------------------- */
function safeJsonParse(raw: string): unknown {
  const cleaned = raw.replace(/,\s*]/g, "]");
  return JSON.parse(cleaned);
}

/* -------------------- Schemas -------------------- */
const bodySchema = z.object({
  text: z.string().min(3, "กรุณากรอกข้อมูลอย่างน้อย 3 ตัวอักษร"),
});

const conceptSchema = z.array(z.string().min(1)).max(50);

/* -------------------- OpenAI -------------------- */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* -------------------- Handler -------------------- */
export async function POST(req: NextRequest) {
  /* 1) Auth guard */
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* 2) Validate body */
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const { text } = parsed.data;

  /* 3) Main flow in try–catch */
  try {
    /* 3.1) Call LLM */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      response_format: { type: "json_object" } as const,
      messages: [
        {
          role: "system",
          content:
            'ส่งคืนเพียง JSON array ของ keyword (ภาษาไทยสั้น ≤30 ตัวอักษร) สูงสุด 30 คำ เช่น ["ร้องเพลง","หมา"].' +
            " ห้ามขึ้นบรรทัดใหม่ ห้ามส่ง object หรือ key อื่น",
        },
        { role: "user", content: text },
      ],
    });

    /* 3.2) Parse response */
    const raw = completion.choices[0].message.content ?? "[]";
    console.log("Raw AI response:", raw);
    let json: unknown;
    try {
      json = safeJsonParse(raw);
    } catch {
      return NextResponse.json({ error: "AI ตอบไม่ใช่ JSON" }, { status: 500 });
    }

    let arr = Array.isArray(json)
      ? json
      : (json as any).concepts ??
        (json as any).topics ??
        (json as any)["คำภาษาไทย"] ??
        (json as any).keywords ??
        [];
    const parsedConcepts = conceptSchema.safeParse(arr);
    if (!parsedConcepts.success) {
      return NextResponse.json(
        { error: "ไม่สามารถเข้าใจผลลัพธ์จาก AI ได้" },
        { status: 500 }
      );
    }
    const concepts = parsedConcepts.data;

    if (concepts.length === 0) {
      return NextResponse.json(
        { error: "ไม่สามารถสกัดหัวข้อจากข้อความได้" },
        { status: 500 }
      );
    }

    /* 3.3) Save to DB */
    const encryptedText = encrypt(text);

    await connectToDatabase();
    // แปลงจาก string[] → Array<{ interestName, category }>
    const conceptDocs = concepts.map((kw) => ({
      interestName: kw,
      category: "custom",
    }));
    await UserModel.findByIdAndUpdate(session.user.id, {
      $set: {
        rawProfileText: encryptedText,
        interests: conceptDocs,
      },
    });
    const user = await UserModel.findById(session.user.id).select(
      "+rawProfileText"
    );
    if (user) {
      await indexUser(extractIndexData(user)); // rawProfileText จะถูกส่งไป
      // await indexRawProfile({ userId: user._id.toString(), text });
    }
    if (user) await indexUser(extractIndexData(user));

    /* 4) Success */
    return NextResponse.json({ interests: concepts });
  } catch (err) {
    console.error("profile.parse error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
