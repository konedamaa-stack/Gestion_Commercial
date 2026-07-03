"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function addMouvement(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const type = formData.get("type") as string;
  const produit_id = formData.get("produit_id") as string;
  const stock_source_id = formData.get("stock_source_id") as string;
  const stock_destination_id = formData.get("stock_destination_id") as string;
  const quantite = parseInt(formData.get("quantite") as string, 10);
  const prix_unitaire = parseInt(formData.get("prix_unitaire") as string, 10);
  const utilisateur_id = session.userId;

  if (!produit_id || !stock_source_id || !stock_destination_id || isNaN(quantite) || isNaN(prix_unitaire)) {
    throw new Error("Tous les champs sont requis et doivent être valides.");
  }

  await prisma.mouvementStock.create({
    data: {
      etablissement_id: session.etablissement_id!,
      type,
      produit_id,
      stock_source_id,
      stock_destination_id,
      quantite,
      prix_unitaire_applique: prix_unitaire,
      utilisateur_id,
    },
  });

  revalidatePath("/mouvements");
}

export async function deleteMouvement(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut supprimer un mouvement");

  await prisma.mouvementStock.delete({ 
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    } 
  });
  revalidatePath("/mouvements");
}
