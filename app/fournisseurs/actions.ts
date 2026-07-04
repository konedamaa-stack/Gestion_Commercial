"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function addFournisseur(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;

  if (!nom) {
    throw new Error("Le nom est requis");
  }

  await prisma.fournisseur.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom: nom,
      adresse: adresse || null,
      telephone: telephone || null,
    },
  });

  revalidatePath("/fournisseurs");
}

export async function updateFournisseur(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;

  if (!id || !nom) throw new Error("ID et Nom requis");

  await prisma.fournisseur.update({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
    data: {
      nom: nom,
      adresse: adresse || null,
      telephone: telephone || null,
    },
  });
  revalidatePath("/fournisseurs");
}

export async function deleteFournisseur(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut supprimer un fournisseur");

  await prisma.fournisseur.delete({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
  });
  
  revalidatePath("/fournisseurs");
}
