// app/signup/page.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // state สำหรับ confirmPassword
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    const cleanedUsername = username.replace(/\s/g, "");

    // 1) เรียก API สมัครสมาชิก
    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanedUsername,
        displayName,
        password,
      }),
    });

    const data = await signupRes.json();
    if (!signupRes.ok) {
      setMessage(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // 2) สมัครสำเร็จ → login ทันที (redirect เต็มหน้า)
    await signIn("credentials", {
      username: cleanedUsername,
      password,
      callbackUrl: `/profile/${cleanedUsername}`, // full reload
    });
    /* ไม่ต้อง router.push / router.refresh() อีก
     page จะโหลดใหม่พร้อม session */
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Google sign-up button uses full redirect
  const handleGoogle = () => {
    signIn("google", {
      prompt: "consent",
      access_type: "offline",
      callbackUrl: `${window.location.origin}/auth/redirect`,
    });
  };
  return (
    <div className="flex min-h-screen flex-1 flex-col px-6 lg:px-30 xl:px-50 lg:px-8 dark:bg-gray-800">
      <div
        className="flex mt-5 mb-10 sm:mb-25"
      >
        <img
          src="/image/KramLogo.svg"
          alt="Kram Logo"
          className="h-10 w-auto cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create an Account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = raw.toLowerCase().replace(/[^a-z0-9._!]/g, "");
                setUsername(cleaned);
              }}
              className="mt-2 block w-full rounded-md px-3 py-1.5 text-gray-900 placeholder-gray-400 border border-gray-400 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2 block w-full rounded-md px-3 py-1.5 text-gray-900 placeholder-gray-400 border border-gray-400 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-md px-3 py-1.5 text-gray-900 placeholder-gray-400 border border-gray-400 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 mb-3 block w-full rounded-md px-3 py-1.5 text-gray-900 placeholder-gray-400 border border-gray-400 dark:text-gray-100"
            />
            <div className="flex">
              <input type="checkbox" onChange={handleShowPassword} />
              <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Show password
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white font-semibold hover:bg-indigo-500 cursor-pointer ${loading ? "animate-pulse" : ""
              }`}
          >
            {loading ? "Loading" : "Sign up"}
          </button>

          {/* ปุ่ม Google Sign up */}
          <button
            type="button"
            onClick={handleGoogle}
            className="flex items-center justify-center w-full gap-2 rounded-md bg-white border border-gray-300 shadow-sm px-3 py-1.5 text-gray-700 font-semibold hover:bg-gray-100 cursor-pointer transition"
          >
            <Image
              src="/image/google-logo.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            <span>Sign up with Google</span>
          </button>


          {message && (
            <p
              className={`text-center text-sm ${message === "User registered successfully"
                ? "text-green-500"
                : "text-red-500"
                }`}
            >
              {message}
            </p>
          )}
        </form>
        <div className="mt-5 flex flex-col gap-3">
          <div
            className="text-blue-600 font-semibold w-full text-center cursor-pointer dark:text-blue-400"
            onClick={() => router.push("/signin")}
          >
            Already have an account?
          </div>
        </div>
      </div>
    </div>
  );
}
