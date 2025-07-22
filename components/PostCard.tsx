// components/PostCard.tsx

import { MessageCircle, Repeat2, Heart, Send } from "lucide-react";
import moment from "moment";
import ImageScroller from "@/components/ImageScroller";
import PostLocation from "@/components/PostLocation";
import PostEllipsisDropdown from "@/components/PostEllipsisDropdown";
import PostShareDropdown from "./PostShareDropdown";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOwlImageByGender } from "@/lib/utils/avatar";

export type PostCardProps = {
  post: {
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
    likesCount: number;
    commentsCount: number;
    likedByMe: boolean;
  };
};

const getAvatarSrc = (profileImage?: string, gender?: string): string => {
  if (!profileImage) return getOwlImageByGender(gender);
  return profileImage.startsWith("http")
    ? profileImage
    : `/api/image?key=${profileImage}`;
};

export default function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession(); // ใช้ session ของ NextAuth
  const currentUsername = session?.user?.username;
  const router = useRouter();

  // ===== like state =====
  const safeLikes = Number.isFinite(post.likesCount) ? post.likesCount : 0;
  const [likesCount, setLikesCount] = useState<number>(safeLikes); // :contentReference[oaicite:3]{index=3}
  const [liked, setLiked] = useState(post.likedByMe);

  const toggleLike = async () => {
    if (!session) return;
    const baseUrl = `/api/auth/post/${post._id}/like`;

    const method = liked ? "DELETE" : "POST";

    /* optimistic update เหมือนเดิม… */
    try {
      const res = await fetch(baseUrl, { method });
      if (res.ok) {
        const d = await res.json();
        setLikesCount(d.likesCount);
        setLiked(d.liked);
      } else throw new Error();
    } catch {
      /* rollback */
      setLiked(liked);
      setLikesCount((c) => c + (liked ? 1 : -1));
    }
  };

  const author = post.author ?? {
    username: "unknown",
    displayName: "Unknown",
    profileImage: undefined,
  };

  return (
    <div
      key={post._id}
      onDoubleClick={(e) => e.preventDefault()}
      className="border-b border-gray-300 dark:border-gray-800 py-4 flex flex-col gap-2"
    >
      <div className="flex gap-3">
        <Link href={`/profile/${author.username}`} className="flex-shrink-0">
          <img
            src={getAvatarSrc(author.profileImage, author.gender)}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            alt="Profile"
          />
        </Link>

        <div className="flex-1">
          <div className="flex justify-between items-start text-sm">
            <Link href={`/profile/${author.username}`} className="block">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold dark:text-gray-100">
                  {author.displayName}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  @{author.username}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  · {moment(post.createdAt).fromNow()}
                </span>
              </div>
            </Link>
            <PostEllipsisDropdown
              username={author.username}
              currentUsername={currentUsername}
              postId={post._id}
            />
          </div>
          {post.location && <PostLocation location={post.location} />}

          {post.content && (
            <p
              className="mt-2 whitespace-pre-line text-gray-800 dark:text-gray-200"
              data-post-id={post._id}
              data-location={post.location}
            >
              {post.content}
            </p>
          )}

          {post.imageUrls && post.imageUrls.length > 0 && (
            <ImageScroller imageUrls={post.imageUrls} />
          )}

          <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-[400px]">
            <div
              className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"
              onClick={() =>
                router.push(`/feed/${post.author.username}/${post._id}`)
              }
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount}</span>
            </div>
            <button
              onClick={toggleLike}
              className={clsx(
                "flex items-center gap-1 hover:text-pink-500 cursor-pointer",
                liked ? "text-pink-500" : "text-gray-500 dark:text-gray-400"
              )}
            >
              <Heart className={clsx("w-4 h-4", liked && "fill-pink-500")} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center gap-1">
              <PostShareDropdown postId={post._id} username={author.username} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
