import { prisma } from "@/lib/prisma";
import { Truck } from "lucide-react";
import { FournisseursClient } from "./FournisseursClient";
import { FournisseurRowClient } from "./FournisseurRowClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function FournisseursPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "VENDEUR") redirect("/");

  const fournisseurs = await prisma.fournisseur.findMany({
    where: { 
      etablissement_id: session.etablissement_id!
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            Fournisseurs
          </h1>
          <p className="mt-2 text-slate-500">
            Gérez votre base de données fournisseurs.
          </p>
        </div>
        <FournisseursClient />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fournisseur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date d'ajout
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {fournisseurs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  Aucun fournisseur trouvé.
                </td>
              </tr>
            ) : (
              fournisseurs.map((fournisseur) => (
                <FournisseurRowClient key={fournisseur.id} fournisseur={fournisseur} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
