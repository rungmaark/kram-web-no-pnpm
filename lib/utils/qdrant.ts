// lib/utils/qdrant.ts
import { v5 as uuidv5 } from "uuid";
const QDRANT_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export function getQdrantIdFromUserId(userId: string) {
  return uuidv5(userId, QDRANT_NAMESPACE);
}
