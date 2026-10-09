"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function AuthButtons() {
  const router = useRouter();

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  async function handleLogout() {
    try {
      await authClient.signOut();

      toast.success("সফলভাবে লগ আউট হয়েছে।");

      router.push("/");
      router.refresh();
    } catch {
      toast.error("লগ আউট করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/signin"
          className="rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 sm:px-4"
        >
          সাইন ইন
        </Link>

        <Link
          href="/signup"
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 sm:px-4"
        >
          সাইন আপ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 sm:px-4"
      >
        প্রোফাইল
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 sm:px-4"
      >
        লগ আউট
      </button>
    </div>
  );
}