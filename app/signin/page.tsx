"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    if (!email.trim() || !password.trim()) {
      setIsError(true);
      setMessage("ইমেইল এবং পাসওয়ার্ড দিন।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setIsError(true);
        setMessage(error.message || "সাইন ইন ব্যর্থ হয়েছে।");
        return;
      }

      setIsError(false);
      setMessage("সাইন ইন সফল হয়েছে।");

      router.push("/");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setSocialLoading("google");

      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setSocialLoading(null);
      setIsError(true);
      setMessage("Google login শুরু করা যায়নি।");
    }
  }

  async function handleGithubLogin() {
    try {
      setSocialLoading("github");

      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch {
      setSocialLoading(null);
      setIsError(true);
      setMessage("GitHub login শুরু করা যায়নি।");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
        <div className="text-center">
          <div className="text-5xl">🛒</div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            সাইন ইন করুন
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            আপনার বাজার দর অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <span className="text-lg">G</span>
            {socialLoading === "google"
              ? "Google খুলছে..."
              : "Google দিয়ে সাইন ইন"}
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={socialLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-black disabled:opacity-60"
          >
            <span className="text-lg">◉</span>
            {socialLoading === "github"
              ? "GitHub খুলছে..."
              : "GitHub দিয়ে সাইন ইন"}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">
            অথবা
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ইমেইল
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              পাসওয়ার্ড
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="আপনার পাসওয়ার্ড"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                isError
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-500">
            অ্যাকাউন্ট নেই?{" "}
            <Link
              href="/signup"
              className="font-semibold text-green-700 hover:underline"
            >
              রেজিস্টার করুন
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-green-700"
        >
          ← হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}