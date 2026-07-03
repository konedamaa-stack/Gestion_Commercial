"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function payerCredit(commandeId: string, montant: number) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const commande = await prisma.commande.findUnique({
    where: { id: commandeId, etablissement_id: session.etablissement_id! }
  });

  if (!commande) throw new Error("Facture introuvable");

  const nouveauMontantPaye = commande.montant_paye + montant;
  const statut_paiement = nouveauMontantPaye >= commande.montant_total ? "PAYE" : "PARTIEL";

  await prisma.commande.update({
    where: { id: commandeId },
    data: {
      montant_paye: nouveauMontantPaye,
      statut_paiement
    }
  });

  revalidatePath("/credits");
  revalidatePath("/ventes");
  return { success: true };
}
