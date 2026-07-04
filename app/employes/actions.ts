"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function addEmploye(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const mot_de_passe = formData.get("mot_de_passe") as string;
  const role = formData.get("role") as string;
  const stock_id = formData.get("stock_id") as string | null;

  if (!nom || !email || !mot_de_passe) {
    throw new Error("Nom, email et mot de passe sont requis");
  }

  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

  await prisma.utilisateur.create({
    data: {
      etablissement_id: session.etablissement_id!,
      nom,
      email,
      mot_de_passe: hashedPassword,
      role: role || "VENDEUR",
      stock_id: stock_id || null,
      est_verifie: true,
    },
  });

  revalidatePath("/employes");
}

export async function updateEmploye(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const stock_id = formData.get("stock_id") as string | null;
  const mot_de_passe = formData.get("mot_de_passe") as string | null;

  if (!id || !nom || !email) throw new Error("ID, Nom et Email requis");

  const dataToUpdate: any = {
    nom,
    email,
    role: role || "VENDEUR",
    stock_id: stock_id || null,
  };

  if (mot_de_passe && mot_de_passe.trim() !== "") {
    dataToUpdate.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
  }

  await prisma.utilisateur.update({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
    data: dataToUpdate,
  });
  revalidatePath("/employes");
}

export async function deleteEmploye(id: string) {
  const session = await getSession();
  if (session?.role !== "PATRON") throw new Error("Accès refusé");

  await prisma.utilisateur.delete({
    where: { 
      id,
      etablissement_id: session.etablissement_id!
    },
  });
  
  revalidatePath("/employes");
}
