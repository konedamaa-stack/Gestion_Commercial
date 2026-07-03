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
    const clientsCount = await prisma.stock.count({
      where: { 
        etablissement_id: session.etablissement_id!,
        est_externe: true,
        nom: { startsWith: "Client" }
      }
    });

    if (clientsCount >= 10) {
      throw new Error("Limite atteinte : Le forfait Standard vous limite à 10 clients. Veuillez passer à la version PRO.");
    }
  }

  // Préfixer le nom pour le distinguer des fournisseurs
  const nomClient = nom.toLowerCase().startsWith("client") ? nom : `Client - ${nom}`;

  await prisma.stock.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom: nomClient,
      adresse: adresse || null,
      telephone: telephone || null,
      est_externe: true,
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

  const nomClient = nom.toLowerCase().startsWith("client") ? nom : `Client - ${nom}`;

  await prisma.stock.update({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
    data: {
      nom: nomClient,
      adresse: adresse || null,
      telephone: telephone || null,
    },
  });
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut supprimer un client");

  await prisma.stock.delete({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
  });
  
  revalidatePath("/clients");
}
