// app/admin/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import UserToQdrantButton from "@/components/dev/UserToQdrantButton";
import RealtimeUserCount from "@/components/dev/RealtimeUserCount";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const callSyncAPI = async () => {
    "use server";
    await fetch("http://localhost:3000/api/dev/sync-users-to-qdrant", {
      method: "POST",
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">🛠️ Admin Dashboard</h1>
      <RealtimeUserCount />
      <UserToQdrantButton />
    </div>
  );
}
