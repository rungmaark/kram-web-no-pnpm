// app/api/simple-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { embeddingForText } from "@/lib/embedding";
import { qdrant, USERS_COLLECTION, RAW_PROFILE_COLLECTION } from "@/lib/qdrant";
import mongoose from "mongoose";
import User from "@/models/User";
import { calculateEnhancedSemanticRelevance } from "@/lib/ultraStrictSemanticAnalyzer";
import { decrypt } from "@/lib/encrypt";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    console.log(`🔍 Simple Semantic Search for: "${query}"`);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);

    // Create query embedding
    const vector = await embeddingForText(query);
    if (!vector || vector.length !== 1536) {
      return NextResponse.json({ error: "Invalid embedding" }, { status: 500 });
    }

    // Search in both collections
    const [userResults, rawResults] = await Promise.all([
      qdrant.search(USERS_COLLECTION, { vector, limit: 30 }),
      qdrant.search(RAW_PROFILE_COLLECTION, { vector, limit: 30 })
    ]);

    // Merge results
    const mergeMap = new Map<string, number>();
    
    userResults.forEach(result => {
      if (result.payload?._id) {
        mergeMap.set(result.payload._id, Math.min(mergeMap.get(result.payload._id) || 1, result.score));
      }
    });

    rawResults.forEach(result => {
      if (result.payload?.userId) {
        mergeMap.set(result.payload.userId, Math.min(mergeMap.get(result.payload.userId) || 1, result.score));
      }
    });

    console.log(`📊 Found ${mergeMap.size} candidate users`);

    if (mergeMap.size === 0) {
      return NextResponse.json({ users: [] });
    }

    // Fetch user profiles
    const userIds = Array.from(mergeMap.keys());
    const users = await User.find({ _id: { $in: userIds } })
      .select("interests bio rawProfileText username displayName profileImage MBTI gender birthYear")
      .lean();

    // Calculate semantic relevance
    const userScores = await Promise.all(
      users.map(async (user: any) => {
        const vectorScore = mergeMap.get(user._id.toString()) || 1;
        
        try {
          const decryptedText = user.rawProfileText ? decrypt(user.rawProfileText) : "";
          const interests = user.interests?.map((i: any) => i.interestName || i) || [];
          
          const semanticScore = await calculateEnhancedSemanticRelevance(query, {
            interests,
            bio: user.bio || "",
            rawProfileText: decryptedText
          });

          // Simple scoring: combine vector and semantic scores
          const finalScore = (1 - vectorScore) * 0.4 + semanticScore * 0.6;

          return {
            user,
            vectorScore,
            semanticScore,
            finalScore
          };
        } catch (error) {
          console.error(`Error processing user ${user._id}:`, error);
          return {
            user,
            vectorScore,
            semanticScore: 0,
            finalScore: (1 - vectorScore) * 0.5
          };
        }
      })
    );

    // Simple filtering and ranking
    const isSpecificQuery = query.length <= 10 && !query.includes(' ');
    const semanticThreshold = isSpecificQuery ? 0.6 : 0.4;
    const finalScoreThreshold = isSpecificQuery ? 0.5 : 0.3;

    const filteredUsers = userScores
      .filter(item => 
        item.semanticScore >= semanticThreshold || 
        item.finalScore >= finalScoreThreshold
      )
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 20);

    console.log(`✅ Filtered to ${filteredUsers.length} relevant users`);

    // Prepare response
    const results = filteredUsers.map(item => ({
      ...item.user,
      _debug: {
        vectorScore: item.vectorScore,
        semanticScore: item.semanticScore,
        finalScore: item.finalScore
      }
    }));

    return NextResponse.json({
      users: results,
      debug: {
        query,
        totalCandidates: mergeMap.size,
        filteredCount: filteredUsers.length,
        thresholds: {
          semantic: semanticThreshold,
          finalScore: finalScoreThreshold
        }
      }
    });

  } catch (error: any) {
    console.error("❌ Simple Search API error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}