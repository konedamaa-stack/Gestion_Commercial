import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { ClientsClient } from "./ClientsClient";
import { ClientRowClient } from "./ClientRowClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userRole = session.role;

  const clients = await prisma.stock.findMany({
    where: { 
      etablissement_id: session.etablissement_id!,
      est_externe: true,
      nom: { startsWith: "Client" }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Clients
          </h1>
          <p className="mt-2 text-slate-500">
            Gérez votre base de données clients.
          </p>
        </div>
        <ClientsClient />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date d'ajout</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">Aucun client trouvé.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <ClientRowClient key={client.id} client={client} userRole={userRole} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
