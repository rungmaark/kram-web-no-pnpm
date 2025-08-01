// app/settings/page.tsx

"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import SettingsNavbar from "@/components/settings/SettingsNavbar";
import ChangePasswordModal from "@/components/settings/ChangePasswordModal";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";
import LogoutButton from "@/components/settings/LogoutButton";
import { useSession } from "next-auth/react";
import type { User } from "@/types/User";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "account" | "privacy" | "preferences"
  >("account");

  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = async () => {
    setLoading(true);
    if (email === user?.email) {
      toast("No changes made");
      return;
    }
    await fetch("/api/auth/email/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    toast.success("Saved! Please verify your email.");
    setLoading(false);
  };

  return (
    <>
      <SettingsNavbar />
      <main className="min-h-screen px-4 py-12 bg-gray-50 dark:bg-navbarblack text-gray-900 dark:text-gray-200 transition-colors">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="flex justify-center rounded-lg bg-gray-100 dark:bg-[#181818] p-1 w-fit mx-auto shadow-sm">
            {["account", "privacy", "preferences"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm rounded-md transition-all font-medium capitalize cursor-pointer ${activeTab === tab
                    ? "bg-white dark:bg-navbarblack text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  }`}
              >
                {tab === "account"
                  ? "Account"
                  : tab === "privacy"
                    ? "Privacy & Security"
                    : "Preferences"}
              </button>
            ))}
          </div>

          {/* Content */}
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 space-y-6"
          >
            {/* --------------------- ACCOUNT --------------------- */}
            {activeTab === "account" && (
              <>
                <div className="space-y-1 mb-6">
                  <h2 className="text-lg font-semibold">Account Settings</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your account preferences and data.
                  </p>
                </div>

                <div className="space-y-8 text-sm">
                  {/* --- Contact Info --- */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      User Data
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Password
                      </label>
                      <ChangePasswordModal />
                    </div>
                  </section>

                  {/* --- Logout --- */}
                  <section className="pt-2 border-t border-gray-200 dark:border-white/10">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      Account Actions
                    </h3>
                    <div>
                      <LogoutButton />
                    </div>
                  </section>

                  {/* --- Danger Zone --- */}
                  <section className="pt-2 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <h3 className="text-sm font-semibold text-red-500">
                      Danger Zone
                    </h3>

                    <DeleteAccountModal />
                  </section>

                  {/* --- Save Changes Button --- */}
                  <div className="pt-6">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md text-sm hover:opacity-90 transition w-full"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* --------------------- PRIVACY --------------------- */}
            {activeTab === "privacy" && (
              <>
                <div className="space-y-1 mb-6">
                  <h2 className="text-lg font-semibold">Privacy & Security</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Control who can see your content and how your data is use
                  </p>
                </div>

                <div className="space-y-8 text-sm">
                  {/* Account Visibility */}
                  <section>
                    <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Account Visibility
                    </h3>
                    <label className="flex justify-between items-center">
                      <span>Private Account</span>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                    </label>
                  </section>

                  {/* Content & Interaction */}
                  <section>
                    <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Content & Interaction
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1">
                          Who can see your posts
                        </label>
                        <select className="w-full bg-gray-100 dark:bg-[#1e1e1e] rounded-lg px-3 py-2 focus:outline-none">
                          <option>Everyone</option>
                          <option>Friends only</option>
                          <option>Only me</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">
                          Who can message you
                        </label>
                        <select className="w-full bg-gray-100 dark:bg-[#1e1e1e] rounded-lg px-3 py-2 focus:outline-none">
                          <option>Everyone</option>
                          <option>Friends only</option>
                          <option>No one</option>
                        </select>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}

            {/* --------------------- PREFERENCES --------------------- */}
            {activeTab === "preferences" && (
              <section>
                <div className="space-y-1 mb-6">
                  <h2 className="text-lg font-semibold">Preferences</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize how the app looks and behaves based on your
                    preferences.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#1e1e1e] ring-1 ring-black/10 dark:ring-white/10 text-sm">
                      <option>English</option>
                      <option>ภาษาไทย</option>
                      <option>Español</option>
                      <option>中文</option>
                    </select>
                  </div>

                  {/* Dark Mode toggle */}
                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Switch to dark theme
                      </p>
                    </div>
                    <select
                      className="w-32 bg-gray-100 dark:bg-[#1e1e1e] rounded px-2 py-2.5 text-sm focus:outline-none"
                      onChange={(e) => {
                        const mode = e.target.value;
                        localStorage.setItem("theme", mode);
                        if (mode === "dark") {
                          document.documentElement.classList.add("dark");
                        } else if (mode === "light") {
                          document.documentElement.classList.remove("dark");
                        } else {
                          // 'system'
                          const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                          document.documentElement.classList.toggle("dark", isDark);
                        }
                      }}
                      defaultValue={typeof window !== "undefined" ? localStorage.getItem("theme") || "system" : "system"}
                    >
                      <option value="system">System default</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>

                  </div>
                </div>
              </section>
            )}
          </motion.section>
        </div>
      </main>
    </>
  );
}
