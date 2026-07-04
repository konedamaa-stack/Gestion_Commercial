"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function addClient(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;

  if (!nom) {
    throw new Error("Le nom est requis");
  }

  // Vérification de la limite de forfait
  const etablissement = await prisma.etablissement.findUnique({
    where: { id: session.etablissement_id! }
  });

  if (etablissement?.plan_actuel === "Standard") {
    const clientsCount = await prisma.client.count({
      where: { 
        etablissement_id: session.etablissement_id!
      }
    });

    if (clientsCount >= 10) {
      throw new Error("Limite atteinte : Le forfait Standard vous limite à 10 clients. Veuillez passer à la version PRO.");
    }
  }

  await prisma.client.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom: nom,
      adresse: adresse || null,
      telephone: telephone || null,
    },
  });

  revalidatePath("/clients");
}

export async function updateClient(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;

  if (!id || !nom) throw new Error("ID et Nom requis");

  await prisma.client.update({
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
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut supprimer un client");

  await prisma.client.delete({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
  });
  
  revalidatePath("/clients");
}
