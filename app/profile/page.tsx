"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();

  const {
    data: session,
    isPending,
    refetch,
  } = authClient.useSession();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setIsError(true);
      setMessage("নাম লিখুন।");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
      });

      if (error) {
        setIsError(true);
        setMessage(error.message || "প্রোফাইল আপডেট করা যায়নি।");
        return;
      }

      await refetch();

      setIsError(false);
      setMessage("প্রোফাইল সফলভাবে আপডেট হয়েছে।");
    } catch {
      setIsError(true);
      setMessage("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await authClient.signOut();

    router.push("/signin");
    router.refresh();
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7]">
        <p className="text-slate-500">লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7]">
        <p className="text-slate-500">সাইন ইন পেজে নেওয়া হচ্ছে...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              আমার প্রোফাইল
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              আপনার অ্যাকাউন্টের তথ্য
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">নাম</p>
            <p className="mt-1 font-semibold text-slate-900">
              {session.user.name}
            </p>

            <p className="mt-5 text-sm text-slate-500">ইমেইল</p>
            <p className="mt-1 font-semibold text-slate-900">
              {session.user.email}
            </p>
          </div>

          <form onSubmit={handleUpdate} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                নাম পরিবর্তন করুন
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
              className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "আপডেট হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
          >
            লগ আউট
          </button>

          <Link
            href="/"
            className="mt-6 block text-center text-sm font-medium text-slate-500 hover:text-green-700"
          >
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </main>
  );
}