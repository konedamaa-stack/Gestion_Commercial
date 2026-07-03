import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import EtablissementActionsClient from "./EtablissementActionsClient";

export default async function EtablissementsPage() {
  const etablissements = await prisma.etablissement.findMany({
    include: {
      _count: {
        select: { utilisateurs: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Établissements</h1>
          <p className="text-slate-500">Gérez les boutiques clientes de votre SaaS</p>
        </div>
        
        {/* Note: Dans un vrai projet, ceci ouvrirait un Modal avec un Server Action */}
        <Link href="/super-admin/etablissements/nouveau" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
          <Plus className="h-5 w-5" />
          Nouvel établissement
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom de la boutique</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employés</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date création</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {etablissements.length === 0 ? (
               <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Aucun établissement</td>
              </tr>
            ) : (
              etablissements.map(etab => (
                <tr key={etab.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{etab.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {etab.actif ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        Actif
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {etab.expiration ? (
                      <span className={etab.expiration < new Date() ? "text-red-600 font-semibold" : "text-slate-600"}>
                        {new Date(etab.expiration).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non défini</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">{etab._count.utilisateurs} compte(s)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                    {new Date(etab.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <EtablissementActionsClient id={etab.id} actif={etab.actif} expiration={etab.expiration} plan_actuel={etab.plan_actuel} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
