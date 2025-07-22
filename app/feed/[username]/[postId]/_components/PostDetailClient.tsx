// app/feed/[username]/[postId]/_components/PostDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostSearch from "@/components/PostSearch";
import PostSearchInput from "@/components/PostSearchInput";
import { useMediaQuery } from "@/lib/hooks";
import PostCard from "@/components/PostCard";
import Comments from "@/components/Comments";

/**
 * Client‑side container for the post‑detail view (+ comments)
 * – expects to live at /feed/[username]/[postId]
 * – reads `postId` (and username) from the URL via `useParams()`
 */
export default function PostDetailClient() {
  // 1️⃣ Read dynamic params from the URL
  const { postId } = useParams() as { username: string; postId: string };

  // 2️⃣ Local UI state
  const [post, setPost] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  // 3️⃣ Helpers
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const { data: session } = useSession();

  // 4️⃣ Show / hide sidebar when viewport changes
  useEffect(() => {
    setShowSearchBar(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (!postId) return;

    (async () => {
      try {
        const res = await fetch(
          `/api/auth/post/by-id?id=${postId}`,
          { cache: "no-store", credentials: "include" } // ✅ ปิด cache & ส่ง cookie
        );

        if (!res.ok) {
          // ยิง log ชัด ๆ แล้วหยุด ไม่ต้อง parse json เปล่า ๆ
          const text = await res.text();
          console.error(`GET /api/auth/post/by-id -> ${res.status}: ${text}`);
          return;
        }

        const { post } = (await res.json()) as { post: any };

        const userId = session?.user?.id; // ✅ สมมุติว่า session มี .id
        const likedByMe = userId
          ? post.likes?.some((id: string) => id === userId)
          : false;

        const transformed = {
          _id: post._id,
          content: post.text, // 🟢 เปลี่ยนชื่อ field
          imageUrls: post.images?.map((img: any) => img.url) ?? [],
          location: post.location,
          author: post.author,
          createdAt: post.createdAt,
          likesCount: post.likes?.length ?? 0,
          commentsCount: post.commentsCount ?? 0, 
          likedByMe,
        };

        setPost(transformed);
      } catch (err) {
        console.error("Failed to fetch post", err);
      }
    })();
  }, [postId]);

  // 6️⃣ Render
  return (
    <div className="dark:bg-black min-h-screen lg:px-30 xl:px-50">
      <Navbar />

      <div className="flex gap-4 container mx-auto relative">
        {/* Sidebar (desktop only) */}
        {showSearchBar && (
          <div className="hidden lg:block lg:pt-3 w-[360px] shrink-0 sticky top-[64px]">
            <PostSearch
              searchText={searchText}
              onSearchTextChange={setSearchText}
            />
          </div>
        )}

        {/* Main column */}
        <div className="flex flex-col flex-1 max-w-[1160px] px-5 pt-8">
          {/* Search bar on mobile */}
          <div className="block lg:hidden mb-4">
            <PostSearchInput
              searchText={searchText}
              onSearchTextChange={setSearchText}
            />
          </div>

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 mb-4 self-start hover:underline hover:cursor-pointer"
          >
            ← Back
          </button>

          {/* Post + comments */}
          {post && (
            <>
              <PostCard post={post} />
              <div className="mt-4">
                <Comments postId={post._id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
