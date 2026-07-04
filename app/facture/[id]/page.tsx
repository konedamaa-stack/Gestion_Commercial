import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientPrintButton from "./ClientPrintButton";

export default async function FacturePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      vendeur: true,
      etablissement: true,
      lignes: {
        include: { produit: true }
      }
    }
  });

  if (!commande || commande.etablissement_id !== session.etablissement_id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800">Facture introuvable</h1>
        <Link href="/ventes" className="text-blue-600 hover:underline mt-4">Retour aux ventes</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:p-0 print:bg-white font-sans">
      
      {/* Barre d'outils non imprimable */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/ventes" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Retour aux ventes
        </Link>
        <ClientPrintButton />
      </div>

      {/* Conteneur Facture format A4 */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none p-10 md:p-16 print:p-8 rounded-sm text-slate-800">
        
        {/* En-tête */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight uppercase text-slate-900">FACTURE</h1>
            <p className="text-slate-500 mt-2 font-medium">Facture N° <span className="text-slate-800">{commande.numero_facture}</span></p>
            <p className="text-slate-500 text-sm">Date : {new Date(commande.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900">{commande.etablissement.nom}</h2>
          </div>
        </div>

        {/* Informations Client & Vendeur */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Facturé à</h3>
            <div className="text-slate-800">
              <p className="font-bold text-lg">{commande.client?.nom || "Client de passage"}</p>
              {commande.client?.telephone && <p className="text-sm mt-1">{commande.client.telephone}</p>}
              {commande.client?.adresse && <p className="text-sm mt-1">{commande.client.adresse}</p>}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Vendeur</h3>
            <p className="font-medium text-slate-800">{commande.vendeur.nom}</p>
          </div>
        </div>

        {/* Tableau des articles */}
        <div className="mb-10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-800">
                <th className="py-3 text-slate-800 font-semibold">Description</th>
                <th className="py-3 text-center text-slate-800 font-semibold w-24">Quantité</th>
                <th className="py-3 text-right text-slate-800 font-semibold w-32">Prix Unitaire</th>
                <th className="py-3 text-right text-slate-800 font-semibold w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {commande.lignes.map((ligne) => (
                <tr key={ligne.id} className="border-b border-slate-200">
                  <td className="py-4 text-slate-700">{ligne.produit.nom}</td>
                  <td className="py-4 text-center text-slate-700">{ligne.quantite}</td>
                  <td className="py-4 text-right text-slate-700">{ligne.prix_unitaire} F</td>
                  <td className="py-4 text-right font-medium text-slate-800">{ligne.quantite * ligne.prix_unitaire} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totalisation */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Sous-total</span>
              <span className="text-slate-800 font-medium">{commande.montant_total} F</span>
            </div>
            
            <div className="flex justify-between py-3 border-b-2 border-slate-800 mt-2">
              <span className="text-slate-900 font-bold text-lg">Total</span>
              <span className="text-slate-900 font-bold text-lg">{commande.montant_total} F</span>
            </div>

            <div className="flex justify-between py-2 mt-2">
              <span className="text-slate-600 text-sm">Montant Payé</span>
              <span className="text-slate-800 text-sm font-medium">{commande.montant_paye} F</span>
            </div>
            
            {commande.montant_total - commande.montant_paye > 0 && (
              <div className="flex justify-between py-2 bg-red-50 px-2 rounded-sm mt-1 print:border print:border-red-500">
                <span className="text-red-700 font-medium">Reste à Payer</span>
                <span className="text-red-700 font-bold">{commande.montant_total - commande.montant_paye} F</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-400 text-sm border-t border-slate-200 pt-8">
          <p>Merci pour votre achat !</p>
          <p className="mt-1 text-xs">Propulsé par GESTION PRO</p>
        </div>

      </div>
    </div>
  );
}
