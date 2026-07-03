import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { FacturePrintClient } from "./FacturePrintClient";
import { getSession } from "@/lib/session";

export default async function FacturePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const mouvement = await prisma.mouvementStock.findUnique({
    where: { id: params.id },
    include: {
      produit: true,
      stock_source: true,
      stock_destination: true,
      utilisateur: true,
    }
  });

  if (!mouvement) notFound();
  if (mouvement.type !== "VENTE") {
    // Les factures sont uniquement pour les ventes pour le moment
    return <div className="p-8 text-center text-slate-500">Seules les ventes peuvent générer une facture.</div>;
  }

  const clientName = mouvement.stock_destination.nom.replace('Client - ', '');
  const total = mouvement.quantite * mouvement.prix_unitaire_applique;

  return (
    <div className="min-h-screen bg-white">
      <FacturePrintClient />
      
      {/* Conteneur A4 pour l'impression */}
      <div className="max-w-4xl mx-auto p-8 lg:p-12 print:p-0">
        
        {/* Header Facture */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">FACTURE</h1>
            <p className="text-slate-500 font-medium">Référence : #{mouvement.id.split('-')[0].toUpperCase()}</p>
            <p className="text-slate-500 font-medium">Date : {new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-wider">GESTION PRO</h2>
            <p className="text-slate-500 mt-2 text-sm">123 Avenue du Commerce<br/>75000 Paris, France<br/>SIRET : 123 456 789 00012</p>
          </div>
        </div>

        {/* Info Client & Vendeur */}
        <div className="flex justify-between mb-12">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex-1 mr-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facturé à</p>
            <p className="text-lg font-bold text-slate-900">{clientName}</p>
            {mouvement.stock_destination.adresse && (
              <p className="text-slate-600 mt-1">{mouvement.stock_destination.adresse}</p>
            )}
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex-1 ml-4 text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Détails de la transaction</p>
            <p className="text-slate-900"><span className="font-semibold">Vendeur :</span> {mouvement.utilisateur.nom}</p>
            <p className="text-slate-900 mt-1"><span className="font-semibold">Boutique :</span> {mouvement.stock_source.nom}</p>
          </div>
        </div>

        {/* Tableau des articles */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-4 text-left font-bold text-slate-700">Désignation</th>
              <th className="py-4 text-center font-bold text-slate-700">Quantité</th>
              <th className="py-4 text-right font-bold text-slate-700">Prix unitaire</th>
              <th className="py-4 text-right font-bold text-slate-700">Total ligne</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-4">
                <p className="font-bold text-slate-900">{mouvement.produit.nom}</p>
                <p className="text-sm text-slate-500">Réf: {mouvement.produit.code_barre || "N/A"}</p>
              </td>
              <td className="py-4 text-center text-slate-700">{mouvement.quantite}</td>
              <td className="py-4 text-right text-slate-700">{mouvement.prix_unitaire_applique.toFixed(2)} F</td>
              <td className="py-4 text-right font-bold text-slate-900">{total.toFixed(2)} F</td>
            </tr>
          </tbody>
        </table>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-1/2 lg:w-1/3">
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="font-medium text-slate-500">Sous-total</span>
              <span className="font-medium text-slate-900">{total.toFixed(2)} F</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="font-medium text-slate-500">TVA (0%)</span>
              <span className="font-medium text-slate-900">0.00 F</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-xl font-black text-slate-900">TOTAL TTC</span>
              <span className="text-xl font-black text-blue-600">{total.toFixed(2)} F</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>Merci pour votre confiance !</p>
          <p className="mt-1">Gestion Pro - SAS au capital de 10 000 F - RCS Paris B 123 456 789</p>
        </div>

      </div>
    </div>
  );
}
