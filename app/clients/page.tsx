import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { ClientsClient } from "./ClientsClient";
import { ClientsTableClient } from "./ClientsTableClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SUPER_ADMIN") redirect("/super-admin");
  const userRole = session.role;

  const clients = await prisma.client.findMany({
    where: { 
      etablissement_id: session.etablissement_id!
    },
    include: {
      commandes: {
        include: {
          lignes: {
            include: {
              produit: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
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

      <ClientsTableClient initialClients={clients} userRole={userRole} />
    </div>
  );
}
