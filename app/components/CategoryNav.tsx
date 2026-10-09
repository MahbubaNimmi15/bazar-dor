"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const categories = [
  { href: "/", label: "সব পণ্য" },
  { href: "/category/chal", label: "🍚 চাল" },
  { href: "/category/dal", label: "🫘 ডাল" },
  { href: "/category/tel", label: "🫙 তেল" },
  { href: "/category/sobji", label: "🥬 সবজি" },
  { href: "/category/mach", label: "🐟 মাছ" },
  { href: "/category/mangsho", label: "🍗 মাংস" },
  { href: "/category/dim-dui", label: "🥛 ডিম-দুধ" },
  { href: "/category/mosla", label: "🌶️ মসলা" },
];

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="border-t border-slate-100 bg-white">
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 text-sm font-medium">
        {categories.map((category) => {
          const active =
            category.href === "/"
              ? pathname === "/"
              : pathname === category.href;

          return (
            <Link
              key={category.href}
              href={category.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 transition ${
                active
                  ? "bg-green-600 text-white"
                  : "text-slate-700 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}