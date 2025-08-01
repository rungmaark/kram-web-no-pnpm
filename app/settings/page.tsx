// app/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SettingsNavbar from "@/components/settings/SettingsNavbar";
import ChangePasswordModal from "@/components/settings/ChangePasswordModal";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";
import UnavailableFeatureModal from "@/components/UnavailableFeatureModal";
import LogoutButton from "@/components/settings/LogoutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/User";
import { toast } from "react-hot-toast";

/*
 * A list of available themes. Each entry has a `value` that is stored in
 * localStorage and sent to the API, and a `label` that is displayed to
 * the user. When new themes need to be supported, simply add another
 * object to this array. The rest of the application will automatically
 * pick up the new option.
 */
const themeOptions: { value: string; label: string }[] = [
  { value: "system", label: "System default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "account" | "privacy" | "preferences"
  >("account");

  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [theme, setTheme] = useState<string>(
    user?.theme || (typeof window !== "undefined"
      ? localStorage.getItem("theme") || "system"
      : "system")
  );

  const [showUnavailable, setShowUnavailable] = useState(false);

  /**
   * Keep the local theme state in sync with the user object returned from
   * next-auth. When the session changes (e.g. after a refresh) the new
   * theme will be reflected here.
   */
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.theme]);

  /**
   * Apply the selected theme to the document root and persist it to
   * localStorage. Whenever the `theme` state changes this effect will run.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  /**
   * Helper function to apply a specific theme immediately. This can be
   * invoked before the state update has propagated in order to provide
   * immediate feedback to the user. It's similar to the effect above but
   * does not persist anything to localStorage.
   */
  function applyTheme(mode: string) {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    }
  }

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
                onClick={() => {
                  if (tab === "privacy" || tab === "preferences") {
                    setShowUnavailable(true);
                    return;
                  }
                  setActiveTab(tab as any);
                }}

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

                  {/* Theme Options */}
                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select Theme
                      </p>
                    </div>
                    <select
                      value={theme}
                      onChange={async (e) => {
                        const newTheme = e.target.value;
                        setTheme(newTheme);  // อัปเดตสถานะก่อน เพื่อให้ useEffect ทำงาน
                        await fetch("/api/user/theme", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ theme: newTheme }),
                        });
                        toast.success("Theme updated!");
                        router.refresh();
                      }}
                      className="w-32 bg-gray-100 dark:bg-[#1e1e1e] rounded px-2 py-2.5 text-sm focus:outline-none"
                    >
                      {themeOptions.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            )}
          </motion.section>
        </div>
        <UnavailableFeatureModal open={showUnavailable} onClose={() => setShowUnavailable(false)} />
      </main>
    </>
  );
}