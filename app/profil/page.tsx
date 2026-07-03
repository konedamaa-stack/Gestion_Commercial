import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { ProfilClient } from "./ProfilClient";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-indigo-600" />
          Mon Profil
        </h1>
        <p className="text-slate-500">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Informations du compte</h2>
        <div className="space-y-2 text-slate-600">
          <p><span className="font-medium text-slate-800">Nom :</span> {session.nom}</p>
          <p><span className="font-medium text-slate-800">Rôle :</span> {session.role}</p>
        </div>
      </div>

      <ProfilClient />
    </div>
  );
}
