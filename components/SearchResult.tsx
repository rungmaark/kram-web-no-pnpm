// components/SearchResult.tsx

"use client";

import { useEffect, useState } from "react";
import { Mars, User, Venus, Search } from "lucide-react";
import Link from "next/link";

type User = {
  _id: string;
  displayName: string;
  username: string;
  bio?: string;
  rawProfileText?: string;
  profileImage?: string;
  gender?: string;
  mbti?: string;
  minimumAge?: number;
  maximumAge?: number;
};

export default function SearchResult({ searchText }: { searchText: string }) {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchUsers = async (text: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }), // 👈  backend รอ key ชื่อ  query
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error("Search failed:", res.status, errText);
        setResults([]);
        return;
      }

      const data = await res.json();
      setResults(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText.trim()) return;
    setHasSearched(true);
    fetchUsers(searchText);
  }, [searchText]);

  const showNoUsersFound = hasSearched && !loading && results.length === 0;
  /* ---------- info line ---------- */ // NEW
  const isBlank = !searchText.trim();
  const infoText =
    !loading && hasSearched
      ? isBlank
        ? "Matched users"
        : `${results.length} user${results.length !== 1 ? "s" : ""} found`
      : "";

  function getProfileImageUrl(user: User): string {
    const key = user.profileImage?.trim();
    if (key?.length) return `/api/image?key=${encodeURIComponent(key)}`;
    switch (user.gender?.toLowerCase()) {
      case "male":
        return "/image/blue-owl.png";
      case "female":
        return "/image/pink-owl.png";
      case "gay":
        return "/image/green-owl.png";
      case "lesbian":
        return "/image/purple-owl.png";
      case "bisexual":
        return "/image/yellow-owl.png";
      case "transgender":
        return "/image/red-owl.png";
      default:
        return "/image/gray-owl.png";
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* ── Info banner ──────────────────────────────────────── */}
      {infoText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {infoText}
        </p>
      )}

      {loading && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-blue-500 font-medium dark:text-blue-400">
            Loading...
          </span>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((user, index) => (
            <div
              key={user._id || `${user.username}-${index}`}
              className="h-full flex flex-col               /* ① ทำการ์ดเป็น flex-col-เต็มสูง */
             bg-white rounded-lg border border-gray-200
             shadow-sm hover:shadow-lg transition-shadow duration-200
             p-6 dark:bg-[#181818] dark:border-gray-700 dark:text-white"
            >
              {/* header : image + ชื่อ + @username -------------------------------- */}
              <Link
                href={`/profile/${user.username}`}
                prefetch={false}
                className="group cursor-pointer text-center flex flex-col items-center"
              >
                <img
                  src={getProfileImageUrl(user)}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full object-cover transition-opacity
                 duration-200 group-hover:opacity-90"
                />

                <div className="mt-2 font-semibold text-gray-900 dark:text-white group-hover:underline">
                  {user.displayName}
                  {user.gender === "male" && (
                    <Mars className="inline ml-2 text-blue-500" size={16} />
                  )}
                  {user.gender === "female" && (
                    <Venus className="inline ml-2 text-pink-500" size={16} />
                  )}
                  {user.gender === "gay" && (
                    <img src="/image/gay.png" className="size-4 ml-1 inline" />
                  )}
                  {user.gender === "lesbian" && (
                    <img
                      src="/image/lesbian.png"
                      className="size-3 ml-1 inline"
                    />
                  )}
                  {user.gender === "bisexual" && (
                    <img
                      src="/image/bisexual.png"
                      className="size-4 ml-1 inline"
                    />
                  )}
                  {user.gender === "transgender" && (
                    <img
                      src="/image/transgender.png"
                      className="size-4 ml-1 inline"
                    />
                  )}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-300 group-hover:underline">
                  @{user.username}
                </div>
              </Link>

              {/* rawProfileText หรือ bio -------------------------------------------------------------- */}
              <p
                className="text-sm text-center text-gray-600 dark:text-gray-400 line-clamp-3 flex-grow /* ② flex-grow ดันพื้นที่ */
           mt-2 mb-4"
              >
                {user.bio || ""}
              </p>

              {/* button ----------------------------------------------------------- */}
              <Link
                href={`/message?userId=${user._id}`}
                className="text-sm border border-blue-500 text-blue-500 rounded px-4 py-1
               font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition
               mt-auto mx-auto"
              >
                Message
              </Link>
            </div>
          ))}
        </div>
      ) : showNoUsersFound ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No users found
          </h3>
        </div>
      ) : null}
    </div>
  );
}
