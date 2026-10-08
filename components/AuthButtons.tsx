"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthButtons() {
  const router = useRouter();

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  async function handleLogout() {
    await authClient.signOut();

    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return (
      <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
        >
          প্রোফাইল
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
        >
          লগ আউট
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/signin"
        className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
      >
        সাইন ইন
      </Link>

      <Link
        href="/signup"
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        সাইন আপ
      </Link>
    </div>
  );
}