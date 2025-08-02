// components/SendFeedbackModal.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile, Frown, Meh, Laugh, Angry } from "lucide-react";

export default function SendFeedbackModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [feedback, setFeedback] = useState("");
    const [emoji, setEmoji] = useState<number | null>(null);

    const handleSubmit = async () => {
        if (emoji !== null || feedback.trim()) {
            try {
                const res = await fetch("/api/feedback", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ emoji, feedback }),
                });

                if (res.ok) {
                    onClose();
                } else {
                    const data = await res.json();
                    console.error("Feedback error:", data.error);
                }
            } catch (err) {
                console.error("ส่ง feedback ไม่สำเร็จ:", err);
            }
        }
    };


    const emojiOptions = [
        { icon: <Angry className="w-5 h-5" />, value: 0 },
        { icon: <Frown className="w-5 h-5" />, value: 1 },
        { icon: <Meh className="w-5 h-5" />, value: 2 },
        { icon: <Smile className="w-5 h-5" />, value: 3 },
        { icon: <Laugh className="w-5 h-5" />, value: 4 },
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <div
                        className="flex items-center justify-center h-full w-full px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full relative shadow-xl"
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-500 bg-white/15 p-1.75 rounded-full  hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                                Give feedback
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                                What do you think of Kram?
                            </p>

                            <div className="flex justify-center gap-3 mb-6">
                                {emojiOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setEmoji(emoji === opt.value ? null : opt.value)}
                                        className={`p-2 rounded-full border transition-all duration-150 cursor-pointer
                                        ${emoji === opt.value
                                                ? "bg-kramblue text-white border-kramblue shadow-md"
                                                : "border-gray-300 dark:border-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                                            }`}
                                    >
                                        {opt.icon}
                                    </button>
                                ))}
                            </div>

                            <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-300">
                                Do you have any thoughts you’d like to share?
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-24 border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-neutral-800 text-sm text-gray-800 dark:text-gray-100 resize-none mb-5 focus:outline-none focus:ring-2 focus:ring-kramblue/50"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleSubmit}
                                    className="px-5 py-2 rounded-lg bg-kramblue text-white text-sm hover:bg-blue-600 transition cursor-pointer"
                                >
                                    Send
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
