import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";

type Market = {
  market: string;
  division: string;
  min: number;
  max: number;
};

type Product = {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
  markets: Market[];
};

const API_URLS = [
  "https://api.api-store.workers.dev/api/bazardor/products",
  "https://api.abcz.workers.dev/api/bazardor/products",
];

async function getProducts(): Promise<Product[]> {
  for (const url of API_URLS) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        const data: Product[] = await response.json();
        return data;
      }
    } catch (error) {
      console.error(`Failed to fetch products from ${url}`, error);
    }
  }

  throw new Error("Product data fetch failed from all APIs");
}

function toBanglaNumber(value: number | string) {
  const map: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };

  return String(value).replace(/[0-9]/g, (digit) => map[digit]);
}

function getUnit(unit: string) {
  if (unit === "kg") return "প্রতি কেজি";
  if (unit === "litre") return "প্রতি লিটার";
  if (unit === "dozen") return "প্রতি ডজন";
  if (unit === "piece") return "প্রতি পিস";

  return unit;
}

function getBanglaDate() {
  return new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Protected route
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { slug } = await params;

  const products = await getProducts();

  const product = products.find(
    (item) => item.slug === decodeURIComponent(slug)
  );

  if (!product) {
    notFound();
  }

  const marketMinimums = product.markets.map((market) => market.min);
  const marketMaximums = product.markets.map((market) => market.max);

  const minimumPrice =
    marketMinimums.length > 0
      ? Math.min(...marketMinimums)
      : product.today;

  const maximumPrice =
    marketMaximums.length > 0
      ? Math.max(...marketMaximums)
      : product.today;

  const averagePrice =
    product.markets.length > 0
      ? Math.round(
          product.markets.reduce((total, market) => {
            return total + (market.min + market.max) / 2;
          }, 0) / product.markets.length
        )
      : product.today;

  const isUp = product.change.dir === "up";
  const isDown = product.change.dir === "down";

  const changeIcon = isUp ? "▲" : isDown ? "▼" : "—";

  const changeClass = isUp
    ? "text-green-700"
    : isDown
      ? "text-red-600"
      : "text-slate-500";

  return (
    <main className="min-h-screen bg-[#fffdf7] text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 shadow-sm">
              <span
                className="text-2xl"
                role="img"
                aria-label="Shopping Cart"
              >
                🛒
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-green-700">
                বাজার দর
              </h1>

              <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                {getBanglaDate()}
              </p>
            </div>
          </Link>

          <AuthButtons />
        </div>

        {/* Category Menu */}
        <div className="border-t border-slate-100">
          <nav className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-2.5 text-sm font-medium">
            <Link
              href="/"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🏠 সব
            </Link>

            <Link
              href="/category/chal"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🍚 চাল
            </Link>

            <Link
              href="/category/dal"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🫘 ডাল
            </Link>

            <Link
              href="/category/tel"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🫙 তেল
            </Link>

            <Link
              href="/category/sobji"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🥬 সবজি
            </Link>

            <Link
              href="/category/mach"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🐟 মাছ
            </Link>

            <Link
              href="/category/mangsho"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🍗 মাংস
            </Link>

            <Link
              href="/category/dim-dui"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🥛 ডিম-দুধ
            </Link>

            <Link
              href="/category/mosla"
              className="whitespace-nowrap transition hover:text-green-700"
            >
              🌶️ মসলা
            </Link>
          </nav>
        </div>

        {/* Price Ticker */}
        <div className="overflow-hidden border-t border-slate-100 bg-white py-2 text-xs text-black">
          <div className="animate-marquee whitespace-nowrap">
            {products.slice(0, 10).map((item) => (
              <span
                key={item.id}
                className="mr-10 font-medium"
              >
                {item.image} {item.nameBn}{" "}
                {toBanglaNumber(item.today)} টাকা
                /{getUnit(item.unit).replace("প্রতি ", "")}{" "}
                <span
                  className={
                    item.change.dir === "up"
                      ? "text-green-700"
                      : item.change.dir === "down"
                        ? "text-red-600"
                        : "text-slate-500"
                  }
                >
                  {item.change.dir === "up"
                    ? "▲"
                    : item.change.dir === "down"
                      ? "▼"
                      : "—"}{" "}
                  {toBanglaNumber(
                    Math.abs(item.change.pct)
                  )}
                  %
                </span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 md:py-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href="/"
            className="transition hover:text-green-700"
          >
            হোম
          </Link>

          <span>›</span>

          <Link
            href={`/category/${product.category}`}
            className="transition hover:text-green-700"
          >
            {product.categoryNameBn}
          </Link>

          <span>›</span>

          <span className="font-medium text-slate-800">
            {product.nameBn}
          </span>
        </div>

        {/* Logged In User */}
        <p className="mt-5 text-sm text-red-700">
          {session.user.email}
        </p>

        {/* Product Main */}
        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-5xl md:h-24 md:w-24 md:text-6xl">
                {product.image}
              </div>

              <div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  {product.nameBn}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {product.categoryIcon}{" "}
                    {product.categoryNameBn}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {getUnit(product.unit)}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  গতকালের তুলনায় আজ দাম{" "}
                  <span
                    className={`font-semibold ${changeClass}`}
                  >
                    {changeIcon}{" "}
                    {toBanglaNumber(
                      Math.abs(product.change.pct)
                    )}
                    %
                  </span>
                </p>
              </div>
            </div>

            {/* Current Price */}
            <div className="min-w-[220px] rounded-2xl bg-green-50 p-5 md:p-6">
              <p className="text-sm text-slate-500">
                আজকের দাম
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {toBanglaNumber(product.today)} টাকা
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {getUnit(product.unit)}
              </p>

              <p
                className={`mt-3 text-sm font-semibold ${changeClass}`}
              >
                {changeIcon}{" "}
                {toBanglaNumber(
                  Math.abs(product.change.pct)
                )}
                %
              </p>
            </div>
          </div>
        </section>

        {/* Price Summary */}
        <section className="mt-9">
          <h2 className="text-2xl font-bold">
            দামের সারসংক্ষেপ
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {toBanglaNumber(minimumPrice)} টাকা
              </p>

              <p className="mt-1 text-xs text-slate-400">
                বাজারে পাওয়া সর্বনিম্ন মূল্য
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                সর্বোচ্চ দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {toBanglaNumber(maximumPrice)} টাকা
              </p>

              <p className="mt-1 text-xs text-slate-400">
                বাজারে পাওয়া সর্বোচ্চ মূল্য
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                গড় দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {toBanglaNumber(averagePrice)} টাকা
              </p>

              <p className="mt-1 text-xs text-slate-400">
                প্রতি ইউনিটের গড় মূল্য
              </p>
            </div>
          </div>
        </section>

        {/* Historical Prices */}
        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                গতকাল
              </p>

              <p className="mt-2 text-xl font-bold">
                {toBanglaNumber(product.yesterday)} টাকা
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                গত সপ্তাহ
              </p>

              <p className="mt-2 text-xl font-bold">
                {toBanglaNumber(product.lastWeek)} টাকা
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                গত মাস
              </p>

              <p className="mt-2 text-xl font-bold">
                {toBanglaNumber(product.lastMonth)} টাকা
              </p>
            </div>
          </div>
        </section>

        {/* Market Table */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              বাজারভিত্তিক আজকের দাম
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              বিভিন্ন বাজারে {product.nameBn}-এর
              সর্বনিম্ন, সর্বোচ্চ এবং গড় মূল্য।
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      বাজার
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      বিভাগ
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      সর্বনিম্ন
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      সর্বোচ্চ
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      গড়
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {product.markets.map((market) => {
                    const marketAverage = Math.round(
                      (market.min + market.max) / 2
                    );

                    return (
                      <tr
                        key={`${market.market}-${market.division}`}
                        className="border-t border-slate-100 text-sm transition hover:bg-green-50/40"
                      >
                        <td className="px-5 py-4 font-medium">
                          {market.market}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {market.division}
                        </td>

                        <td className="px-5 py-4 text-green-700">
                          {toBanglaNumber(market.min)} টাকা
                        </td>

                        <td className="px-5 py-4 text-red-600">
                          {toBanglaNumber(market.max)} টাকা
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {toBanglaNumber(marketAverage)} টাকা
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-7 text-sm text-slate-500 md:flex-row">
          <p>
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>

          <p>
            বাজার অনুযায়ী মূল্য পরিবর্তিত হতে পারে।
          </p>
        </div>
      </footer>
    </main>
  );
}