import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Vérifier s'il y a déjà un Super Admin
    const existingAdmin = await prisma.utilisateur.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingAdmin) {
      // S'il existe déjà mais avec un mot de passe non haché, on le met à jour
      const hashedPassword = await bcrypt.hash("superadmin", 10);
      await prisma.utilisateur.update({
        where: { id: existingAdmin.id },
        data: { mot_de_passe: hashedPassword },
      });
      return NextResponse.json({ message: "Le Super Admin existait déjà, son mot de passe a été corrigé et haché avec succès." });
    }

    // Créer le Super Admin
    const hashedPassword = await bcrypt.hash("superadmin", 10);
    const admin = await prisma.utilisateur.create({
      data: {
        nom: "Super Admin",
        email: "konedamaa1@gmail.com",
        mot_de_passe: hashedPassword, // Mot de passe haché !
        role: "SUPER_ADMIN",
        est_verifie: true,
      },
    });

    return NextResponse.json({
      message: "Succès ! Le Super Admin a été créé. Vous pouvez maintenant vous connecter.",
      email: admin.email,
    });
  } catch (error) {
    console.error("Erreur lors de la création du Super Admin:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création." },
      { status: 500 }
    );
  }
}
