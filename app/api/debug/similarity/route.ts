// app/api/debug/similarity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { embeddingForText } from "@/lib/embedding";
import { qdrant, RAW_PROFILE_COLLECTION, ensureRawProfileCollection } from "@/lib/qdrant";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    await ensureRawProfileCollection();

    // สร้าง embedding สำหรับ query
    const vector = await embeddingForText(query);

    // ค้นหาใน raw_profile_vectors
    const results = await qdrant.search(RAW_PROFILE_COLLECTION, {
      vector,
      limit: 10,
      with_payload: true,
    });

    // แสดงผลลัพธ์พร้อม similarity score
    const detailedResults = results.map(r => ({
      userId: r.payload?.userId,
      score: r.score,
      similarity: 1 - r.score, // แปลง cosine distance เป็น similarity
      isRelevant: r.score <= 0.5, // threshold
    }));

    return NextResponse.json({
      query,
      results: detailedResults,
      threshold: 0.5,
      explanation: "Cosine distance: ยิ่งต่ำยิ่งใกล้เคียง, Similarity: ยิ่งสูงยิ่งใกล้เคียง"
    });
  } catch (error: any) {
    console.error("Similarity debug error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}