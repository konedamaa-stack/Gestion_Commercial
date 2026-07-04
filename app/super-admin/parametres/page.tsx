import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ParametresClient } from "./ParametresClient";

export default async function ParametresPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Récupérer l'email de l'utilisateur
  const user = await prisma.utilisateur.findUnique({
    where: { id: session.userId },
    select: { email: true }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500 mt-1">
          Gérez votre profil et la sécurité de votre compte Super Admin
        </p>
      </div>

      <ParametresClient email={user.email} />
    </div>
  );
}
