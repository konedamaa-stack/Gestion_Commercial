import { prisma } from "@/lib/prisma";
import { Receipt, Search } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { VentesClient } from "./VentesClient";
import Link from "next/link";

export default async function VentesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Charger les données nécessaires pour le Point de Vente
  const produits = await prisma.produit.findMany({
    where: { etablissement_id: session.etablissement_id! },
    include: { categorie: true }
  });

  const stocks = await prisma.stock.findMany({
    where: { etablissement_id: session.etablissement_id! }
  });

  const clients = await prisma.client.findMany({
    where: { etablissement_id: session.etablissement_id! }
  });

  // Calculer l'inventaire global pour afficher le stock dispo
  const mouvements = await prisma.mouvementStock.findMany({
    where: { etablissement_id: session.etablissement_id! }
  });
  
  const inventaire: Record<string, Record<string, number>> = {};
  mouvements.forEach(m => {
    if (m.type === "ACHAT") {
      if (m.stock_destination_id) {
        if (!inventaire[m.stock_destination_id]) inventaire[m.stock_destination_id] = {};
        inventaire[m.stock_destination_id][m.produit_id] = (inventaire[m.stock_destination_id][m.produit_id] || 0) + m.quantite;
      }
    } else if (m.type === "VENTE") {
      if (m.stock_source_id) {
        if (!inventaire[m.stock_source_id]) inventaire[m.stock_source_id] = {};
        inventaire[m.stock_source_id][m.produit_id] = (inventaire[m.stock_source_id][m.produit_id] || 0) - m.quantite;
      }
    } else {
      // TRANSFERT_INTERNE ou autre
      if (m.stock_destination_id) {
        if (!inventaire[m.stock_destination_id]) inventaire[m.stock_destination_id] = {};
        inventaire[m.stock_destination_id][m.produit_id] = (inventaire[m.stock_destination_id][m.produit_id] || 0) + m.quantite;
      }
      if (m.stock_source_id) {
        if (!inventaire[m.stock_source_id]) inventaire[m.stock_source_id] = {};
        inventaire[m.stock_source_id][m.produit_id] = (inventaire[m.stock_source_id][m.produit_id] || 0) - m.quantite;
      }
    }
  });

  // Historique des ventes
  const commandes = await prisma.commande.findMany({
    where: { etablissement_id: session.etablissement_id! },
    include: {
      client: true,
      vendeur: true,
      lignes: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limiter aux 50 dernières pour la vue liste
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="h-8 w-8 text-blue-600" />
            Ventes & Facturation
          </h1>
          <p className="mt-2 text-slate-500">
            Créez des factures, gérez les transferts de stock et consultez l'historique.
          </p>
        </div>
        <VentesClient produits={produits} stocks={stocks} clients={clients} userRole={session.role} inventaire={inventaire} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Historique des ventes</h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher une facture..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Facture</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client / Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendeur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {commandes.map((cmd) => (
                <tr key={cmd.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-900">{cmd.numero_facture}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {cmd.type_vente === "TRANSFERT_INTERNE" ? "Transfert Boutique" : (cmd.client?.nom || "Client de passage")}
                    </div>
                    <div className="text-xs text-slate-500">{cmd.type_vente}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{cmd.montant_total} F</div>
                    <div className="text-xs text-slate-500">{cmd.lignes.length} article(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cmd.statut_paiement === "PAYE" && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Payé</span>}
                    {cmd.statut_paiement === "PARTIEL" && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Partiel</span>}
                    {cmd.statut_paiement === "NON_PAYE" && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Non Payé</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {cmd.vendeur.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(cmd.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {commandes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Aucune vente pour le moment. Cliquez sur "Nouvelle Vente" pour commencer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
