"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();

  const {
    data: session,
    isPending,
    refetch,
  } = authClient.useSession();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      toast.error("প্রোফাইল দেখতে আগে সাইন ইন করুন।");
      router.replace("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("নাম লিখুন।");
      return;
    }

    setSaving(true);

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
      });

      if (error) {
        toast.error(
          error.message || "প্রোফাইল আপডেট করা যায়নি।"
        );
        return;
      }

      await refetch();

      toast.success("প্রোফাইল সফলভাবে আপডেট হয়েছে।");
    } catch {
      toast.error("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await authClient.signOut();

      toast.success("সফলভাবে লগ আউট হয়েছে।");

      router.push("/signin");
      router.refresh();
    } catch {
      toast.error("লগ আউট করা যায়নি।");
      setLoggingOut(false);
    }
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-green-600" />

          <p className="mt-4 text-sm text-slate-500">
            প্রোফাইল লোড হচ্ছে...
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
        >
          ← হোম পেজে ফিরে যান
        </Link>

        <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
              {session.user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="text-sm font-medium text-green-700">
                আপনার প্রোফাইল
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                {session.user.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {session.user.email}
              </p>
            </div>
          </div>

          <div className="my-8 h-px bg-slate-200" />

          <form onSubmit={handleUpdate}>
            <h2 className="text-xl font-bold">
              প্রোফাইল আপডেট
            </h2>

            <div className="mt-5">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                নাম
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ইমেইল
              </label>

              <input
                type="email"
                value={session.user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "আপডেট হচ্ছে..." : "নাম আপডেট করুন"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {loggingOut ? "লগ আউট হচ্ছে..." : "লগ আউট"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}