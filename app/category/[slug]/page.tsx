import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
  const banglaDigits: Record<string, string> = {
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

  return String(value).replace(
    /[0-9]/g,
    (digit) => banglaDigits[digit]
  );
}

function getUnit(unit: string) {
  switch (unit) {
    case "kg":
      return "প্রতি কেজি";

    case "litre":
      return "প্রতি লিটার";

    case "dozen":
      return "প্রতি ডজন";

    case "piece":
      return "প্রতি পিস";

    default:
      return unit;
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Login check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { slug } = await params;

  // API fallback
  const products = await getProducts();

  const product = products.find(
    (item) => item.slug === decodeURIComponent(slug)
  );

  if (!product) {
    notFound();
  }

  const minimumPrice = Math.min(
    ...product.markets.map((market) => market.min)
  );

  const maximumPrice = Math.max(
    ...product.markets.map((market) => market.max)
  );

  const averagePrice = Math.round(
    product.markets.reduce((total, market) => {
      return total + (market.min + market.max) / 2;
    }, 0) / product.markets.length
  );

  const changeIcon =
    product.change.dir === "up"
      ? "▲"
      : product.change.dir === "down"
        ? "▼"
        : "—";

  const changeColor =
    product.change.dir === "up"
      ? "text-green-700 bg-green-100"
      : product.change.dir === "down"
        ? "text-red-600 bg-red-100"
        : "text-slate-600 bg-slate-100";

  return (
    <main className="min-h-screen bg-[#fffdf7] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
        >
          ← হোম পেজে ফিরে যান
        </Link>

        {/* Product Header */}
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-5xl md:h-24 md:w-24 md:text-6xl">
                {product.image}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-green-700">
                  পণ্যের বিস্তারিত
                </p>

                <h1 className="text-3xl font-bold md:text-4xl">
                  {product.nameBn}
                </h1>

                <p className="mt-3 max-w-xl text-slate-500">
                  আজকের বাজারভিত্তিক মূল্য, সর্বনিম্ন ও সর্বোচ্চ দাম এবং
                  সাম্প্রতিক মূল্য পরিবর্তন।
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {product.categoryIcon} {product.categoryNameBn}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {getUnit(product.unit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Today Price */}
            <div className="min-w-[220px] rounded-2xl bg-green-50 p-6">
              <p className="text-sm text-slate-500">
                আজকের দাম
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {toBanglaNumber(product.today)} টাকা
              </p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${changeColor}`}
              >
                {changeIcon}{" "}
                {toBanglaNumber(Math.abs(product.change.pct))}%
              </span>
            </div>
          </div>
        </section>

        {/* Price Summary */}
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">
            মূল্য সংক্ষেপ
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {toBanglaNumber(minimumPrice)} টাকা
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                সর্বোচ্চ দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {toBanglaNumber(maximumPrice)} টাকা
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                গড় দাম
              </p>

              <p className="mt-2 text-2xl font-bold">
                {toBanglaNumber(averagePrice)} টাকা
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                গতকালের দাম
              </p>

              <p className="mt-2 text-2xl font-bold">
                {toBanglaNumber(product.yesterday)} টাকা
              </p>
            </div>
          </div>
        </section>

        {/* Previous Prices */}
        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">
                আজ
              </p>

              <p className="mt-1 font-bold">
                {toBanglaNumber(product.today)} টাকা
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">
                গত সপ্তাহ
              </p>

              <p className="mt-1 font-bold">
                {toBanglaNumber(product.lastWeek)} টাকা
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">
                গত মাস
              </p>

              <p className="mt-1 font-bold">
                {toBanglaNumber(product.lastMonth)} টাকা
              </p>
            </div>
          </div>
        </section>

        {/* Market Prices */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              বাজারভিত্তিক আজকের দাম
            </h2>

            <p className="mt-2 text-slate-500">
              বিভিন্ন বাজারে {product.nameBn}-এর সর্বনিম্ন ও সর্বোচ্চ মূল্য
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {product.markets.map((market) => (
              <div
                key={`${market.market}-${market.division}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {market.market}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      📍 {market.division}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {getUnit(product.unit)}
                    </p>

                    <p className="mt-1 font-bold text-green-700">
                      {toBanglaNumber(market.min)}
                      {" - "}
                      {toBanglaNumber(market.max)} টাকা
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}