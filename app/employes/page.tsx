import { prisma } from "@/lib/prisma";
import { Contact } from "lucide-react";
import { EmployesClient } from "./EmployesClient";
import { EmployeRowClient } from "./EmployeRowClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function EmployesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "VENDEUR") redirect("/");

  const employes = await prisma.utilisateur.findMany({
    where: { 
      etablissement_id: session.etablissement_id!,
      role: { not: "SUPER_ADMIN" }
    },
    include: {
      stock: true,
    },
    orderBy: { createdAt: 'asc' }
  });

  const stocksInternes = await prisma.stock.findMany({
    where: { 
      etablissement_id: session.etablissement_id!,
      est_externe: false 
    }
  });

  return (
    <div className="p-8">
      <EmployesClient stocks={stocksInternes} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignation</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {employes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Aucun employé trouvé.</td>
              </tr>
            ) : (
              employes.map((employe) => (
                <EmployeRowClient key={employe.id} employe={employe} stocks={stocksInternes} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
