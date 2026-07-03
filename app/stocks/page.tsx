import { prisma } from "@/lib/prisma";
import { Warehouse } from "lucide-react";
import { StocksClient } from "./StocksClient";
import { StockRowClient } from "./StockRowClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

// Server component pour la page des stocks
export default async function StocksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "VENDEUR") redirect("/");

  // Récupérer uniquement les stocks internes (est_externe = false)
  const stocks = await prisma.stock.findMany({
    where: {
      etablissement_id: session.etablissement_id!,
      est_externe: false,
    },
    include: {
      stock_parent: true,
      _count: {
        select: { vendeurs: true }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Warehouse className="h-8 w-8 text-blue-600" />
            Gestion des Stocks
          </h1>
          <p className="mt-2 text-slate-500">
            Gérez vos entrepôts principaux et vos boutiques secondaires (Hub & Spoke).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/stocks/rapport" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors">
            Rapport d'Inventaire
          </Link>
          <StocksClient stocks={stocks} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nom du Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hiérarchie
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  Aucun stock interne trouvé.
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <StockRowClient key={stock.id} stock={stock} stocks={stocks} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
