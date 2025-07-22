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

    await mongoose.connect(process.env.MONGODB_URI!);

    // 1. อ่าน users ทั้งหมด
    let users = await User.find()
      .select(
        "username displayName profileImage bio interests rawProfileText gender relationshipStatus locationTokens MBTI birthYear"
      )
      .lean();

    console.log(`🔍 Total users loaded: ${users.length}`);

    // 2. สกัด concepts ดูว่ามีคำสั่งหา gender เฉพาะหรือไม่ (male,female,gay,lesbian,bisexual,transgender)
    const { primaryConcepts } = await extractSemanticConcepts(query);
    const genderMap: Record<string, string> = {
      male: "male",
      ชาย: "male",
      female: "female",
      หญิง: "female",
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
            relationshipStatus: user.relationshipStatus,
            locationTokens: user.locationTokens,
          };

          const semanticScore = await calculateEnhancedSemanticRelevance(
            query,
            userProfile
          );
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
