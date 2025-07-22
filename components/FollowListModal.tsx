// components/FollowListModal.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { getOwlImageByGender } from "@/lib/utils/avatar";

type FollowUser = {
  _id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  gender?: string;
};

type Props = {
  type: "followers" | "following";
  userId: string;
  onClose: () => void;
};

export default function FollowListModal({ type, userId, onClose }: Props) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const res = await fetch(
      `/api/user/${userId}/${type}?page=${page}&limit=20`
    );
    const data = await res.json();
    setUsers((prev) => {
      const existingIds = new Set(prev.map((u) => u._id));
      const newUsers = data.filter((u: FollowUser) => !existingIds.has(u._id));
      return [...prev, ...newUsers];
    });

    setHasMore(data.length === 20); // ถ้าน้อยกว่า 20 แสดงว่าไม่มีเพิ่มเติมแล้ว
    setLoading(false);
  }, [page, type, userId, hasMore, loading]);

  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
  }, [type, userId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loader, hasMore, loading]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="bg-zinc-200 dark:bg-zinc-900 p-5 rounded-lg w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-gray-200">
            {type === "followers" ? "Followers" : "Following"}
          </h2>
          <X className="cursor-pointer dark:text-gray-50" onClick={onClose} />
        </div>
        {users.length === 0 && !loading ? (
          <div className="dark:text-gray-50">No users found.</div>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li key={user._id}>
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-zinc-800 p-2 rounded"
                  onClick={onClose}
                >
                  <img
                    src={
                      user.profileImage
                        ? `/api/image?key=${encodeURIComponent(
                            user.profileImage
                          )}`
                        : getOwlImageByGender(user.gender)
                    }
                    className="w-10 h-10 rounded-full object-cover"
                    alt={user.displayName}
                  />
                  <div>
                    <div className="font-semibold dark:text-gray-50">
                      {user.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {loading && (
          <div className="mt-4 text-center text-gray-500">Loading...</div>
        )}
        <div ref={loader} />
      </div>
    </div>
  );
}
