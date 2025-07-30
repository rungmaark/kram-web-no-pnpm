// // lib/indexRawProfile.ts
// import { v5 as uuidv5 } from "uuid";
// import {
//   qdrant,
//   RAW_PROFILE_COLLECTION,
//   ensureRawProfileCollection,
// } from "./qdrant";
// import { embeddingForText } from "./embedding";

// // ใช้ namespace เดียวกับ users / หรือประกาศใหม่
// const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

// export async function indexRawProfile({
//   userId,
//   text,
// }: {
//   userId: string;
//   text: string;
// }) {
//   await ensureRawProfileCollection();

//   const vector = await embeddingForText(text);

//   /** ✅ สร้าง pointId เป็น UUID v5 ที่ Qdrant รับได้ */
//   const pointId = uuidv5(`raw::${userId}`, NAMESPACE);

//   await qdrant.upsert(RAW_PROFILE_COLLECTION, {
//     wait: true,
//     points: [
//       {
//         id: pointId,
//         vector,
//         payload: { userId },
//       },
//     ],
//   });
// }
