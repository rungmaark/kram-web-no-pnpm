// components/settings/SettingsNavbar.tsx

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

function SettingsNavbar() {
  return (
    <header className="bg-white dark:bg-navbarblack shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft size={18} className="mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-xl text-gray-900 dark:text-gray-100">
              Settings
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SettingsNavbar;
