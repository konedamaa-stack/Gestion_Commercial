"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";

export function MouvementsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [debut, setDebut] = useState(searchParams.get("debut") || "");
  const [fin, setFin] = useState(searchParams.get("fin") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (debut) params.set("debut", debut);
    if (fin) params.set("fin", fin);
    if (type) params.set("type", type);
    
    router.push(`/mouvements?${params.toString()}`);
  };

  const handleReset = () => {
    setDebut("");
    setFin("");
    setType("");
    router.push("/mouvements");
  };

  return (
    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-1 w-full sm:w-auto text-slate-700 font-medium">
        <Filter className="w-4 h-4 text-slate-500" />
        <span>Filtres :</span>
      </div>

      <div>
        <label htmlFor="type" className="block text-xs font-medium text-slate-500 mb-1">Type d'opération</label>
        <select 
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">Tous les types</option>
          <option value="VENTE">Ventes uniquement</option>
          <option value="ACHAT">Achats uniquement</option>
          <option value="TRANSFERT">Transferts uniquement</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="debut" className="block text-xs font-medium text-slate-500 mb-1">Date de début</label>
        <input 
          type="date" 
          id="debut"
          value={debut}
          onChange={(e) => setDebut(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="fin" className="block text-xs font-medium text-slate-500 mb-1">Date de fin</label>
        <input 
          type="date" 
          id="fin"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button 
          type="submit" 
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Appliquer
        </button>
        {(debut || fin) && (
          <button 
            type="button" 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </form>
  );
}
