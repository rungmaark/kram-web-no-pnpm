// components/DeepInfoButton.tsx

"use client";

import { Settings } from "lucide-react";

export default function DeepInfoButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="px-4 py-2 ml-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-full shadow-md hover:brightness-110 transition-all cursor-pointer"
    >
      วิเคราะห์ตัวตนของคุณ ✨
    </button>
  );
}
