// components/EditPostModal.tsx

"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  postId: string;
  initialText: string;
  initialLocation?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditPostModal({
  postId,
  initialText,
  initialLocation,
  onClose,
  onSuccess,
}: Props) {
  const [text, setText] = useState(initialText);
  const [location, setLocation] = useState(initialLocation || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/post/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, text, location }),
    });

    if (res.ok) {
      onSuccess();
    } else {
      alert("แก้ไขไม่สำเร็จ");
    }

    setLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1e1e1e] opacity-100 p-6 rounded-lg w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 cursor-pointer"
        >
          <X />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Edit Post
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full border rounded p-2 mb-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-700 dark:text-white"
          placeholder="แก้ข้อความโพสต์..."
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded p-2 mb-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-700 dark:text-white"
          placeholder="add location"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
