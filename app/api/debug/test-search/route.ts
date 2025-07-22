// app/api/debug/test-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { embeddingForText } from "@/lib/embedding";
import { qdrant, USERS_COLLECTION, ensureUsersCollection } from "@/lib/qdrant";
import mongoose from "mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: "query required" }, { status: 400 });
        }

        console.log(`🧪 Test search for: "${query}"`);

        // 1. Test embedding
        const vector = await embeddingForText(query);
        console.log(`✅ Embedding created: ${vector.length} dimensions`);

        // 2. Test Qdrant connection
        await ensureUsersCollection();
        const qdrantResults = await qdrant.search(USERS_COLLECTION, {
            vector,
            limit: 5,
            with_payload: true,
        });
        console.log(`✅ Qdrant search results: ${qdrantResults.length} items`);

        // 3. Test MongoDB connection
        await mongoose.connect(process.env.MONGODB_URI!);
        const totalUsers = await User.countDocuments();
        console.log(`✅ MongoDB connected: ${totalUsers} total users`);

        // 4. Test filtering
        const relevantResults = qdrantResults.filter(r => r.score <= 0.5);
        console.log(`✅ Relevant results (score <= 0.5): ${relevantResults.length} items`);

        // 5. Test MongoDB query
        const userIds = relevantResults
            .filter(r => typeof r.payload?._id === "string")
            .map(r => r.payload!._id as string);

        if (userIds.length > 0) {
            // Convert string IDs to ObjectId
            console.log(`🔍 Converting userIds to ObjectIds:`, userIds);
            const objectIds = userIds.map(id => {
                try {
                    return new mongoose.Types.ObjectId(id);
                } catch (error) {
                    console.error(`❌ Invalid ObjectId: ${id}`, error);
                    return null;
                }
            }).filter(Boolean);

            console.log(`🔍 Valid ObjectIds: ${objectIds.length}/${userIds.length}`);

            const users = await User.find({ _id: { $in: objectIds } })
                .select("username displayName interests MBTI")
                .lean();
            console.log(`✅ MongoDB query results: ${users.length} users`);

            return NextResponse.json({
                query,
                qdrantResults: qdrantResults.length,
                relevantResults: relevantResults.length,
                userIds,
                users: users.map(u => ({
                    username: u.username,
                    displayName: u.displayName,
                    interests: u.interests?.map(i => i.interestName) || [],
                    MBTI: u.MBTI
                }))
            });
        } else {
            return NextResponse.json({
                query,
                qdrantResults: qdrantResults.length,
                relevantResults: 0,
                message: "No relevant results found"
            });
        }
    } catch (error: any) {
        console.error("Test search error:", error);
        return NextResponse.json({
            error: "Internal server error",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}