// components/dev/RealtimeUserCount.tsx

"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RealtimeUserCount() {
  const { data, error } = useSWR("/api/dev/users-count", fetcher, {
    refreshInterval: 5000,          // ► อัปเดต ~realtime
    dedupingInterval: 5000,
  });

  if (error) return (
    <div className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200
                    border border-red-300 dark:border-red-800 rounded p-4 my-6">
      ⚠️ Error loading user count
    </div>
  );

  if (!data) return (
    <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                    border border-gray-200 dark:border-gray-700 rounded p-4 my-6">
      Loading…
    </div>
  );

  return (
    <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-100
                    border border-indigo-300 dark:border-indigo-800 rounded p-4 my-6">
      <h2 className="text-lg font-semibold mb-2">👥 Users Count</h2>
      <p className="text-3xl font-bold tabular-nums">{data.count.toLocaleString()}</p>
      <p className="text-xs mt-1 opacity-70">Auto-refresh 5 วินาที</p>
    </div>
  );
}
