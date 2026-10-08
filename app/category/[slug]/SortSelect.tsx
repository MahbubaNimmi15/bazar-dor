"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "default";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const query = params.toString();

    router.push(query ? `?${query}` : "?");
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort"
        className="text-sm font-medium text-slate-700"
      >
        দাম অনুযায়ী:
      </label>

      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-green-600"
      >
        <option value="default">ডিফল্ট</option>
        <option value="low">Ascending — কম থেকে বেশি</option>
        <option value="high">Descending — বেশি থেকে কম</option>
      </select>
    </div>
  );
}