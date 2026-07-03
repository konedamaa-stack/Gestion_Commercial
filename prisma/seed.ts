import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Début du seeding...')

  // 1. Création des Stocks
  const stockPrincipal = await prisma.stock.create({
    data: {
      nom: 'Entrepôt Principal',
      adresse: 'Zone Industrielle Nord, Bâtiment A',
      est_externe: false,
    },
  })

  const boutiqueCentre = await prisma.stock.create({
    data: {
      nom: 'Boutique Centre-Ville',
      adresse: '15 rue de la République',
      est_externe: false,
      stock_parent_id: stockPrincipal.id,
    },
  })

  const fournisseurTech = await prisma.stock.create({
    data: {
      nom: 'Fournisseur GlobalTech',
      est_externe: true,
    },
  })

  console.log('Stocks créés.')

  // 2. Création des Utilisateurs
  const patron = await prisma.utilisateur.create({
    data: {
      nom: 'Admin Patron',
      email: 'admin@gestion.com',
      mot_de_passe: 'password123', // En production, il faut hasher ce mot de passe !
      role: 'PATRON',
    },
  })

  const vendeur1 = await prisma.utilisateur.create({
    data: {
      nom: 'Jean Vendeur',
      email: 'jean@gestion.com',
      mot_de_passe: 'password123',
      role: 'VENDEUR',
      stock_id: boutiqueCentre.id,
    },
  })

  console.log('Utilisateurs créés.')

  // 3. Création des Catégories
  const catElectromenager = await prisma.categorie.create({
    data: {
      nom: 'Électroménager',
      description: 'Gros et petit électroménager',
    },
  })

  const catInformatique = await prisma.categorie.create({
    data: {
      nom: 'Informatique',
      description: 'Ordinateurs, composants et accessoires',
    },
  })

  console.log('Catégories créées.')

  // 4. Création des Produits
  const produit1 = await prisma.produit.create({
    data: {
      nom: 'Ordinateur Portable Pro 15"',
      code_barre: '1234567890123',
      categorie_id: catInformatique.id,
      prix_achat_gros: 600,
      prix_achat_detail: 650,
      prix_vente_gros: 800,
      prix_vente_detail: 950,
    },
  })

  const produit2 = await prisma.produit.create({
    data: {
      nom: 'Machine à café automatique',
      code_barre: '9876543210987',
      categorie_id: catElectromenager.id,
      prix_achat_gros: 200,
      prix_achat_detail: 220,
      prix_vente_gros: 350,
      prix_vente_detail: 400,
    },
  })

  console.log('Produits créés.')

  // 5. Création de mouvements initiaux (Stock initial)
  await prisma.mouvementStock.create({
    data: {
      type: 'ACHAT',
      produit_id: produit1.id,
      stock_source_id: fournisseurTech.id,
      stock_destination_id: stockPrincipal.id,
      quantite: 50,
      prix_unitaire_applique: 600,
      utilisateur_id: patron.id,
    },
  })

  await prisma.mouvementStock.create({
    data: {
      type: 'ACHAT',
      produit_id: produit2.id,
      stock_source_id: fournisseurTech.id,
      stock_destination_id: stockPrincipal.id,
      quantite: 30,
      prix_unitaire_applique: 200,
      utilisateur_id: patron.id,
    },
  })

  // Transfert vers la boutique
  await prisma.mouvementStock.create({
    data: {
      type: 'TRANSFERT',
      produit_id: produit1.id,
      stock_source_id: stockPrincipal.id,
      stock_destination_id: boutiqueCentre.id,
      quantite: 10,
      prix_unitaire_applique: 600,
      utilisateur_id: patron.id,
    },
  })

  console.log('Mouvements de stock créés.')
  console.log('Seeding terminé avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
