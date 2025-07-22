// types/Post.ts

export type PostData = {
  _id: string;
  content: string;
  imageUrls?: string[];
  location?: string;
  createdAt: string;
  author: {
    username: string;
    displayName: string;
    profileImage?: string;
    gender?: string;
  };
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean; // server จะ populate ให้
  type: "post" | "repost";
};
