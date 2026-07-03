"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim();
  const password = formData.get("password") as string;

  console.log("Tentative de login:", { email, passwordLength: password?.length });

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  // 1. Chercher l'utilisateur
  const user = await prisma.utilisateur.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("Utilisateur non trouvé pour:", email);
    return { error: "Identifiants incorrects." };
  }

  if (user.role !== "SUPER_ADMIN" && !user.est_verifie) {
    return { error: "Votre adresse email n'est pas encore vérifiée. Veuillez consulter votre boîte de réception." };
  }

  console.log("Utilisateur trouvé:", user.email, user.role);

  // 2. Vérifier le mot de passe avec bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
  
  if (!isPasswordValid) {
    return { error: "Identifiants incorrects" };
  }

  // 3. Vérifier le statut de l'établissement (pour les non SUPER_ADMIN)
  if (user.role !== "SUPER_ADMIN" && user.etablissement_id) {
    const etablissement = await prisma.etablissement.findUnique({
      where: { id: user.etablissement_id }
    });

    if (etablissement) {
      if (!etablissement.actif) {
        return { error: "Votre établissement est inactif. Veuillez contacter l'administrateur." };
      }

      if (etablissement.expiration && etablissement.expiration < new Date()) {
        return { error: "L'abonnement de votre établissement a expiré. Veuillez contacter l'administrateur." };
      }
    }
  }

  // 4. Créer la session
  await createSession({
    userId: user.id,
    nom: user.nom,
    role: user.role,
    etablissement_id: user.etablissement_id,
  });

  // 4. Rediriger vers le dashboard approprié
  if (user.role === "SUPER_ADMIN") {
    redirect("/super-admin");
  } else {
    redirect("/dashboard");
  }
}
