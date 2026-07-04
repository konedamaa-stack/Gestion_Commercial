const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('superadmin', 10)
  
  // Update if exists, or create
  const user = await prisma.utilisateur.upsert({
    where: { email: 'koneamaa@gmail.com' },
    update: {
      mot_de_passe: hashedPassword,
      role: 'SUPER_ADMIN',
      est_verifie: true
    },
    create: {
      nom: 'Super Admin',
      email: 'koneamaa@gmail.com',
      mot_de_passe: hashedPassword,
      role: 'SUPER_ADMIN',
      est_verifie: true
    }
  })
  
  console.log("Super admin local configuré avec succès ! Email:", user.email)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
