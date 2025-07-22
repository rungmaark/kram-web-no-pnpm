// lib/qdrant.ts

import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  ...(process.env.QDRANT_API_KEY && {
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
  }),
});

export const RAW_PROFILE_COLLECTION = "raw_profile_vectors";

let isRawProfileEnsured = false;

export async function ensureRawProfileCollection() {
  if (isRawProfileEnsured) return;

  const collections = await qdrant.getCollections();
  if (!collections.collections.find((c) => c.name === RAW_PROFILE_COLLECTION)) {
    await qdrant.createCollection(RAW_PROFILE_COLLECTION, {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
      on_disk_payload: true,
    });
  }

  isRawProfileEnsured = true;
}


export const USERS_COLLECTION = "users_vectors";

let isCollectionEnsured = false;

export async function ensureUsersCollection() {
  if (isCollectionEnsured) return;

  const collections = await qdrant.getCollections();
  if (!collections.collections.find((c) => c.name === USERS_COLLECTION)) {
    await qdrant.createCollection(USERS_COLLECTION, {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
      on_disk_payload: true, // ✅ ค่า default คือ true อยู่แล้ว แต่อยากให้เน้น
    });
  }

  isCollectionEnsured = true;
}
