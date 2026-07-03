"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function registerPatron(formData: FormData) {
  const nom_etablissement = formData.get("nom_etablissement") as string;
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

  try {
    const token = crypto.randomUUID();

    // Créer l'établissement ET le compte patron dans une transaction
    await prisma.$transaction(async (tx) => {
      const etablissement = await tx.etablissement.create({
        data: {
          nom: nom_etablissement,
          plan_actuel: "Standard" // Plan par défaut
        }
      });

      await tx.utilisateur.create({
        data: {
          nom: nom_patron,
          email: email_patron,
          mot_de_passe: hashedPassword,
          role: "PATRON",
          etablissement_id: etablissement.id,
          token_verification: token,
          est_verifie: false
        }
      });

      // Créer un stock principal par défaut pour l'établissement
      await tx.stock.create({
        data: {
          nom: "Boutique Principale",
          etablissement_id: etablissement.id,
          est_externe: false
        }
      });
    });

    // SIMULATION D'ENVOI D'EMAIL (À remplacer par Resend ou Nodemailer plus tard)
    console.log("\n=======================================================");
    console.log(`📧 EMAIL DE CONFIRMATION À ENVOYER À : ${email_patron}`);
    console.log(`Lien de vérification : http://localhost:3000/verify?token=${token}`);
    console.log("=======================================================\n");

  } catch (error) {
    console.error("Erreur inscription:", error);
    return { error: "Une erreur est survenue lors de la création de votre compte." };
  }

  return { success: true, message: "Inscription réussie ! Veuillez vérifier votre boîte mail pour activer votre compte." };
}
