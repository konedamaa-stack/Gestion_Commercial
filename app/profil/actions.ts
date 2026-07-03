"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changePasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Non connecté" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Veuillez remplir tous les champs." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 6) {
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }

  const user = await prisma.utilisateur.findUnique({
    where: { id: session.userId }
  });

  if (!user) {
    return { error: "Utilisateur introuvable." };
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.mot_de_passe);
  if (!isPasswordValid) {
    return { error: "Le mot de passe actuel est incorrect." };
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { mot_de_passe: hashedNewPassword }
  });

  revalidatePath("/profil");
  return { success: true };
}
