// components/Comments.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/auth-context";
import moment from "moment";
import clsx from "clsx";
import Link from "next/link";

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  author: {
    username: string;
    displayName: string;
    profileImage?: string;
    gender?: string;
  };
};

export default function Comments({ postId }: { postId: string }) {
  /* -------------- ดึงคอมเมนต์ -------------- */
  const getKey = (idx: number, prev: any) =>
    prev && !prev.hasMore
      ? null
      : `/api/auth/comment/get?postId=${postId}&page=${idx + 1}`;

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    { revalidateOnFocus: false }
  );
  const comments: Comment[] = data ? data.flatMap((d) => d.comments) : [];

  /* -------------- infinite scroll -------------- */
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && data?.[data.length - 1]?.hasMore) {
          setSize((p) => p + 1);
        }
      },
      { threshold: 1 }
    );

    const el = loadMoreRef.current;
    if (el) ob.observe(el);

    return () => {
      if (el) ob.unobserve(el); // ✅ ตรวจสอบก่อนเรียก
    };
  }, [data, setSize]);

  /* -------------- ส่งคอมเมนต์ -------------- */
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const me = authUser ?? session?.user ?? null;

  const [text, setText] = useState("");
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !text.trim()) return;
    const body = text.trim();
    setText("");

    // optimistic
    const optimistic: Comment = {
      _id: "tmp-" + Date.now(),
      text: body,
      createdAt: new Date().toISOString(),
      author: {
        username: session.user.username,
        displayName: session.user.displayName,
        profileImage: session.user.profileImage,
        gender: session.user.gender,
      },
    };
    mutate(
      (prev) =>
        prev
          ? [
              {
                comments: [optimistic, ...prev[0].comments],
                hasMore: prev[0].hasMore,
              },
              ...prev.slice(1),
            ]
          : prev,
      false
    );

    try {
      await fetch("/api/auth/comment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, text: body }),
      });
      mutate(); // sync server
    } catch {
      mutate(); // rollback
    }
  };

  /* -------------- helper -------------- */
  const avatar = (img?: string, gender?: string) =>
    img
      ? img.startsWith("http")
        ? img
        : `/api/image?key=${img}`
      : { male: "/image/blue-owl.png", female: "/image/pink-owl.png" }[
          gender?.toLowerCase() as "male" | "female"
        ] || "/image/gray-owl.png";

  return (
    <div className="flex flex-col gap-4">
      {/* form */}
      <form onSubmit={send} className="flex gap-3 items-start text-sm">
        {/* รูปโปรไฟล์ของผู้ใช้ที่ login */}
        <Link href={`/profile/${me?.username ?? "#"}`}>
          <img
            src={avatar(me?.profileImage, me?.gender)}
            className="w-8 h-8 rounded-full object-cover mt-1"
          />
        </Link>

        {/* textarea สำหรับพิมพ์คอมเมนต์ */}
        <div className="flex flex-row w-full gap-2">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            placeholder="เขียนคอมเมนต์…"
            className="
      flex-1 resize-none overflow-hidden
      px-4 py-2 rounded-2xl
      border dark:border-gray-700
      bg-transparent dark:text-gray-50
      focus:outline-none focus:ring-1 focus:ring-kramblue
      placeholder:text-gray-400 dark:placeholder:text-gray-500
    "
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={clsx(
              "px-4 py-1.5 text-sm rounded-full transition-colors h-fit self-end",
              text.trim()
                ? "bg-kramblue text-white hover:bg-kramblue/90 cursor-pointer"
                : "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
            )}
          >
            ส่ง
          </button>
        </div>
      </form>

      {/* list */}
      {comments.map((c) => (
        <div key={c._id} className="flex gap-3 text-sm">
          <Link href={`/profile/${c.author.username}`}>
            <img
              src={avatar(c.author.profileImage, c.author.gender)}
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${c.author.username}`}
              className="font-medium mr-1 hover:underline dark:text-white"
            >
              {c.author.displayName}
            </Link>
            <span className="text-gray-500">
              · {moment(c.createdAt).fromNow()}
            </span>
            <p className="whitespace-pre-wrap mt-1 dark:text-gray-50">
              {c.text}
            </p>
          </div>
        </div>
      ))}
      {isValidating && <p className="text-center text-gray-400">กำลังโหลด…</p>}
      <div ref={loadMoreRef} className="h-10" />
    </div>
  );
}
