// components/UnavailableFeatureModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function UnavailableFeatureModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 max-w-sm w-full mx-4 relative text-center shadow-xl"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-lg font-semibold mb-2">ขออภัยสำหรับความไม่สะดวกน้าา</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            น้อง dev ยังทำ feature นี้ไม่เสร็จ 🥲🙏<br />
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
