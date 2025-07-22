// lib/encrypt.ts

import {
  createCipheriv,
  randomBytes,
  createHash,
  createDecipheriv,
} from "crypto";

// 🔐 ความยาวคีย์ AES‑256 = 32 bytes
const SECRET = process.env.ENCRYPT_SECRET || "kram-dev-secret";
const KEY = createHash("sha256").update(SECRET).digest(); // 32‑byte key

/*
 * encrypt("hello") → iv:hex:cipher:hex
 * decrypt(...)      → plain text
 */
export function encrypt(plain: string): string {
  const iv = randomBytes(16); // 128‑bit IV
  const cipher = createCipheriv("aes-256-ctr", KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(token: string): string {
  const [ivHex, dataHex] = token.split(":");
  if (!ivHex || !dataHex) throw new Error("Invalid encrypted string");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-ctr", KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
