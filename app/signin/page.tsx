"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("reason") === "protected") {
      toast.error("পণ্যের বিস্তারিত দেখতে আগে সাইন ইন করুন।");
      window.history.replaceState({}, "", "/signin");
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setFormError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setFormError("ইমেইল লিখুন।");
      toast.error("ইমেইল লিখুন।");
      return;
    }

    if (!cleanPassword) {
      setFormError("পাসওয়ার্ড লিখুন।");
      toast.error("পাসওয়ার্ড লিখুন।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (result.error) {
        console.error("Login error:", result.error);

        const message =
          result.error.message?.toLowerCase() || "";

        if (
          message.includes("invalid") ||
          message.includes("password") ||
          message.includes("credential") ||
          message.includes("user")
        ) {
          setFormError(
            "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আগে রেজিস্টার করা থাকলে সেই তথ্য ব্যবহার করুন।"
          );

          toast.error("ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
        } else {
          setFormError(
            result.error.message ||
              "সাইন ইন করা যায়নি। আবার চেষ্টা করুন।"
          );

          toast.error("সাইন ইন করা যায়নি।");
        }

        return;
      }

      toast.success("সাইন ইন সফল হয়েছে।");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign in failed:", error);

      setFormError(
        "সার্ভারের সাথে সংযোগ করা যায়নি। আবার চেষ্টা করুন।"
      );

      toast.error("সাইন ইন করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(
    provider: "google" | "github"
  ) {
    setFormError("");
    setSocialLoading(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (result?.error) {
        console.error(
          `${provider} login error:`,
          result.error
        );

        toast.error(
          provider === "google"
            ? "Google login শুরু করা যায়নি।"
            : "GitHub login শুরু করা যায়নি।"
        );

        setSocialLoading(null);
      }
    } catch (error) {
      console.error("Social login error:", error);

      toast.error("Social login শুরু করা যায়নি।");
      setSocialLoading(null);
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
            onClick={() => handleSocialLogin("google")}
            disabled={socialLoading !== null || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-bold">G</span>

            {socialLoading === "google"
              ? "Google খুলছে..."
              : "Google দিয়ে সাইন ইন"}
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            disabled={socialLoading !== null || loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
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
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              ইমেইল
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError("");
              }}
              placeholder="example@email.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              পাসওয়ার্ড
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError("");
              }}
              placeholder="আপনার পাসওয়ার্ড"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || socialLoading !== null}
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