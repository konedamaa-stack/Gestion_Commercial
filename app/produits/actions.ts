"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function addProduit(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut ajouter un produit");

  const nom = formData.get("nom") as string;
  const code_barre = formData.get("code_barre") as string | null;
  const categorie_id = formData.get("categorie_id") as string;
  const prix_achat_gros = parseFloat(formData.get("prix_achat_gros") as string);
  const prix_achat_detail = parseFloat(formData.get("prix_achat_detail") as string);
  const prix_vente_gros = parseFloat(formData.get("prix_vente_gros") as string);
  const prix_vente_detail = parseFloat(formData.get("prix_vente_detail") as string);

  if (!nom || !categorie_id || isNaN(prix_achat_gros) || isNaN(prix_achat_detail) || isNaN(prix_vente_gros) || isNaN(prix_vente_detail)) {
    throw new Error("Tous les champs obligatoires doivent être valides.");
  }

  // Vérification de la limite de forfait
  const etablissement = await prisma.etablissement.findUnique({
    where: { id: session.etablissement_id! }
  });

  if (etablissement?.plan_actuel === "Standard") {
    const productCount = await prisma.produit.count({
      where: { etablissement_id: session.etablissement_id! }
    });

    if (productCount >= 10) {
      throw new Error("Limite atteinte : Le forfait Standard vous limite à 10 produits. Veuillez passer à la version PRO.");
    }
  }

  await prisma.produit.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom,
      code_barre: code_barre || null,
      categorie_id,
      prix_achat_gros,
      prix_achat_detail,
      prix_vente_gros,
      prix_vente_detail,
    },
  });

  revalidatePath("/produits");
}

export async function updateProduit(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const code_barre = formData.get("code_barre") as string | null;
  const categorie_id = formData.get("categorie_id") as string;
  const prix_achat_gros = parseFloat(formData.get("prix_achat_gros") as string);
  const prix_achat_detail = parseFloat(formData.get("prix_achat_detail") as string);
  const prix_vente_gros = parseFloat(formData.get("prix_vente_gros") as string);
  const prix_vente_detail = parseFloat(formData.get("prix_vente_detail") as string);

  if (!id || !nom || !categorie_id || isNaN(prix_achat_gros) || isNaN(prix_achat_detail) || isNaN(prix_vente_gros) || isNaN(prix_vente_detail)) {
    throw new Error("Tous les champs obligatoires doivent être valides.");
  }

  await prisma.produit.update({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
    data: {
      nom,
      code_barre: code_barre || null,
      categorie_id,
      prix_achat_gros,
      prix_achat_detail,
      prix_vente_gros,
      prix_vente_detail,
    },
  });

  revalidatePath("/produits");
}

export async function deleteProduit(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut supprimer un produit");

  await prisma.produit.delete({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
  });
  
  revalidatePath("/produits");
}

export async function addCategorie(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut ajouter une catégorie");

  const nom = formData.get("nom") as string;
  const description = formData.get("description") as string | null;

  if (!nom) {
    throw new Error("Le nom de la catégorie est requis.");
  }

  await prisma.categorie.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom,
      description: description || null,
    },
  });

  revalidatePath("/produits");
}
