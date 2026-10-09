import Link from "next/link";
import { notFound } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";
import CategoryNav from "@/components/CategoryNav";
import SortSelect from "./SortSelect";

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
      console.error(`Failed to fetch products from ${url}`, error);
    }
  }

  throw new Error("Category product data fetch failed");
}

function toBanglaNumber(value: number | string) {
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort = "default" } = await searchParams;

  const products = await getProducts();

  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  const categoryProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === decodedSlug
  );

  if (categoryProducts.length === 0) {
    notFound();
  }

  const sortedProducts = [...categoryProducts];

  if (sort === "low") {
    sortedProducts.sort(
      (a, b) => Number(a.today) - Number(b.today)
    );
  }

  if (sort === "high") {
    sortedProducts.sort(
      (a, b) => Number(b.today) - Number(a.today)
    );
  }

  const categoryName =
    categoryProducts[0].categoryNameBn;

  const categoryIcon =
    categoryProducts[0].categoryIcon;

  return (
    <main className="min-h-screen bg-[#fffdf7] text-slate-900">
      {/* Navbar */}
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

        {/* Active category */}
        <CategoryNav />

        {/* Ticker */}
        <div className="overflow-hidden border-t border-slate-200 bg-white py-2 text-sm text-black">
          <div className="animate-marquee whitespace-nowrap">
            {products.slice(0, 10).map((product) => (
              <span
                key={product.id}
                className="mr-10 font-medium"
              >
                {product.image} {product.nameBn}{" "}
                {toBanglaNumber(product.today)} টাকা{" "}
                {product.change.dir === "up"
                  ? "▲"
                  : product.change.dir === "down"
                    ? "▼"
                    : "—"}{" "}
                {toBanglaNumber(
                  Math.abs(product.change.pct)
                )}
                %
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Category heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-5xl">
              {categoryIcon}
            </div>

            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              {categoryName}
            </h1>

            <p className="mt-2 text-slate-500">
              আজকের {categoryName}-এর বাজারদর
            </p>
          </div>

          <SortSelect />
        </div>

        {/* Product Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => {
            const isUp =
              product.change.dir === "up";

            const isDown =
              product.change.dir === "down";

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-5xl">
                  {product.image}
                </div>

                <h2 className="mt-4 text-lg font-bold">
                  {product.nameBn}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {getUnit(product.unit)}
                </p>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      আজকের দাম
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {toBanglaNumber(
                        product.today
                      )}{" "}
                      টাকা
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isUp
                        ? "bg-green-100 text-green-700"
                        : isDown
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isUp
                      ? "▲"
                      : isDown
                        ? "▼"
                        : "—"}{" "}
                    {toBanglaNumber(
                      Math.abs(
                        product.change.pct
                      )
                    )}
                    %
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
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