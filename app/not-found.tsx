import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 text-slate-900">
      <div className="max-w-md text-center">
        <div className="text-7xl">🛒</div>

        <h1 className="mt-6 text-6xl font-bold text-green-700">
          404
        </h1>

        <h2 className="mt-3 text-2xl font-bold">
          পেজটি পাওয়া যায়নি
        </h2>

        <p className="mt-3 text-slate-500">
          আপনি যে পেজ বা পণ্যটি খুঁজছেন, সেটি পাওয়া যায়নি।
        </p>

        <Link
          href="/"
          className="mt-7 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}