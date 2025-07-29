// app/signin/page.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const cleanedUsername = username.replace(/\s/g, "");

    const res = await signIn("credentials", {
      username: cleanedUsername,
      password,
      redirect: false,
      callbackUrl: `/profile/${cleanedUsername}`,
    });
    setLoading(false);

    if (res?.error) {
      setMessage("Invalid username or password");
      setLoading(false);
      return;
    }
    if (res?.ok && res.url) {
      window.location.href = res.url; // ✅ reload พร้อม session
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
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
          Welcome Back!
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
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white font-semibold hover:bg-indigo-500 cursor-pointer"
          >
            {loading ? "Logging in" : "Log in"}
          </button>

          {message && (
            <p
              className={`text-center text-sm ${message === "Signin successful"
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
            onClick={() => router.push("/signup")}
          >
            Create a new account
          </div>
        </div>
      </div>
    </div>
  );
}
