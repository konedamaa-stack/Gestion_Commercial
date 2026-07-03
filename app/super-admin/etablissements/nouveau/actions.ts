"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function createEtablissement(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return { error: "Accès non autorisé" };
    }

    const nom_etablissement = formData.get("nom_etablissement") as string;
    const plan = formData.get("plan") as string;
    const nom_patron = formData.get("nom_patron") as string;
    const email_patron = formData.get("email_patron") as string;
    const password_patron = formData.get("password_patron") as string;

    if (!nom_etablissement || !nom_patron || !email_patron || !password_patron) {
      return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    // Vérifier si l'email existe déjà
    const emailExists = await prisma.utilisateur.findUnique({
      where: { email: email_patron }
    });

    if (emailExists) {
      return { error: "Cet email est déjà utilisé par un autre utilisateur." };
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password_patron, 10);

    // Créer l'établissement ET le compte patron dans une transaction
    await prisma.$transaction(async (tx) => {
      const etablissement = await tx.etablissement.create({
        data: {
          nom: nom_etablissement,
          plan_actuel: plan || "Standard"
        }
      });

      await tx.utilisateur.create({
        data: {
          nom: nom_patron,
          email: email_patron,
          mot_de_passe: hashedPassword,
          role: "PATRON",
          etablissement_id: etablissement.id
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur création établissement:", error);
    return { error: "Une erreur est survenue lors de la création de l'établissement." };
  }
}
