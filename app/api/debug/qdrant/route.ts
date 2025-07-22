// app/api/debug/qdrant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { qdrant, RAW_PROFILE_COLLECTION, USERS_COLLECTION } from "@/lib/qdrant";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบ collections
    const collections = await qdrant.getCollections();
    
    // ตรวจสอบจำนวนข้อมูลใน raw_profile_vectors
    let rawProfileInfo = null;
    try {
      rawProfileInfo = await qdrant.getCollection(RAW_PROFILE_COLLECTION);
    } catch (e) {
      rawProfileInfo = { error: "Collection not found" };
    }

    // ตรวจสอบจำนวนข้อมูลใน users_vectors
    let usersInfo = null;
    try {
      usersInfo = await qdrant.getCollection(USERS_COLLECTION);
    } catch (e) {
      usersInfo = { error: "Collection not found" };
    }

    // ดึงตัวอย่างข้อมูลจาก raw_profile_vectors
    let rawSamples = [];
    try {
      const scrollResult = await qdrant.scroll(RAW_PROFILE_COLLECTION, {
        limit: 5,
        with_payload: true,
      });
      rawSamples = scrollResult.points;
    } catch (e) {
      rawSamples = { error: e.message };
    }

    return NextResponse.json({
      collections: collections.collections.map(c => ({ name: c.name })),
      rawProfileCollection: rawProfileInfo,
      usersCollection: usersInfo,
      rawProfileSamples: rawSamples,
    });
  } catch (error) {
    console.error("Debug Qdrant error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}