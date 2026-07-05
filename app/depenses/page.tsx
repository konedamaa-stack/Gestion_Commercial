import { prisma } from "@/lib/prisma";
import { Wallet, Trash2 } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DepensesClient } from "./DepensesClient";
import { formatNumber } from "@/lib/format";

export default async function DepensesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const depenses = await prisma.depense.findMany({
    where: { 
      etablissement_id: session.etablissement_id!,
      ...(session.role === "VENDEUR" ? { enregistre_par_id: session.userId } : {})
    },
    include: { enregistre_par: true },
    orderBy: { date_depense: 'desc' }
  });

  const totalDepenses = depenses.reduce((acc, d) => acc + d.montant, 0);

  const employes = await prisma.utilisateur.findMany({
    where: { etablissement_id: session.etablissement_id! },
    select: { id: true, nom: true, role: true }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-red-600" />
            Dépenses
          </h1>
          <p className="mt-2 text-slate-500">
            Suivez et gérez toutes les sorties d'argent de votre établissement.
          </p>
        </div>
        <DepensesClient userRole={session.role} employes={employes} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase">Total des dépenses</p>
          <p className="text-3xl font-bold text-red-600">{formatNumber(totalDepenses)} F</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4">
          <h2 className="font-semibold text-slate-800">Historique des dépenses</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Motif</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bénéficiaire</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Enregistré par</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {depenses.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {new Date(dep.date_depense).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{dep.motif}</div>
                    {dep.description && <div className="text-xs text-slate-500 mt-1">{dep.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700 font-medium">{dep.beneficiaire || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-red-600">-{formatNumber(dep.montant)} F</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span>{dep.enregistre_par.nom}</span>
                    {/* Add delete button in client component if needed, for now it's server-rendered */}
                  </td>
                </tr>
              ))}
              {depenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Aucune dépense enregistrée.
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
