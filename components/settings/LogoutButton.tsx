// components/settings/LogoutButton.tsx

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

function LogoutButton() {
  async function handleSignout() {
    try {
      await signOut({ redirect: true, callbackUrl: "http://localhost:3000" }); // ใช้ https://kram.one ใน production
    } catch (error) {
      console.error("Signout failed:", error); 
    }
  }
  return (
    <button
      className=" flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition text-sm font-medium cursor-pointer"
      onClick={handleSignout}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

export default LogoutButton;
