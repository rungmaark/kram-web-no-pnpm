// components/settings/ChangePasswordModal.tsx

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ChangePasswordModal() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const closeModal = () => {
    setCurrent("");
    setNewPassword("");
    setConfirm("");
    setError("");
    setOpen(false);
  };

  const handleSubmit = async () => {
    setError("");         // เคลียร์ก่อนทุกครั้ง
    if (newPassword !== confirm) {
      setError("New password is not matched");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
      } else {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
        closeModal();
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition text-sm font-medium cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <KeyRound className="w-4 h-4" />
        Change Password
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-[#1e1e1e] w-full max-w-md mx-4 p-6 rounded-lg shadow-lg relative"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Change Password</h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] ring-1 ring-black/10 dark:ring-white/10"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] ring-1 ring-black/10 dark:ring-white/10"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] ring-1 ring-black/10 dark:ring-white/10"
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-[#444]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
