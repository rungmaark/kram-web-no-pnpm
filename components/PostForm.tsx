// components/PostForm.tsx

"use client";

import { useState, useRef } from "react";
import { Image, MapPin, Smile, X } from "lucide-react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

export default function PostForm() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState("");
  const [tempLocation, setTempLocation] = useState(""); // สำหรับ modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading: meLoading } = useSWR(
    "/api/auth/user-by-id",
    fetcher
  );
  const me = data?.user;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!content.trim() && images.length === 0) return;

    let optimisticPost: any;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("location", location);
      images.forEach((f) => formData.append("images", f));

      // --- optimistic object (id ชั่วคราว) ---
      optimisticPost = {
        _id: "temp-" + Date.now(),
        content,
        createdAt: new Date().toISOString(),
        imageUrls: images.map((f) => URL.createObjectURL(f)),
        location,
        author: {
          username: me?.username ?? "me",
          displayName: me?.displayName ?? "คุณ",
          profileImage: me?.profileImage, // key หรือ url ตาม schema
        },
      };
      // 1) prepend optimistic post เข้า cache ทันที
      const keyAll = `/api/auth/post/get?q=`; // feed หลัก (ช่อง search ว่าง)
      mutate(
        keyAll,
        (data: any) => ({ posts: [optimisticPost, ...(data?.posts ?? [])] }),
        false // ไม่เรียก fetch ใหม่ตอนนี้
      );
      // ---------- 2) ส่งของจริงไป backend ----------
      const res = await fetch("/api/auth/post/create", {
        method: "POST",
        body: formData,
      });
      const { post: raw } = await res.json();

      // ⭐ แปลงให้มี author + imageUrls เหมือนตอน GET /post
      const realPost = {
        _id: raw._id,
        content: raw.text,
        createdAt: raw.createdAt,
        imageUrls: raw.images?.map((img: any) => img.url) ?? [],
        author: {
          username: me?.username ?? "me",
          displayName: me?.displayName ?? "คุณ",
          profileImage: me?.profileImage,
        },
      };

      // 3) แทนที่ post ชั่วคราวตัวแรกด้วย post จริง
      mutate(
        keyAll,
        (data: any) => {
          const list = data?.posts ?? [];
          return {
            posts: [
              realPost,
              ...list.filter((p: any) => p._id !== optimisticPost._id),
            ],
          };
        },
        false
      );

      // --- reset form ---
      setContent("");
      setImages([]);
      setLocation("");
    } catch (err) {
      // rollback ถ้า error
      mutate(
        `/api/auth/post/get?q=`,
        (data: any) => ({
          posts:
            data?.posts?.filter((p: any) => p._id !== optimisticPost._id) ?? [],
        }),
        false
      );
      console.error(err);
      alert("โพสต์ไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are you thinking? ✨"
        className={`w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none h-24 ${
          content === "" ? "select-none" : "select-text"
        }`}
      />

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-1 mt-3 overflow-x-auto">
          {images.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${index}`}
                className="h-27 rounded object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full px-1.5 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Location */}
      {location && (
        <div className="text-sm text-blue-500 mt-2">📍: {location}</div>
      )}

      {/* Buttons */}
      <div className="flex justify-between items-center mt-3">
        <div>
          <div className="flex gap-4">
            <Image
              className="inline-block text-blue-500 size-5 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            />
            <MapPin
              className="inline-block text-blue-500 size-5 cursor-pointer"
              onClick={() => {
                setTempLocation(location);
                setShowLocationModal(true);
              }}
            />
            <Smile
              className="inline-block text-blue-500 size-5 cursor-pointer"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || meLoading}
          className={`bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded transition cursor-pointer
              ${
                submitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Modal สำหรับเลือกสถานที่ */}
      {showLocationModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#222] p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                สถานที่
              </h2>
              <button onClick={() => setShowLocationModal(false)}>
                <X className="text-gray-500 hover:text-red-500 cursor-pointer" />
              </button>
            </div>
            <input
              type="text"
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              placeholder="พิมพ์ชื่อสถานที่"
              className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none mb-4"
            />
            <button
              className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition cursor-pointer"
              onClick={() => {
                setLocation(tempLocation);
                setShowLocationModal(false);
              }}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
      {showEmojiPicker && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-[#333] border border-gray-300 dark:border-gray-700 rounded p-2 shadow-md grid grid-cols-8 overflow-y-auto max-h-75 flex flex-wrap gap-1">
          {[
            "😀",
            "😃",
            "😄",
            "😁",
            "😆",
            "😅",
            "😂",
            "🤣",
            "😊",
            "😇",
            "🙂",
            "🙃",
            "😉",
            "😍",
            "🥰",
            "😘",
            "😗",
            "😙",
            "😚",
            "😋",
            "😜",
            "😝",
            "😛",
            "🤑",
            "🤗",
            "🤭",
            "🤫",
            "🤔",
            "🤐",
            "🤨",
            "😐",
            "😑",
            "😶",
            "😏",
            "😒",
            "🙄",
            "😬",
            "🤥",
            "😌",
            "😔",
            "😪",
            "🤤",
            "😴",
            "😷",
            "🤒",
            "🤕",
            "🤢",
            "🤮",
            "🥴",
            "😵",
            "🤯",
            "🤠",
            "🥳",
            "😎",
            "🤓",
            "🧐",
            "😕",
            "😟",
            "🙁",
            "☹️",
            "😮",
            "😯",
            "😲",
            "😳",
            "🥺",
            "😦",
            "😧",
            "😨",
            "😰",
            "😥",
            "😢",
            "😭",
            "😱",
            "😖",
            "😣",
            "😞",
            "😓",
            "😩",
            "😫",
            "🥱",
            "😤",
            "😡",
            "😠",
            "🤬",
            "😈",
            "👿",
            "💀",
            "☠️",
            "👹",
            "👺",
            "💩",
            "🤡",
            "👻",
            "👽",
            "👾",
            "🤖",
            "😺",
            "😸",
            "😹",
            "😻",
            "😼",
            "😽",
            "🙀",
            "😿",
            "😾",
            "❤️",
            "🧡",
            "💛",
            "💚",
            "💙",
            "💜",
            "🖤",
            "🤍",
            "🤎",
            "💔",
            "❣️",
            "💕",
            "💞",
            "💓",
            "💗",
            "💖",
            "💘",
            "💝",
            "💟",
            "👍",
            "👎",
            "👏",
            "🙌",
            "🙏",
            "🤝",
            "💪",
          ].map((emoji) => (
            <button
              key={emoji}
              className="text-xl hover:scale-110 transition"
              onClick={() => {
                setContent((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
