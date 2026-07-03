const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function test() {
  const nom_etablissement = "Test Etablissement";
  const nom_patron = "Test Patron";
  const email_patron = "testpatron@test.com";
  const password_patron = "password123";

  try {
    const hashedPassword = await bcrypt.hash(password_patron, 10);
    await prisma.$transaction(async (tx) => {
      const etablissement = await tx.etablissement.create({
        data: {
          nom: nom_etablissement,
          plan_actuel: "Standard"
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

      await tx.stock.create({
        data: {
          nom: "Boutique Principale",
          etablissement_id: etablissement.id,
          est_externe: false
        }
      });
      console.log("Success! Etablissement ID:", etablissement.id);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
