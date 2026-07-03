"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function RapportFilter({ stocks }: { stocks: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [debut, setDebut] = useState(searchParams.get("debut") || "");
  const [fin, setFin] = useState(searchParams.get("fin") || "");
  const [stockId, setStockId] = useState(searchParams.get("stock_id") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (debut) params.set("debut", debut);
    if (fin) params.set("fin", fin);
    if (stockId) params.set("stock_id", stockId);
    
    router.push(`/stocks/rapport?${params.toString()}`);
  };

  return (
    <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end mb-6">
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-500 mb-1">Date de début</label>
        <input 
          type="date" 
          value={debut}
          onChange={e => setDebut(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-500 mb-1">Date de fin</label>
        <input 
          type="date" 
          value={fin}
          onChange={e => setFin(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-500 mb-1">Boutique / Entrepôt</label>
        <select
          value={stockId}
          onChange={e => setStockId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        >
          <option value="">Tous les stocks (Global)</option>
          {stocks.map(s => (
            <option key={s.id} value={s.id}>{s.nom}</option>
          ))}
        </select>
      </div>
      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 h-[38px]"
      >
        <Search className="h-4 w-4" />
        Filtrer
      </button>
    </form>
  );
}
