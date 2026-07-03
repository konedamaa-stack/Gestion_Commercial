const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.utilisateur.findUnique({
    where: { email: 'konedamaa1@gmail.com' }
  });
  console.log(admin);
}
check();
