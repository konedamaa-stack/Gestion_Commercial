"use client";

import { useState, useEffect } from "react";
import { getInventaire, RapportInventaire } from "./actions";
import { Calendar, TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function InventaireClient() {
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [rapport, setRapport] = useState<RapportInventaire | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInventaire();
  }, []);

  const loadInventaire = async () => {
    setIsLoading(true);
    try {
      const data = await getInventaire(startDate, endDate);
      setRapport(data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors du chargement de l'inventaire.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventaire();
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " F";
  };

  return (
    <div className="space-y-6">
      {/* Filtres de date */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            Filtrer
          </button>
        </form>
      </div>

      {isLoading || !rapport ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* KPIs Financiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm">Valeur Stock (Achat)</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(rapport.valeurTotaleAchat)}</p>
              <p className="text-xs text-slate-500 mt-1">Capital immobilisé</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm">Valeur Stock (Vente)</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(rapport.valeurTotaleVente)}</p>
              <p className="text-xs text-slate-500 mt-1">Chiffre d'affaires potentiel</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm">Entrées sur la période</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(rapport.totalEntrees)}</p>
              <p className="text-xs text-slate-500 mt-1">Valeur approvisionnée</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm">Sorties sur la période</h3>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatMoney(rapport.totalSorties)}</p>
              <p className="text-xs text-slate-500 mt-1">Valeur vendue/sortie</p>
            </div>
          </div>

          {/* Tableau Détaillé */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Détail par produit</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Produit</th>
                    <th className="px-6 py-4 text-center">Stock Initial</th>
                    <th className="px-6 py-4 text-center text-green-600">+ Entrées</th>
                    <th className="px-6 py-4 text-center text-orange-600">- Sorties</th>
                    <th className="px-6 py-4 text-center font-bold">Stock Final</th>
                    <th className="px-6 py-4 text-right">Valeur Actuelle (Vente)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rapport.lignes.map((ligne) => (
                    <tr key={ligne.produit_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{ligne.nom}</div>
                        {ligne.code_barre && <div className="text-xs text-slate-400">{ligne.code_barre}</div>}
                      </td>
                      <td className="px-6 py-4 text-center">{ligne.stockInitial}</td>
                      <td className="px-6 py-4 text-center text-green-600 bg-green-50/30">+{ligne.entrees}</td>
                      <td className="px-6 py-4 text-center text-orange-600 bg-orange-50/30">-{ligne.sorties}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">{ligne.stockFinal}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {formatMoney(ligne.valeurVente)}
                      </td>
                    </tr>
                  ))}
                  {rapport.lignes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Aucun produit trouvé dans votre catalogue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
