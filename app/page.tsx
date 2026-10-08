import Image from "next/image";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";

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

function ProductCard({ product }: { product: Product }) {
  const isUp = product.change.dir === "up";
  const isDown = product.change.dir === "down";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="text-5xl">{product.image}</div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {product.nameBn}
      </h3>

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
}

export default async function Home() {
  const products = await getProducts();

  const risers = [...products]
    .filter((product) => product.change.dir === "up")
    .sort((a, b) => b.change.pct - a.change.pct)
    .slice(0, 6);

  const fallers = [...products]
    .filter((product) => product.change.dir === "down")
    .sort(
      (a, b) =>
        Math.abs(b.change.pct) - Math.abs(a.change.pct)
    )
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fffdf7] text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            {/* Full Green Logo with Clear Cart */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 shadow-sm">
              <span
                className="text-3xl leading-none"
                role="img"
                aria-label="Shopping Cart"
              >
                🛒
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold text-green-700">
                বাজার দর
              </h1>

              <p className="text-xs text-slate-500">
                আজকের বাজার, এক নজরে
              </p>
            </div>
          </Link>

          {/* Login / Profile / Logout */}
          <AuthButtons />
        </div>

        {/* Category Links */}
        <div className="border-t border-slate-100">
          <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-3 text-sm font-medium">
            <Link
              href="/"
              className="whitespace-nowrap text-green-700"
            >
              সব পণ্য
            </Link>

            <Link
              href="/category/chal"
              className="whitespace-nowrap"
            >
              🍚 চাল
            </Link>

            <Link
              href="/category/dal"
              className="whitespace-nowrap"
            >
              🫘 ডাল
            </Link>

            <Link
              href="/category/tel"
              className="whitespace-nowrap"
            >
              🫙 তেল
            </Link>

            <Link
              href="/category/sobji"
              className="whitespace-nowrap"
            >
              🥬 সবজি
            </Link>

            <Link
              href="/category/mach"
              className="whitespace-nowrap"
            >
              🐟 মাছ
            </Link>

            <Link
              href="/category/mangsho"
              className="whitespace-nowrap"
            >
              🍗 মাংস
            </Link>

            <Link
              href="/category/dim-dui"
              className="whitespace-nowrap"
            >
              🥛 ডিম-দুধ
            </Link>

            <Link
              href="/category/mosla"
              className="whitespace-nowrap"
            >
              🌶️ মসলা
            </Link>
          </nav>
        </div>

        {/* Animated Price Ticker */}
        <div className="overflow-hidden border-y border-slate-200 bg-white py-2 text-sm text-black">
          <div className="animate-marquee whitespace-nowrap">
            {products.slice(0, 10).map((product) => (
              <span
                key={product.id}
                className="mr-10 font-medium text-black"
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

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-3 font-semibold text-green-700">
            প্রতিদিনের বাজারদর জানুন সহজে
          </p>

          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            আজকের বাজার দর
            <br />
            এখন আপনার হাতের মুঠোয়
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            চাল, ডাল, তেল, সবজি, মাছ, মাংসসহ প্রয়োজনীয়
            পণ্যের আজকের বাজারমূল্য দেখুন এক জায়গায়।
          </p>

          <a
            href="#সব-পণ্য"
            className="mt-7 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            সব পণ্য দেখুন
          </a>
        </div>

        <div className="flex justify-center">
          <Image
            src="/bazar-hero.png"
            alt="Bazar Hero"
            width={430}
            height={430}
            priority
            className="h-auto w-full max-w-sm md:max-w-md"
          />
        </div>
      </section>

      {/* Risers */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-7">
          <h2 className="text-2xl font-bold md:text-3xl">
            আজ দাম বেড়েছে ▲
          </h2>

          <p className="mt-2 text-slate-500">
            আজ যেসব পণ্যের দাম সবচেয়ে বেশি বৃদ্ধি পেয়েছে
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {risers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Fallers */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-7">
          <h2 className="text-2xl font-bold md:text-3xl">
            আজ দাম কমেছে ▼
          </h2>

          <p className="mt-2 text-slate-500">
            আজ যেসব পণ্যের দাম সবচেয়ে বেশি কমেছে
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fallers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section
        id="সব-পণ্য"
        className="mx-auto max-w-6xl scroll-mt-40 px-4 py-12"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">
            সব পণ্য
          </h2>

          <p className="mt-2 text-slate-500">
            প্রয়োজনীয় সকল পণ্যের আজকের বাজারদর
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-8 text-sm text-slate-500 md:flex-row">
          <p>
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>

          <p>
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে
            পরিবর্তিত হয়।
          </p>
        </div>
      </footer>
    </main>
  );
}