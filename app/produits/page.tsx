import { prisma } from "@/lib/prisma";
import { Package, Search } from "lucide-react";
import { ProduitsClient } from "./ProduitsClient";
import { ProduitRowClient } from "./ProduitRowClient";
import { ExportButton } from "@/components/ExportButton";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

// Server component (par défaut dans l'app router)
export default async function ProduitsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userRole = session.role;

  // Récupérer les produits depuis la base de données SQLite via Prisma
  const produits = await prisma.produit.findMany({
    where: { etablissement_id: session.etablissement_id! },
    include: {
      categorie: true,
      mouvements: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const categories = await prisma.categorie.findMany({
    where: { etablissement_id: session.etablissement_id! }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Catalogue Produits
          </h1>
          <p className="mt-2 text-slate-500">
            Gérez votre inventaire, les catégories et les prix de base.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {userRole === "PATRON" && (
            <ExportButton 
              data={produits} 
              filename="Catalogue_Produits" 
              columns={[
                { header: "Nom du Produit", key: "nom" },
                { header: "Code Barre", key: "code_barre" },
                { header: "Catégorie", key: "categorie.nom" },
                { header: "Prix Achat Gros", key: "prix_achat_gros" },
                { header: "Prix Vente Gros", key: "prix_vente_gros" },
                { header: "Seuil Alerte Stock", key: "seuil_alerte_stock" }
              ]} 
            />
          )}
          <ProduitsClient categories={categories} userRole={userRole} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un produit, un code barre..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit & Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix Achat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix Vente</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {produits.map((produit) => (
                <ProduitRowClient key={produit.id} produit={produit} categories={categories} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
