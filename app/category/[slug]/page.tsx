import Link from "next/link";
import { notFound } from "next/navigation";
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
        const data: Product[] = await response.json();
        return data;
      }
    } catch (error) {
      console.error(`Failed to fetch category products from ${url}`, error);
    }
  }

  throw new Error("Category product data fetch failed from all APIs");
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
    (product) => product.category.toLowerCase() === decodedSlug
  );

  if (categoryProducts.length === 0) {
    notFound();
  }

  let sortedProducts = [...categoryProducts];

  if (sort === "low") {
    sortedProducts.sort((a, b) => a.today - b.today);
  }

  if (sort === "high") {
    sortedProducts.sort((a, b) => b.today - a.today);
  }

  const categoryName = categoryProducts[0].categoryNameBn;
  const categoryIcon = categoryProducts[0].categoryIcon;

  return (
    <main className="min-h-screen bg-[#fffdf7] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
        >
          ← হোম পেজে ফিরে যান
        </Link>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-5xl">{categoryIcon}</div>

            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              {categoryName}
            </h1>

            <p className="mt-2 text-slate-500">
              আজকের {categoryName}-এর বাজারদর
            </p>
          </div>

          <SortSelect />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => {
            const isUp = product.change.dir === "up";
            const isDown = product.change.dir === "down";

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-5xl">{product.image}</div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
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

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {toBanglaNumber(product.today)} টাকা
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
                    {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
                    {toBanglaNumber(Math.abs(product.change.pct))}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}