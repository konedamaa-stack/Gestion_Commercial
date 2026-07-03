const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.mouvementStock.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.categorie.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.etablissement.deleteMany();

  console.log('Creating Super Admin account...');
  
  const hashedPassword = await bcrypt.hash('superadmin', 10);
  
  await prisma.utilisateur.create({
    data: {
      nom: 'Super Admin',
      email: 'konedamaa1@gmail.com', // L'email de la capture d'écran
      mot_de_passe: hashedPassword,
      role: 'SUPER_ADMIN',
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
