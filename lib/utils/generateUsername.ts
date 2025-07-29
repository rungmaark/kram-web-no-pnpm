// lib/utils/generateUsername.ts
import User from "@/models/User";

/**
 * Given an email (or any base string), generate a Mongo‐safe, lowercase,
 * de-duplicated username by appending a numeric suffix if needed.
 */
export async function generateUsername(baseRaw: string): Promise<string> {
  // sanitize to allowed chars
  const base = baseRaw
    .toLowerCase()
    .replace(/[^a-z0-9._!]/g, "")
    .slice(0, 30) // optional length cap
    .replace(/^\.+/, ""); // no leading dots

  let candidate = base;
  let suffix = 0;
  // bump suffix until we find one that doesn’t exist
  while (await User.exists({ username: candidate })) {
    suffix++;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}
