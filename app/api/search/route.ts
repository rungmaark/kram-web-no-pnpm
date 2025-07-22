// app/api/search/route.ts (เวอร์ชันใหม่: no vector, pure GPT)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { decrypt } from "@/lib/encrypt";
import {
  calculateEnhancedSemanticRelevance,
  extractSemanticConcepts,
} from "@/lib/ultraStrictSemanticAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query)
      return NextResponse.json({ error: "query required" }, { status: 400 });

    console.log(`🧠 Pure Semantic Search for: "${query}"`);

    // ── Pre-normalize “SPU” / “ม.ศรีปทุม” ─────────────────────
    const normalizedQuery = query
      .replace(/SPU/gi, "มหาวิทยาลัยศรีปทุม")
      .replace(/ม\.?ศรีปทุม/gi, "มหาวิทยาลัยศรีปทุม");
    console.log(`ℹ️ Normalized query: "${normalizedQuery}"`);

    await mongoose.connect(process.env.MONGODB_URI!);

    // 1. อ่าน users ทั้งหมด
    let users = await User.find()
      .select(
        "username displayName profileImage bio interests rawProfileText gender relationshipStatus locationTokens MBTI birthYear"
      )
      .lean();

    console.log(`🔍 Total users loaded: ${users.length}`);

    // 2. สกัด concepts ดูว่ามีคำสั่งหา gender เฉพาะหรือไม่ (male,female,gay,lesbian,bisexual,transgender)
    const { primaryConcepts } = await extractSemanticConcepts(normalizedQuery);
    const genderMap: Record<string, string> = {
      male: "male",
      ชาย: "male",
      หนุ่ม: "male",
      female: "female",
      หญิง: "female",
      สาว: "female",
      gay: "gay",
      เกย์: "gay",
      lesbian: "lesbian",
      เลสเบี้ยน: "lesbian",
      เลส: "lesbian",
      bisexual: "bisexual",
      ไบเซ็กชวล: "bisexual",
      ไบ: "bisexual",
      transgender: "transgender",
      ทรานส์เจนเดอร์: "transgender",
      ทรานส์: "transgender",
    };
    const matchedGenders = Array.from(
      new Set(
        primaryConcepts.map((c) => genderMap[c.toLowerCase()]).filter(Boolean)
      )
    );
    if (matchedGenders.length > 0) {
      users = users.filter((u) => matchedGenders.includes(u.gender));
      console.log(`🔍 After gender filter: ${users.length}`);
    }

    // 2.1 สกัดสถานะความสัมพันธ์จาก primaryConcepts
    const statusMap: Record<string, string> = {
      single: "single",
      โสด: "single",
      ไม่มีแฟน: "single",
      taken: "taken",
      แฟน: "taken",
      ไม่โสด: "taken",
      มีเจ้าของ: "taken",
      married: "married",
      แต่งงาน: "married",
      fwb: "fwb",
    };
    const matchedStatuses = Array.from(
      new Set(
        primaryConcepts.map((c) => statusMap[c.toLowerCase()]).filter(Boolean)
      )
    );
    if (matchedStatuses.length > 0) {
      users = users.filter((u) =>
        matchedStatuses.includes(u.relationshipStatus?.toLowerCase() || "")
      );
      console.log(`🔍 After relationshipStatus filter: ${users.length}`);
    }

    // 3. คำนวณ semantic score ทีละ user
    const relevanceResults = await Promise.all(
      users.map(async (user: any) => {
        try {
          const decryptedText = user.rawProfileText
            ? decrypt(user.rawProfileText)
            : "";

          const interests =
            user.interests?.map((i: any) => i.interestName || i) || [];

          const userProfile = {
            interests,
            bio: user.bio || "",
            rawProfileText: decryptedText,
            gender: user.gender,
            displayName: user.displayName,
            username: user.username,
            mbti: user.MBTI,
            birthYear: user.birthYear,
            relationshipStatus: user.relationshipStatus,
            locationTokens: user.locationTokens,
          };

          let semanticScore = await calculateEnhancedSemanticRelevance(
            normalizedQuery,
            userProfile
          );

          if (
            user.displayName &&
            user.displayName.toLowerCase().includes(query.toLowerCase())
          ) {
            semanticScore += 0.5; // หรือจะใช้ Math.min(1, semanticScore + 0.3)
          }

          return { user, semanticScore };
        } catch {
          return null;
        }
      })
    );

    // 4. กรอง by semanticScore ≥ 0.6 แล้ว sort
    const filtered = relevanceResults
      .filter(Boolean)
      .filter((item) => item!.semanticScore >= 0.6)
      .sort((a, b) => b!.semanticScore - a!.semanticScore)
      .slice(0, 20);

    console.log(`✅ Found ${filtered.length} matching users`);

    const results = filtered.map((item) => ({
      ...item!.user,
      _debug: { semanticScore: item!.semanticScore },
    }));

    return NextResponse.json({ users: results, debug: { query } });
  } catch (error: any) {
    console.error("Internal error", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown" },
      { status: 500 }
    );
  }
}
