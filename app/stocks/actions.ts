"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function addStock(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const stock_parent_id = formData.get("stock_parent_id") as string | null;

  if (!nom) {
    throw new Error("Le nom est requis");
  }

  await prisma.stock.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom,
      adresse: adresse || null,
      est_externe: false,
      stock_parent_id: stock_parent_id || null,
    },
  });

  revalidatePath("/stocks");
}

export async function updateStock(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const est_externe = formData.get("est_externe") === "true";
  const stock_parent_id = formData.get("stock_parent_id") as string | null;

  if (!id || !nom) throw new Error("ID et Nom requis");

  await prisma.stock.update({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
    data: {
      nom,
      adresse,
      est_externe,
      stock_parent_id: stock_parent_id || null,
    },
  });
  revalidatePath("/stocks");
}

export async function deleteStock(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut supprimer un stock");

  await prisma.stock.delete({ 
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    } 
  });
  revalidatePath("/stocks");
}
