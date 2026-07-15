import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/format";

export default async function StockInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SUPER_ADMIN") redirect("/super-admin");

  const resolvedParams = await params;

  const stock = await prisma.stock.findFirst({
    where: { id: resolvedParams.id, etablissement_id: session.etablissement_id! }
  });

  if (!stock) {
    redirect("/stocks");
  }

  // Récupérer tous les mouvements liés à ce stock (entrées ou sorties)
  const mouvements = await prisma.mouvementStock.findMany({
    where: {
      OR: [
        { stock_source_id: stock.id },
        { stock_destination_id: stock.id }
      ]
    },
    include: {
      produit: {
        include: { categorie: true }
      }
    }
  });

  // Calculer l'inventaire par produit
  const inventoryMap = new Map<string, { produit: any; quantite: number; valeur: number }>();

  for (const mvt of mouvements) {
    const pId = mvt.produit_id;
    if (!inventoryMap.has(pId)) {
      inventoryMap.set(pId, { produit: mvt.produit, quantite: 0, valeur: 0 });
    }
    const inv = inventoryMap.get(pId)!;

    if (mvt.type === "ACHAT") {
      if (mvt.stock_destination_id === stock.id) {
        inv.quantite += mvt.quantite;
      }
    } else if (mvt.type === "VENTE") {
      if (mvt.stock_source_id === stock.id) {
        inv.quantite -= mvt.quantite;
      }
    } else {
      if (mvt.stock_destination_id === stock.id) {
        inv.quantite += mvt.quantite;
      }
      if (mvt.stock_source_id === stock.id) {
        inv.quantite -= mvt.quantite;
      }
    }
    
    // Calcul de la valeur basé sur le prix d'achat gros estimé
    inv.valeur = inv.quantite * inv.produit.prix_achat_gros;
  }

  // Convertir en tableau et filtrer ceux qui ont > 0 (ou afficher tout pour voir les ruptures)
  const inventory = Array.from(inventoryMap.values()).sort((a, b) => b.quantite - a.quantite);

  const totalArticles = inventory.reduce((acc, item) => acc + item.quantite, 0);
  const totalValeur = inventory.reduce((acc, item) => acc + item.valeur, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/stocks" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Retour aux magasins
        </Link>
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-indigo-600" />
            Inventaire : {stock.nom}
          </h1>
          <p className="mt-2 text-slate-500">
            Détail des quantités actuellement disponibles dans ce lieu.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[150px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Articles en magasin</p>
            <p className="text-2xl font-black text-indigo-600">{totalArticles}</p>
          </div>
          {session.role === "PATRON" && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[150px]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valeur Est. (Achat)</p>
              <p className="text-2xl font-black text-slate-900">{formatNumber(totalValeur)} F</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantité en Magasin</th>
                {session.role === "PATRON" && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valeur</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={session.role === "PATRON" ? 4 : 3} className="px-6 py-12 text-center text-slate-500">
                    Ce magasin est totalement vide.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.produit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {item.produit.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.produit.categorie.nom}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${item.quantite <= 0 ? 'text-red-600' : item.quantite < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                        {item.quantite}
                      </span>
                    </td>
                    {session.role === "PATRON" && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-600">
                        {formatNumber(item.valeur)} F
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
