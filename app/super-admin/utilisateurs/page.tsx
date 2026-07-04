import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UtilisateursClient } from "./UtilisateursClient";

export default async function UtilisateursPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Utilisateurs Globaux</h1>
          <p className="text-slate-500 mt-1">
            Gérez tous les utilisateurs inscrits sur la plateforme.
          </p>
        </div>
      </div>

      <UtilisateursClient />
    </div>
  );
}
