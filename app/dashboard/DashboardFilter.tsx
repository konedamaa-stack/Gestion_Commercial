"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
      <Calendar className="w-4 h-4 text-slate-500" />
      <select
        value={currentPeriod}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
      >
        <option value="today">Aujourd'hui</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois-ci</option>
        <option value="year">Cette année</option>
        <option value="all">Global (Tout)</option>
      </select>
    </div>
  );
}
