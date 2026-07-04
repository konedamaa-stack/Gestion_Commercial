"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getUtilisateurs() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Accès refusé");

  const users = await prisma.utilisateur.findMany({
    include: {
      etablissement: {
        select: { nom: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return users;
}

export async function deleteUtilisateur(id: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Accès refusé");

  // Empêcher la suppression d'un SUPER_ADMIN
  const targetUser = await prisma.utilisateur.findUnique({ where: { id } });
  if (targetUser?.role === "SUPER_ADMIN") {
    throw new Error("Impossible de supprimer un compte Super Admin.");
  }

  await prisma.utilisateur.delete({ where: { id } });
  revalidatePath("/super-admin/utilisateurs");
}
