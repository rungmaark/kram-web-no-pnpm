// components/PostList.tsx

"use client";

import { useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/lib/fetcher";
import PostCard, { PostCardProps } from "@/components/PostCard";
import Comments from "./Comments";
import { X } from "lucide-react";

type Post = PostCardProps["post"];

/* ---------------- key generator ---------------- */
const getPostKey = (
  i: number,
  prev: any,
  q: string,
  uni: string[],
  careers: string[],
  provinces: string[]
) =>
  prev && !prev.hasMore
    ? null
    : `/api/auth/post/get?q=${encodeURIComponent(q)}` +
      `&university=${encodeURIComponent(uni.join(","))}` +
      `&career=${encodeURIComponent(careers.join(","))}` +
      `&province=${encodeURIComponent(provinces.join(","))}` +
      `&page=${i + 1}`;

export default function PostList({
  searchText,
  openedPostId,
  setOpenedPostId,
  universities,
  careers,
  provinces,
}: {
  searchText: string;
  openedPostId: string | null;
  setOpenedPostId: (id: string | null) => void;
  universities: string[];
  careers?: string[];
  provinces?: string[];
}) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* -------- SWR post -------- */
  const {
    data: postData,
    size: postSize,
    setSize: setPostSize,
    isValidating: postLoading,
  } = useSWRInfinite(
    (i, prev) => getPostKey(i, prev, searchText, universities, careers || [], provinces || []),
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  /* -------- mapping -------- */
  const postsRaw: Post[] = postData ? postData.flatMap((d) => d.posts) : [];

  /* -------- รวม feed & เรียงตามเวลา -------- */
  const feed: Post[] = postsRaw.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  /* -------- infinite scroll observer -------- */
  useEffect(() => {
    const ob = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && postData?.at(-1)?.hasMore) {
          setPostSize((p) => p + 1);
        }
      },
      { threshold: 1 }
    );

    const el = loadMoreRef.current;
    if (el) ob.observe(el);

    return () => {
      if (el) ob.unobserve(el);
    };
  }, [postData, setPostSize]);

  /* -------- loading flag -------- */
  const initialLoading = postLoading && postSize === 1;

  /* -------- JSX -------- */
  return (
    <div className="relative bg-white dark:bg-black min-h-screen py-2">
      {initialLoading ? (
        <p className="text-gray-500 dark:text-gray-400">กำลังโหลดโพสต์...</p>
      ) : feed.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">ไม่มีโพสต์…</p>
      ) : (
        <>
          {feed.map((post) => (
            <div key={post._id} className="relative">
              <PostCard post={post} />
              {openedPostId === post._id && (
                <SideCommentPanel
                  postId={post._id}
                  onClose={() => setOpenedPostId(null)}
                />
              )}
            </div>
          ))}
          <div ref={loadMoreRef} className="h-16" />
          {postLoading && (
            <p className="text-center text-gray-400">กำลังโหลดเพิ่ม...</p>
          )}
        </>
      )}
    </div>
  );
}

/* -------- แยกย่อ component comment panel -------- */
function SideCommentPanel({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-0 right-0 h-full w-full lg:max-w-[600px] z-[999] bg-white dark:bg-[#181818] border-l dark:border-gray-800 shadow-xl overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
        <p className="font-semibold text-gray-700 dark:text-white">
          ความคิดเห็น
        </p>
        <button
          onClick={onClose}
          className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <Comments postId={postId} />
      </div>
    </div>
  );
}
