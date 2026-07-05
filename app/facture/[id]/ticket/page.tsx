import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatNumber } from "@/lib/format";
import ClientAutoPrint from "./ClientAutoPrint";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const commande = await prisma.commande.findUnique({
    where: { id: id },
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
    return <div>Facture introuvable</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen flex justify-center p-4 print:p-0 print:bg-white text-black font-sans">
      <ClientAutoPrint />
      
      {/* Format Ticket de Caisse (Typiquement 80mm) */}
      <div className="w-[80mm] bg-white p-4 shadow-xl print:shadow-none print:w-full print:p-0 text-xs">
        
        {/* En-tête */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg uppercase">{commande.etablissement.nom}</h1>
          {commande.etablissement.adresse && <p>{commande.etablissement.adresse}</p>}
          {commande.etablissement.telephone && <p>Tel: {commande.etablissement.telephone}</p>}
        </div>

        <div className="border-b border-black border-dashed pb-2 mb-2">
          <p>Ticket N°: {commande.numero_facture}</p>
          <p>Date: {new Date(commande.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p>Vendeur: {commande.vendeur.nom}</p>
          {commande.client && <p>Client: {commande.client.nom}</p>}
        </div>

        {/* Lignes */}
        <table className="w-full text-left mb-2">
          <thead>
            <tr className="border-b border-black">
              <th className="py-1">Qté</th>
              <th className="py-1">Designation</th>
              <th className="py-1 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {commande.lignes.map(ligne => (
              <tr key={ligne.id}>
                <td className="py-1 align-top">{ligne.quantite}x</td>
                <td className="py-1">{ligne.produit.nom} <br/> <span className="text-[10px] text-gray-500">@{formatNumber(ligne.prix_unitaire)}F</span></td>
                <td className="py-1 text-right align-top">{formatNumber(ligne.quantite * ligne.prix_unitaire)}F</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="border-t border-black border-dashed pt-2">
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span>
            <span>{formatNumber(commande.montant_total)} F</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Payé</span>
            <span>{formatNumber(commande.montant_paye)} F</span>
          </div>
          {commande.montant_total > commande.montant_paye && (
            <div className="flex justify-between mt-1 font-bold">
              <span>Reste à Payer</span>
              <span>{formatNumber(commande.montant_total - commande.montant_paye)} F</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[10px]">
          <p>Merci de votre visite !</p>
          <p className="mt-2 text-gray-500">GESTION PRO</p>
        </div>
      </div>
    </div>
  );
}
