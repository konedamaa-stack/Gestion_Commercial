import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { InventaireClient } from "./InventaireClient";

export default async function InventairePage() {
  const session = await getSession();

  // Seuls les PATRONs (et peut-être Vendeurs selon vos futures règles) y ont accès
  if (!session || (session.role !== "PATRON" && session.role !== "VENDEUR")) {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Rapport d'Inventaire
        </h1>
        <p className="text-slate-500">
          Consultez l'état de votre stock et l'historique des mouvements sur une période donnée.
        </p>
      </div>

      <InventaireClient />
    </div>
  );
}
