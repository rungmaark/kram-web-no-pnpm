// components/DeepInfoPanel.tsx

"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeepInfoPanel({
  open,
  onClose,
  onSave,
  defaultRawText,
  defaultInterests,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (rawText: string, interests: string[]) => void;
  defaultRawText?: string;
  defaultInterests?: string[];
}) {
  const [rawText, setRawText] = useState<string>(defaultRawText ?? "");
  type Chip = { label: string; accepted: boolean };
  const [chips, setChips] = useState<Chip[]>(
    (defaultInterests ?? []).map(label => ({ label, accepted: true }))
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: rawText }),
      });
      if (!res.ok) throw new Error("ไม่สามารถวิเคราะห์ได้ ลองใหม่อีกครั้ง");
      const data: { interests: string[] } = await res.json();
      setChips(data.interests.map((c) => ({ label: c, accepted: true })));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    try {
      const confirmed = chips.filter((c) => c.accepted).map((c) => c.label);
      const res = await fetch("/api/profile/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, interests: confirmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถบันทึกข้อมูลได้");
      }
      // สรุปว่าเซฟสำเร็จแล้วค่อยปิด panel
      onSave?.(rawText, confirmed);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) {
      setRawText(defaultRawText ?? "");
      setChips(
        (defaultInterests ?? []).map(label => ({ label, accepted: true }))
      );
      setError(null);
      setLoading(false);
    }
  }, [open, defaultRawText, defaultInterests]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-lg shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
              อธิบายตัวตนของคุณ ✨
            </h2>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="เล่าเกี่ยวกับตัวคุณ คุณคือใคร สิ่งที่ชอบ สถานที่คุณชอบไป งานอดิเรก ฯลฯ"
              className="w-full h-40 resize-none p-3 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={analyze}
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center cursor-pointer"
              >
                {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                วิเคราะห์
              </button>
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>

            <AnimatePresence mode="popLayout">
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {chips.map((chip, idx) => (
                    <motion.div
                      key={chip.label}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <span
                        onClick={() =>
                          setChips((c) =>
                            c.map((ci, i) =>
                              i === idx ? { ...ci, accepted: !ci.accepted } : ci
                            )
                          )
                        }
                        className={`px-3 py-1 rounded-full border cursor-pointer flex items-center text-sm select-none transition-all ${chip.accepted
                          ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200"
                          : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-600"
                          }`}
                      >
                        {chip.label}
                        {chip.accepted ? (
                          <Check size={14} className="ml-1" />
                        ) : (
                          <X size={14} className="ml-1" />
                        )}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={save}
                disabled={loading || chips.every((c) => !c.accepted)}
                className="px-4 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center cursor-pointer"
              >
                {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                บันทึก
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
