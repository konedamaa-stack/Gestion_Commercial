import { prisma } from "@/lib/prisma";
import { Building2, Users, CreditCard } from "lucide-react";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const [totalEtablissements, totalUsers] = await Promise.all([
    prisma.etablissement.count(),
    prisma.utilisateur.count({
      where: { role: { not: "SUPER_ADMIN" } }
    })
  ]);

  const etablissements = await prisma.etablissement.findMany({
    include: {
      _count: {
        select: { utilisateurs: true, produits: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tableau de bord Global</h1>
        <p className="text-slate-500">Gérez votre plateforme SaaS Multi-Tenant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Établissements actifs</p>
            <p className="text-2xl font-bold text-slate-900">{totalEtablissements}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Utilisateurs totaux</p>
            <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Revenu mensuel estimé</p>
            <p className="text-2xl font-bold text-slate-900">{totalEtablissements * 25000} F</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Établissements Récents</h2>
          <Link href="/super-admin/etablissements" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {etablissements.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <p className="text-slate-500 mb-4">Aucun établissement créé pour le moment.</p>
              <Link href="/super-admin/etablissements" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Créer mon premier établissement
              </Link>
            </div>
          ) : (
            etablissements.map(etab => (
              <div key={etab.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 text-lg">{etab.nom}</h3>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {etab.plan_actuel}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Users className="w-4 h-4" /> Employés</span>
                    <span className="font-semibold text-slate-700">{etab._count.utilisateurs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Produits</span>
                    <span className="font-semibold text-slate-700">{etab._count.produits}</span>
                  </div>
                </div>

                <Link href={`/super-admin/etablissements/${etab.id}`} className="block w-full py-2 text-center text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                  Gérer
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
