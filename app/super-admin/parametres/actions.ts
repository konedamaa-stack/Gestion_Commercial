"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changerMotDePasseAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return { error: "Non autorisé" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Tous les champs sont requis." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 6) {
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }

  // Vérifier l'ancien mot de passe
  const user = await prisma.utilisateur.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return { error: "Utilisateur non trouvé." };
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.mot_de_passe);
  if (!isPasswordValid) {
    return { error: "L'ancien mot de passe est incorrect." };
  }

  // Hacher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Mettre à jour dans la base
  await prisma.utilisateur.update({
    where: { id: session.userId },
    data: { mot_de_passe: hashedPassword },
  });

  revalidatePath("/super-admin/parametres");
  return { success: "Votre mot de passe a été modifié avec succès." };
}
