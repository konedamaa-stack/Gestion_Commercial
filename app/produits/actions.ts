"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { promises as fs } from "fs";
import path from "path";

async function saveFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "produits");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/produits/${fileName}`;
}

export async function addProduit(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé : Seul le patron peut ajouter un produit");

  const nom = formData.get("nom") as string;
  const code_barre = formData.get("code_barre") as string | null;
  const categorie_id = formData.get("categorie_id") as string;
  const prix_achat_gros = parseInt(formData.get("prix_achat_gros") as string, 10);
  const prix_achat_detail = parseInt(formData.get("prix_achat_detail") as string, 10);
  const prix_vente_gros = parseInt(formData.get("prix_vente_gros") as string, 10);
  const prix_vente_detail = parseInt(formData.get("prix_vente_detail") as string, 10);
  const seuil_alerte_stock = parseInt(formData.get("seuil_alerte_stock") as string, 10) || 10;
  
  let imageUrl = formData.get("imageUrl") as string | null;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveFile(imageFile);
  }

  if (!nom || !categorie_id || isNaN(prix_achat_gros) || isNaN(prix_achat_detail) || isNaN(prix_vente_gros) || isNaN(prix_vente_detail)) {
    throw new Error("Tous les champs obligatoires doivent être valides.");
  }

  if (prix_vente_gros <= prix_achat_gros) {
    throw new Error("Le prix de vente en gros doit être supérieur au prix d'achat en gros.");
  }
  if (prix_vente_detail <= prix_achat_detail) {
    throw new Error("Le prix de vente au détail doit être supérieur au prix d'achat au détail.");
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
      seuil_alerte_stock,
      imageUrl: imageUrl || null,
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
  const prix_achat_gros = parseInt(formData.get("prix_achat_gros") as string, 10);
  const prix_achat_detail = parseInt(formData.get("prix_achat_detail") as string, 10);
  const prix_vente_gros = parseInt(formData.get("prix_vente_gros") as string, 10);
  const prix_vente_detail = parseInt(formData.get("prix_vente_detail") as string, 10);
  const seuil_alerte_stock = parseInt(formData.get("seuil_alerte_stock") as string, 10) || 10;
  
  let imageUrl = formData.get("imageUrl") as string | null;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveFile(imageFile);
  }

  if (!id || !nom || !categorie_id || isNaN(prix_achat_gros) || isNaN(prix_achat_detail) || isNaN(prix_vente_gros) || isNaN(prix_vente_detail)) {
    throw new Error("Tous les champs obligatoires doivent être valides.");
  }

  if (prix_vente_gros <= prix_achat_gros) {
    throw new Error("Le prix de vente en gros doit être supérieur au prix d'achat en gros.");
  }
  if (prix_vente_detail <= prix_achat_detail) {
    throw new Error("Le prix de vente au détail doit être supérieur au prix d'achat au détail.");
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
      seuil_alerte_stock,
      imageUrl: imageUrl || null,
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
