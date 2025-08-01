// components/settings/DeleteAccountModal.tsx

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DeleteAccountModal() {
  const [open, setOpen] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const actualUsername = session?.user?.username;

  const closeModal = () => {
    setInputUsername("");
    setMessage("");
    setOpen(false);
  };

  const handleDelete = async () => {
    if (inputUsername == "") {
      setMessage("Username is required")
      return;
    }

    if (inputUsername !== actualUsername) {
      setMessage("Username does not match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Account deleted");
      await signOut({ callbackUrl: "/" });
    } else {
      setMessage("Failed to delete account");
    }

    setLoading(false);
  };

  return (
    <>
      <button
        className="w-full flex items-center justify-between px-4 py-2 text-sm border border-red-400 bg-red-50 dark:bg-[#2a1a1a] text-red-600 rounded-md hover:bg-red-100 dark:hover:bg-[#221414] transition cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Delete Account
        </span>
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
              transition={{ duration: 0.175 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-red-600">
                  Confirm Account Deletion
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Type your username <strong>{actualUsername}</strong> to confirm.
              </p>

              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] text-sm ring-1 ring-black/10 dark:ring-white/10 mb-4"
              />

              {message && (
                <div
                  className={`text-sm mb-4 font-medium ${message === "Account deleted"
                      ? "text-green-500"
                      : "text-red-500"
                    }`}
                >
                  {message}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-[#444] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
