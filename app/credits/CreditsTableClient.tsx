"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { CreditsClient } from "./CreditsClient";

interface CreditsTableClientProps {
  commandesNonSoldees: any[];
}

export function CreditsTableClient({ commandesNonSoldees }: CreditsTableClientProps) {
  const [search, setSearch] = useState("");

  const filteredCommandes = commandesNonSoldees.filter(cmd => {
    const invoiceNum = cmd.numero_facture.toLowerCase();
    const nomDebiteur = (cmd.type_vente === "TRANSFERT_INTERNE" 
      ? `Boutique: ${cmd.stock_destination?.nom}`
      : (cmd.client?.nom || "Client de passage")).toLowerCase();
    const query = search.toLowerCase();
    
    return invoiceNum.includes(query) || nomDebiteur.includes(query);
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Search Input Zone */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher par facture, client, boutique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Facture</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Débiteur (Client / Boutique)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Déjà Payé</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reste à payer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredCommandes.map((cmd) => {
              const reste = cmd.montant_total - cmd.montant_paye;
              const nomDebiteur = cmd.type_vente === "TRANSFERT_INTERNE" 
                ? `Boutique: ${cmd.stock_destination?.nom}`
                : (cmd.client?.nom || "Client de passage");

              return (
                <tr key={cmd.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {cmd.numero_facture}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {nomDebiteur}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                    {formatNumber(cmd.montant_total)} F
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                    {formatNumber(cmd.montant_paye)} F
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-orange-600">
                    {formatNumber(reste)} F
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <CreditsClient commandeId={cmd.id} resteAPayer={reste} />
                  </td>
                </tr>
              );
            })}
            {filteredCommandes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Aucun crédit en cours.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
