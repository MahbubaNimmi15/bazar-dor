"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setIsError(true);
      setMessage("সবগুলো তথ্য পূরণ করুন।");
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        setIsError(true);
        setMessage(error.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
        return;
      }

      setIsError(false);
      setMessage("রেজিস্ট্রেশন সফল হয়েছে।");

      setTimeout(() => {
        router.push("/signin");
      }, 800);
    } catch {
      setIsError(true);
      setMessage("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
        <div className="text-center">
          <div className="text-5xl">🛒</div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            বাজার দর ব্যবহার করতে আপনার তথ্য দিন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              নাম
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ইমেইল
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600"
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
              placeholder="কমপক্ষে ৮ অক্ষর"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600"
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
            {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্টার করুন"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-500">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/signin"
              className="font-semibold text-green-700 hover:underline"
            >
              সাইন ইন করুন
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