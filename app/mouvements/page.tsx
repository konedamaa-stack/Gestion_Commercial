import { prisma } from "@/lib/prisma";
import { ArrowRightLeft } from "lucide-react";
import { MouvementsClient } from "./MouvementsClient";
import { MouvementRowClient } from "./MouvementRowClient";
import { MouvementsFilter } from "./MouvementsFilter";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MouvementsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string; type?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const userRole = session.role;

  const resolvedParams = await searchParams;

  const whereClause: any = { 
    etablissement_id: session.etablissement_id!,
    ...(userRole === "VENDEUR" ? { utilisateur_id: session.userId } : {})
  };

  if (resolvedParams.type) {
    whereClause.type = resolvedParams.type;
  }

  if (resolvedParams.debut) {
    const debutDate = new Date(resolvedParams.debut);
    debutDate.setHours(0, 0, 0, 0);
    whereClause.date_mouvement = {
      ...(whereClause.date_mouvement || {}),
      gte: debutDate,
    };
  }

  if (resolvedParams.fin) {
    const finDate = new Date(resolvedParams.fin);
    finDate.setHours(23, 59, 59, 999);
    whereClause.date_mouvement = {
      ...(whereClause.date_mouvement || {}),
      lte: finDate,
    };
  }

  const mouvements = await prisma.mouvementStock.findMany({
    where: whereClause,
    include: {
      produit: true,
      stock_source: true,
      stock_destination: true,
      utilisateur: true,
    },
    orderBy: { date_mouvement: 'desc' }
  });

  const produits = await prisma.produit.findMany({ where: { etablissement_id: session.etablissement_id! } });
  const stocks = await prisma.stock.findMany({ where: { etablissement_id: session.etablissement_id! } });
  const utilisateurs = await prisma.utilisateur.findMany({ where: { etablissement_id: session.etablissement_id! } });

  return (
    <div className="p-4 md:p-8">
      <MouvementsClient produits={produits} stocks={stocks} utilisateurs={utilisateurs} />
      
      <MouvementsFilter />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trajet (Source → Dest)</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {mouvements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Aucun mouvement enregistré.</td>
              </tr>
            ) : (
              mouvements.map((mvt) => (
                <MouvementRowClient key={mvt.id} mvt={mvt} userRole={userRole} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
