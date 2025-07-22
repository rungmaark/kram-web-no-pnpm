// components/dev/UserToQdrantButton.tsx

"use client";

import { useState } from "react";

export default function UserToQdrantButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const syncAllUsersToQdrant = async () => {
    setLoading(true);
    setMessage("กำลังอัปเดตผู้ใช้ทั้งหมด...");

    try {
      const res = await fetch("/api/dev/sync-users-to-qdrant", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ สำเร็จ: ${data.count} คน`);
      } else {
        setMessage(`❌ ล้มเหลว: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ เกิดข้อผิดพลาดระหว่าง fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-4 my-6 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100">
      <h2 className="text-lg font-semibold mb-2">🛠 Dev Tools</h2>
      <button
        onClick={syncAllUsersToQdrant}
        disabled={loading}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50 dark:bg-yellow-600 dark:hover:bg-yellow-700 cursor-pointer"
      >
        {loading ? "กำลังอัปเดต..." : "Sync Users → Qdrant"}
      </button>
      {message && (
        <p className="mt-2 text-sm dark:text-yellow-200">{message}</p>
      )}
    </div>
  );
}
