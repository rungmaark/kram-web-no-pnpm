// app/api/debug/qdrant-ids/route.ts
import { NextRequest, NextResponse } from "next/server";
import { embeddingForText } from "@/lib/embedding";
import { qdrant, USERS_COLLECTION, RAW_PROFILE_COLLECTION } from "@/lib/qdrant";

export async function GET(req: NextRequest) {
  try {
    // Get sample vector for search
    const vector = await embeddingForText("test");
    
    // Search in users_vectors
    const userVecRes = await qdrant.search(USERS_COLLECTION, {
      vector,
      limit: 5,
    });
    
    // Search in raw_profile_vectors  
    const rawVecRes = await qdrant.search(RAW_PROFILE_COLLECTION, {
      vector,
      limit: 5,
    });

    return NextResponse.json({
      success: true,
      users_vectors: userVecRes.map(r => ({
        id: r.id,
        score: r.score,
        payload: r.payload
      })),
      raw_profile_vectors: rawVecRes.map(r => ({
        id: r.id,
        score: r.score,
        payload: r.payload
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      error: "Qdrant error",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}