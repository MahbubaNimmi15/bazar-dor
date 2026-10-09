import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";
import CategoryNav from "@/components/CategoryNav";

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
        return await response.json();
      }
    } catch (error) {
      console.error(
        `Failed to fetch products from ${url}`,
        error
      );
    }
  }

  throw new Error(
    "Product data fetch failed from all APIs"
  );
}

function toBanglaNumber(
  value: number | string
) {
  const digits: Record<string, string> = {
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
    (digit) => digits[digit]
  );
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
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session) {
    redirect(
      "/signin?reason=protected"
    );
  }

  const { slug } = await params;

  const products = await getProducts();

  const product = products.find(
    (item) =>
      item.slug ===
      decodeURIComponent(slug)
  );

  if (!product) {
    notFound();
  }

  const minimumPrice =
    product.markets.length > 0
      ? Math.min(
          ...product.markets.map(
            (market) => market.min
          )
        )
      : product.today;

  const maximumPrice =
    product.markets.length > 0
      ? Math.max(
          ...product.markets.map(
            (market) => market.max
          )
        )
      : product.today;

  const averagePrice =
    product.markets.length > 0
      ? Math.round(
          product.markets.reduce(
            (total, market) =>
              total +
              (market.min +
                market.max) /
                2,
            0
          ) /
            product.markets.length
        )
      : product.today;

  const isUp =
    product.change.dir === "up";

  const isDown =
    product.change.dir === "down";

  const changeIcon = isUp
    ? "▲"
    : isDown
      ? "▼"
      : "—";

  const changeClass = isUp
    ? "text-green-700"
    : isDown
      ? "text-red-600"
      : "text-slate-500";

  return (
    <main className="min-h-screen bg-[#fffdf7] text-slate-900">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-2xl">
              🛒
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-green-700 sm:text-xl">
                বাজার দর
              </h1>

              <p className="truncate text-[10px] text-slate-500 sm:text-xs">
                {getBanglaDate()}
              </p>
            </div>
          </Link>

          <AuthButtons />
        </div>

        <CategoryNav />

        <div className="overflow-hidden border-t border-slate-200 bg-white py-2 text-sm text-black">
          <div className="animate-marquee whitespace-nowrap">
            {products
              .slice(0, 10)
              .map((item) => (
                <span
                  key={item.id}
                  className="mr-10 font-medium"
                >
                  {item.image}{" "}
                  {item.nameBn}{" "}
                  {toBanglaNumber(
                    item.today
                  )}{" "}
                  টাকা{" "}
                  {item.change.dir ===
                  "up"
                    ? "▲"
                    : item.change.dir ===
                        "down"
                      ? "▼"
                      : "—"}{" "}
                  {toBanglaNumber(
                    Math.abs(
                      item.change.pct
                    )
                  )}
                  %
                </span>
              ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href="/"
            className="hover:text-green-700"
          >
            হোম
          </Link>

          <span>›</span>

          <Link
            href={`/category/${product.category}`}
            className="hover:text-green-700"
          >
            {product.categoryNameBn}
          </Link>

          <span>›</span>

          <span className="font-medium text-slate-800">
            {product.nameBn}
          </span>
        </div>

        {/* Product Summary */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-5xl md:h-24 md:w-24 md:text-6xl">
                {product.image}
              </div>

              <div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  {product.nameBn}
                </h1>

                <p className="mt-3 max-w-xl text-slate-500">
                  বিভিন্ন বাজারের আজকের মূল্য,
                  সর্বনিম্ন, সর্বোচ্চ এবং গড়
                  বাজারদর।
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {product.categoryIcon}{" "}
                    {product.categoryNameBn}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {getUnit(
                      product.unit
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-[220px] rounded-2xl bg-green-50 p-6">
              <p className="text-sm text-slate-500">
                আজকের দাম
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {toBanglaNumber(
                  product.today
                )}{" "}
                টাকা
              </p>

              <p
                className={`mt-3 font-semibold ${changeClass}`}
              >
                {changeIcon}{" "}
                {toBanglaNumber(
                  Math.abs(
                    product.change.pct
                  )
                )}
                %
              </p>
            </div>
          </div>
        </section>

        {/* Price Summary */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            মূল্য সংক্ষেপ
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {toBanglaNumber(
                  minimumPrice
                )}{" "}
                টাকা
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                সর্বোচ্চ দাম
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {toBanglaNumber(
                  maximumPrice
                )}{" "}
                টাকা
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                গড় দাম
              </p>

              <p className="mt-2 text-2xl font-bold">
                {toBanglaNumber(
                  averagePrice
                )}{" "}
                টাকা
              </p>
            </div>
          </div>
        </section>

        {/* Market Prices */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            বাজারভিত্তিক আজকের দাম
          </h2>

          <p className="mt-2 text-slate-500">
            বিভিন্ন বাজারে{" "}
            {product.nameBn}-এর সর্বনিম্ন
            ও সর্বোচ্চ মূল্য
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4">
                      বাজার
                    </th>

                    <th className="px-5 py-4">
                      বিভাগ
                    </th>

                    <th className="px-5 py-4">
                      সর্বনিম্ন
                    </th>

                    <th className="px-5 py-4">
                      সর্বোচ্চ
                    </th>

                    <th className="px-5 py-4">
                      গড়
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {product.markets.map(
                    (market) => {
                      const avg =
                        Math.round(
                          (market.min +
                            market.max) /
                            2
                        );

                      return (
                        <tr
                          key={`${market.market}-${market.division}`}
                          className="border-t"
                        >
                          <td className="px-5 py-4 font-medium">
                            {
                              market.market
                            }
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {
                              market.division
                            }
                          </td>

                          <td className="px-5 py-4 text-green-700">
                            {toBanglaNumber(
                              market.min
                            )}{" "}
                            টাকা
                          </td>

                          <td className="px-5 py-4 text-red-600">
                            {toBanglaNumber(
                              market.max
                            )}{" "}
                            টাকা
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {toBanglaNumber(
                              avg
                            )}{" "}
                            টাকা
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-8 text-sm text-slate-500 md:flex-row">
          <p>
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>

          <p>
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
          </p>
        </div>
      </footer>
    </main>
  );
}