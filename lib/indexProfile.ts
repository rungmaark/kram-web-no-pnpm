// lib/indexProfile.ts

import { ensureUsersCollection, qdrant, USERS_COLLECTION } from "./qdrant";
import { embeddingForText } from "./embedding";
import { decrypt } from "./encrypt";

export async function indexUser(user: {
  pointId: string;
  mongoId: string;
  username: string;
  displayName: string;
  bio?: string;
  MBTI?: string;
  gender?: string;
  relationshipStatus?: string;
  careers?: string[];
  birthYear?: number | null;
  locationTokens?: string[];
  rawProfileText?: string;
}) {
  await ensureUsersCollection();

  const safe = <T>(value: T | undefined | null, fallback = "ไม่มีข้อมูล") =>
    value ? String(value) : fallback;

  const text = [
    safe(user.displayName),
    safe(user.displayName), // ย้ำชื่อ
    safe(user.username),
    safe(user.bio),
    safe(user.MBTI),
    safe(user.relationshipStatus),
    user.careers?.length ? user.careers.join(" ") : "ไม่มีอาชีพที่ระบุ",
    user.birthYear?.toString() ?? "ไม่ระบุปีเกิด",
    /* NEW → 500 ตัวอักษรแรกของ rawProfileText ถอดรหัสมาใช้ */
    user.rawProfileText ? decrypt(user.rawProfileText).slice(0, 500) : "",
  ].join(" \n ");

  const rawVector = await embeddingForText(text);
  const vector = Array.from(rawVector);

  if (vector.length !== 1536) {
    throw new Error("❌ Embedding vector length mismatch: " + vector.length);
  }

  const point = {
    id: user.pointId,
    vector,
    payload: {
      _id: user.mongoId,
      username: user.username,
      displayName: user.displayName ?? undefined,
    bio: user.bio ?? undefined,
      MBTI: user.MBTI ?? undefined,
      gender: user.gender,
      relationshipStatus: user.relationshipStatus,
      careers: user.careers ?? [],
      birthYear: user.birthYear ?? undefined,
      locationTokens: user.locationTokens ?? [],
    },
  };

  await qdrant.upsert(USERS_COLLECTION, {
    wait: true,
    points: [point],
  });
}
