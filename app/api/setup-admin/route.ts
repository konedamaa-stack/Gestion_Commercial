import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Vérifier s'il y a déjà un Super Admin
    const existingAdmin = await prisma.utilisateur.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Le Super Admin existe déjà." });
    }

    // Créer le Super Admin
    const admin = await prisma.utilisateur.create({
      data: {
        nom: "Super Admin",
        email: "konedamaa1@gmail.com",
        mot_de_passe: "superadmin", // Vous pourrez le changer plus tard
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
