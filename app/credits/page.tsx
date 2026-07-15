import { prisma } from "@/lib/prisma";
import { HandCoins } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CreditsTableClient } from "./CreditsTableClient";
import { formatNumber } from "@/lib/format";

export default async function CreditsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SUPER_ADMIN") redirect("/super-admin");

  // Récupérer toutes les factures non soldées
  const commandesNonSoldees = await prisma.commande.findMany({
    where: {
      etablissement_id: session.etablissement_id!,
      statut_paiement: { in: ["NON_PAYE", "PARTIEL"] },
      ...(session.role === "VENDEUR" ? { vendeur_id: session.userId } : {})
    },
    include: {
      client: true,
      stock_destination: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalCredits = commandesNonSoldees.reduce((acc, cmd) => acc + (cmd.montant_total - cmd.montant_paye), 0);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4">
          <h2 className="font-semibold text-slate-800">Factures en attente de paiement</h2>
        </div>
        <CreditsTableClient commandesNonSoldees={commandesNonSoldees} />
      </div>
    </div>
  );
}
