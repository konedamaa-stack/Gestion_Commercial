"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function addDepense(data: {
  motif: string;
  description?: string;
  montant: number;
}) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  if (!data.motif || data.montant <= 0) {
    throw new Error("Motif ou montant invalide");
  }

  await prisma.depense.create({
    data: {
      motif: data.motif,
      description: data.description,
      montant: data.montant,
      etablissement_id: session.etablissement_id!,
      enregistre_par_id: session.userId,
    }
  });

  revalidatePath("/depenses");
  return { success: true };
}

export async function deleteDepense(id: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN" && session.role !== "PATRON") {
    throw new Error("Non autorisé");
  }

  await prisma.depense.delete({
    where: { id, etablissement_id: session.etablissement_id! }
  });

  revalidatePath("/depenses");
  return { success: true };
}
