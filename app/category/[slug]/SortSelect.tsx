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
    <div>
      <label className="mb-2 block text-sm font-medium">
        সাজান
      </label>

      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-600"
      >
        <option value="default">ডিফল্ট</option>
        <option value="low">দাম: কম থেকে বেশি</option>
        <option value="high">দাম: বেশি থেকে কম</option>
      </select>
    </div>
  );
}