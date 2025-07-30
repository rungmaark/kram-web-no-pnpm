// // scripts/repopulateVectors.ts
// import dotenv from "dotenv";
// dotenv.config();

// import mongoose from "mongoose";
// import { v5 as uuidv5 } from "uuid";
// import { indexUser } from "../lib/indexProfile";
// import { indexRawProfile } from "../lib/indexRawProfile";
// import { decrypt } from "../lib/encrypt";

// const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

// async function repopulateVectors() {
//   try {
//     console.log("🚀 Starting vector repopulation...");

//     // Connect to MongoDB (same as API)
//     await mongoose.connect(process.env.MONGODB_URI!);
//     console.log("✅ Connected to MongoDB");
//     console.log(`🔍 Database name: ${mongoose.connection.db?.databaseName}`);

//     // Switch to Kram database (same as API)
//     const kramDb = (mongoose.connection as any).client.db("Kram");
//     console.log(`🔍 Switched to database: Kram`);

//     // Fetch all users from Kram database
//     const users = await kramDb.collection("users").find({}).toArray();
//     console.log(`📊 Raw users from Kram DB:`, users.length);

//     // Filter out users without required fields
//     const validUsers = users.filter((user: any) => user.username && user._id);
//     console.log(`📊 Valid users after filtering:`, validUsers.length);

//     console.log(`📊 Found ${validUsers.length} users to process`);

//     let successCount = 0;
//     let errorCount = 0;

//     for (const user of validUsers) {
//       try {
//         const userId = (user._id as any).toString();
//         const pointId = uuidv5(userId, NAMESPACE);

//         // 1. Index user profile in USERS_COLLECTION
//         await indexUser({
//           mongoId: userId,
//           username: user.username,
//           displayName: user.displayName,
//           bio: user.bio,
//           MBTI: user.MBTI,
//           gender: user.gender,
//           relationshipStatus: user.relationshipStatus,
//           careers: user.careers,
//           birthYear: user.birthYear,
//           locationTokens: user.locationTokens,
//           rawProfileText: user.rawProfileText,
//         });

//         // 2. Index raw profile text in RAW_PROFILE_COLLECTION (always, even if empty)
//         try {
//           let textToIndex = "";

//           if (user.rawProfileText) {
//             try {
//               const decryptedText = decrypt(user.rawProfileText);
//               textToIndex = decryptedText.trim();
//             } catch (decryptError) {
//               console.warn(
//                 `⚠️ Could not decrypt rawProfileText for user ${user.username}:`,
//                 decryptError
//               );
//             }
//           }

//           // If no rawProfileText, use basic profile info as fallback
//           if (!textToIndex) {
//             textToIndex = [
//               user.username,
//               user.displayName,
//               user.bio || "",
//               "ยังไม่ได้สร้างข้อมูลเชิงลึก",
//             ]
//               .filter(Boolean)
//               .join(" ");
//             console.log(
//               `ℹ️ User ${user.username} has no rawProfileText, using basic info`
//             );
//           }

//           await indexRawProfile({
//             userId,
//             text: textToIndex,
//           });
//         } catch (rawProfileError) {
//           console.error(
//             `❌ Error indexing raw profile for user ${user.username}:`,
//             rawProfileError
//           );
//         }

//         successCount++;
//         if (successCount % 10 === 0) {
//           console.log(`✅ Processed ${successCount}/${users.length} users`);
//         }
//       } catch (error) {
//         errorCount++;
//         console.error(`❌ Error processing user ${user.username}:`, error);
//       }
//     }

//     console.log(`🎉 Vector repopulation completed!`);
//     console.log(`✅ Success: ${successCount} users`);
//     console.log(`❌ Errors: ${errorCount} users`);
//   } catch (error) {
//     console.error("💥 Fatal error during repopulation:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("👋 Disconnected from MongoDB");
//   }
// }

// // Run the script
// repopulateVectors().catch(console.error);
