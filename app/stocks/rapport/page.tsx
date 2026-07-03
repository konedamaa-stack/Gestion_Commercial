import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { RapportFilter } from "./RapportFilter";

export default async function RapportInventairePage({
  searchParams,
}: {
  searchParams: { debut?: string; fin?: string; stock_id?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "VENDEUR") redirect("/");

  const { debut, fin, stock_id } = searchParams;

  // Récupérer les stocks internes
  const stocks = await prisma.stock.findMany({
    where: {
      etablissement_id: session.etablissement_id!,
      est_externe: false,
    },
    orderBy: { createdAt: "asc" },
  });

  const debutDate = debut ? new Date(debut) : undefined;
  if (debutDate) debutDate.setHours(0, 0, 0, 0);

  const finDate = fin ? new Date(fin) : undefined;
  if (finDate) finDate.setHours(23, 59, 59, 999);

  // Construire la clause Where pour les mouvements de la période
  const wherePeriode: any = {
    etablissement_id: session.etablissement_id!,
  };
  if (debutDate || finDate) {
    wherePeriode.date_mouvement = {};
    if (debutDate) wherePeriode.date_mouvement.gte = debutDate;
    if (finDate) wherePeriode.date_mouvement.lte = finDate;
  }
  if (stock_id) {
    wherePeriode.OR = [
      { stock_source_id: stock_id },
      { stock_destination_id: stock_id },
    ];
  }

  // Récupérer tous les produits pour avoir leur nom et catégorie
  const produits = await prisma.produit.findMany({
    where: { etablissement_id: session.etablissement_id! },
    include: { categorie: true },
  });

  // Calcul du stock initial (avant la date de début)
  const initialMap = new Map<string, number>();
  if (debutDate) {
    const whereInitial: any = {
      etablissement_id: session.etablissement_id!,
      date_mouvement: { lt: debutDate },
    };
    if (stock_id) {
      whereInitial.OR = [
        { stock_source_id: stock_id },
        { stock_destination_id: stock_id },
      ];
    }
    const mouvementsInitiaux = await prisma.mouvementStock.findMany({
      where: whereInitial,
    });
    for (const mvt of mouvementsInitiaux) {
      let qte = initialMap.get(mvt.produit_id) || 0;
      if (mvt.type === "ACHAT") {
        if (!stock_id || mvt.stock_destination_id === stock_id) qte += mvt.quantite;
      } else if (mvt.type === "VENTE") {
        if (!stock_id || mvt.stock_source_id === stock_id) qte -= mvt.quantite;
      } else {
        if (!stock_id || mvt.stock_destination_id === stock_id) qte += mvt.quantite;
        if (!stock_id || mvt.stock_source_id === stock_id) qte -= mvt.quantite;
      }
      initialMap.set(mvt.produit_id, qte);
    }
  } else {
    // S'il n'y a pas de date de début, le stock initial est 0
    produits.forEach((p) => initialMap.set(p.id, 0));
  }

  // Calcul des entrées / sorties sur la période
  const periodMap = new Map<string, { entrees: number; sorties: number }>();
  produits.forEach((p) => periodMap.set(p.id, { entrees: 0, sorties: 0 }));

  const mouvementsPeriode = await prisma.mouvementStock.findMany({
    where: wherePeriode,
  });

  for (const mvt of mouvementsPeriode) {
    const stat = periodMap.get(mvt.produit_id) || { entrees: 0, sorties: 0 };
    if (mvt.type === "ACHAT") {
      if (!stock_id || mvt.stock_destination_id === stock_id) stat.entrees += mvt.quantite;
    } else if (mvt.type === "VENTE") {
      if (!stock_id || mvt.stock_source_id === stock_id) stat.sorties += mvt.quantite;
    } else {
      if (!stock_id || mvt.stock_destination_id === stock_id) stat.entrees += mvt.quantite;
      if (!stock_id || mvt.stock_source_id === stock_id) stat.sorties += mvt.quantite;
    }
    periodMap.set(mvt.produit_id, stat);
  }

  // Compiler les résultats
  const rapport = produits.map((p) => {
    const stockInitial = initialMap.get(p.id) || 0;
    const { entrees, sorties } = periodMap.get(p.id) || { entrees: 0, sorties: 0 };
    const stockFinal = stockInitial + entrees - sorties;
    const valeur = stockFinal * p.prix_achat_gros;
    return {
      produit: p,
      stockInitial,
      entrees,
      sorties,
      stockFinal,
      valeur,
    };
  }).sort((a, b) => a.produit.nom.localeCompare(b.produit.nom));

  const totalValeurStock = rapport.reduce((acc, curr) => acc + curr.valeur, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/stocks"
          className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux stocks
        </Link>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <ClipboardList className="h-8 w-8 text-indigo-600" />
            Rapport d'Inventaire
          </h1>
          <p className="text-slate-500">
            Consultez l'évolution de vos stocks sur une période donnée (Global ou par Boutique).
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valeur Totale Est. (Achat)</p>
          <p className="text-3xl font-black text-slate-900">{formatNumber(totalValeurStock)} F</p>
        </div>
      </div>

      <RapportFilter stocks={stocks} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stock Initial
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Entrées (+)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sorties (-)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stock Final
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Valeur (Achat)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rapport.map((item) => (
                <tr key={item.produit.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {item.produit.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.produit.categorie.nom}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-600">
                    {formatNumber(item.stockInitial)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">
                    {formatNumber(item.entrees)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-orange-600">
                    {formatNumber(item.sorties)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-slate-900">
                    {formatNumber(item.stockFinal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-600">
                    {formatNumber(item.valeur)} F
                  </td>
                </tr>
              ))}
              {rapport.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Aucun produit trouvé.
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
