import { prisma } from "@/lib/prisma";
import { HandCoins } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CreditsClient } from "./CreditsClient";
import { formatNumber } from "@/lib/format";

export default async function CreditsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Récupérer toutes les factures non soldées
  const commandesNonSoldees = await prisma.commande.findMany({
    where: {
      etablissement_id: session.etablissement_id!,
      statut_paiement: { in: ["NON_PAYE", "PARTIEL"] }
    },
    include: {
      client: true,
      stock_destination: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalCredits = commandesNonSoldees.reduce((acc, cmd) => acc + (cmd.montant_total - cmd.montant_paye), 0);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <HandCoins className="h-8 w-8 text-orange-600" />
            Gestion des Crédits
          </h1>
          <p className="mt-2 text-slate-500">
            Suivez l'argent que l'on vous doit (Clients, Boutiques).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total des Crédits Clients</p>
          <p className="text-3xl font-bold text-orange-600">{formatNumber(totalCredits)} F</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4">
          <h2 className="font-semibold text-slate-800">Factures en attente de paiement</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Facture</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Débiteur (Client / Boutique)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Déjà Payé</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reste à payer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {commandesNonSoldees.map((cmd) => {
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
              {commandesNonSoldees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Aucun crédit en cours. Tout est payé !
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
