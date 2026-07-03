"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import crypto from "crypto";

export interface LignePanier {
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  prix_achat_unitaire: number;
}

export async function createCommande(data: {
  type_vente: string; // GROS, DETAIL, TRANSFERT_INTERNE
  client_id?: string;
  stock_source_id: string;
  stock_destination_id?: string;
  montant_total: number;
  montant_paye: number;
  lignes: LignePanier[];
}) {
  const session = await getSession();
  if (!session) throw new Error("Non authentifié");

  if (!data.stock_source_id || data.lignes.length === 0) {
    throw new Error("Données invalides : Stock source ou panier vide.");
  }

  // Déterminer le statut de paiement
  let statut_paiement = "NON_PAYE";
  if (data.montant_paye >= data.montant_total) {
    statut_paiement = "PAYE";
  } else if (data.montant_paye > 0) {
    statut_paiement = "PARTIEL";
  }

  // Générer un numéro de facture unique (ex: FAC-26-A1B2)
  const numero_facture = `FAC-${new Date().getFullYear().toString().slice(-2)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    // 1. Créer la commande
    const commande = await tx.commande.create({
      data: {
        numero_facture,
        type_vente: data.type_vente,
        statut_paiement,
        montant_total: data.montant_total,
        montant_paye: data.montant_paye,
        etablissement_id: session.etablissement_id!,
        client_id: data.client_id || null,
        stock_source_id: data.stock_source_id,
        stock_destination_id: data.stock_destination_id || null,
        vendeur_id: session.userId,
      },
    });

    // 2. Créer les lignes de commande et les mouvements de stock
    for (const ligne of data.lignes) {
      await tx.ligneCommande.create({
        data: {
          commande_id: commande.id,
          produit_id: ligne.produit_id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          prix_achat_unitaire: ligne.prix_achat_unitaire,
        },
      });

      // Créer le mouvement de stock (Sortie)
      await tx.mouvementStock.create({
        data: {
          type: data.type_vente === "TRANSFERT_INTERNE" ? "TRANSFERT" : "VENTE",
          etablissement_id: session.etablissement_id!,
          produit_id: ligne.produit_id,
          stock_source_id: data.stock_source_id, // Sort du stock source
          stock_destination_id: data.stock_destination_id || null, // Entre dans le stock destination si transfert
          quantite: ligne.quantite,
          prix_unitaire_applique: ligne.prix_unitaire,
          utilisateur_id: session.userId,
        },
      });
    }
  });

  revalidatePath("/ventes");
  revalidatePath("/stocks"); // Car l'inventaire change
  return { success: true, numero_facture };
}
