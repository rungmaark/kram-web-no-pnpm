// app/api/debug/simple-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { embeddingForText } from "@/lib/embedding";
import { qdrant, USERS_COLLECTION, ensureUsersCollection } from "@/lib/qdrant";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    console.log(`🧪 Simple search test for: "${query}"`);

    // 1. ตรวจสอบ collection
    console.log("1. ตรวจสอบ collection...");
    await ensureUsersCollection();
    
    const collections = await qdrant.getCollections();
    const hasUsersCollection = collections.collections.find(c => c.name === USERS_COLLECTION);
    console.log(`Collection ${USERS_COLLECTION} exists:`, !!hasUsersCollection);

    if (!hasUsersCollection) {
      return NextResponse.json({
        error: "users_vectors collection not found",
        availableCollections: collections.collections.map(c => c.name)
      }, { status: 404 });
    }

    // 2. ตรวจสอบจำนวน points
    console.log("2. ตรวจสอบจำนวน points...");
    let pointsCount = 0;
    try {
      const countResult = await qdrant.count(USERS_COLLECTION);
      pointsCount = countResult.count;
      console.log(`Points count: ${pointsCount}`);
    } catch (countError) {
      console.error("Error counting points:", countError);
      return NextResponse.json({
        error: "Failed to count points",
        details: countError.message
      }, { status: 500 });
    }

    if (pointsCount === 0) {
      return NextResponse.json({
        error: "No points found in users_vectors collection",
        suggestion: "Run POST /api/dev/sync-users-to-qdrant to index users"
      }, { status: 404 });
    }

    // 3. สร้าง embedding
    console.log("3. สร้าง embedding...");
    const vector = await embeddingForText(query);
    console.log(`Embedding dimensions: ${vector.length}`);

    if (vector.length !== 1536) {
      return NextResponse.json({
        error: "Invalid embedding dimensions",
        expected: 1536,
        actual: vector.length
      }, { status: 500 });
    }

    // 4. ทดสอบ search แบบง่าย (ไม่มี filter)
    console.log("4. ทดสอบ basic search...");
    try {
      const basicResults = await qdrant.search(USERS_COLLECTION, {
        vector,
        limit: 5,
        with_payload: true,
      });
      
      console.log(`Basic search results: ${basicResults.length} items`);
      
      return NextResponse.json({
        success: true,
        query,
        pointsCount,
        resultsCount: basicResults.length,
        results: basicResults.map(r => ({
          id: r.id,
          score: r.score,
          userId: r.payload?._id,
          username: r.payload?.username,
          interests: r.payload?.interests?.slice(0, 3) // แค่ 3 อันแรก
        })),
        explanation: "Basic search without filters works!"
      });

    } catch (searchError: any) {
      console.error("Search error:", searchError);
      
      return NextResponse.json({
        error: "Search failed",
        details: {
          message: searchError.message,
          status: searchError.status,
          url: searchError.url,
          data: searchError.data
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Simple search test error:", error);
    return NextResponse.json({
      error: "Test failed",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}