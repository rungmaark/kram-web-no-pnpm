// components/UserPostList.tsx

"use client";

import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import PostCard from "@/components/PostCard";
import { fetcher } from "@/lib/fetcher";
import { PostData } from "@/types/Post";

type Post = {
  _id: string;
  content: string;
  imageUrls?: string[];
  location?: string;
  author: {
    username: string;
    displayName: string;
    profileImage?: string;
    gender?: string;
  };
  createdAt: string;
};

export default function UserPostList({ userId }: { userId: string }) {
  const getKey = (pageIndex: number, prev: any) => {
    if (prev && !prev.hasMore) return null;
    return `/api/auth/post/by-user?userId=${userId}&page=${pageIndex + 1}`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const posts: PostData[] = data ? data.flatMap((d) => d.posts) : [];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && data?.[data.length - 1]?.hasMore) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.5 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [data, setSize]);

  return (
    <div className="main-profile-container mx-auto bg-white dark:bg-black py-2">
      {isValidating && size === 1 ? (
        <p className="text-gray-500 dark:text-gray-400 px-4">
          กำลังโหลดโพสต์...
        </p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 px-4">ยังไม่มีโพสต์</p>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          <div ref={loadMoreRef} className="h-10 mt-4" />
          {isValidating && size > 1 && (
            <p className="text-center text-gray-400 py-2">กำลังโหลด...</p>
          )}
        </>
      )}
    </div>
  );
}
