"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export interface LigneInventaire {
  produit_id: string;
  nom: string;
  code_barre: string | null;
  stockInitial: number;
  entrees: number;
  sorties: number;
  stockFinal: number;
  valeurAchat: number;
  valeurVente: number;
  prix_achat: number;
  prix_vente: number;
}

export interface RapportInventaire {
  valeurTotaleAchat: number;
  valeurTotaleVente: number;
  totalEntrees: number;
  totalSorties: number;
  lignes: LigneInventaire[];
}

export async function getInventaire(startDateStr: string, endDateStr: string): Promise<RapportInventaire> {
  const session = await getSession();
  if (!session || !session.etablissement_id) {
    throw new Error("Non autorisé");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  // 1. Récupérer les stocks internes
  const stocks = await prisma.stock.findMany({
    where: { etablissement_id: session.etablissement_id, est_externe: false },
    select: { id: true },
  });
  const internalStockIds = stocks.map((s) => s.id);

  // 2. Récupérer tous les produits
  const produits = await prisma.produit.findMany({
    where: { etablissement_id: session.etablissement_id },
  });

  // 3. Récupérer tous les mouvements jusqu'à la date de fin
  const mouvements = await prisma.mouvementStock.findMany({
    where: {
      etablissement_id: session.etablissement_id,
      date_mouvement: { lte: endDate },
    },
  });

  // 4. Calculs en mémoire
  const lignesMap = new Map<string, LigneInventaire>();

  produits.forEach((p) => {
    lignesMap.set(p.id, {
      produit_id: p.id,
      nom: p.nom,
      code_barre: p.code_barre,
      stockInitial: 0,
      entrees: 0,
      sorties: 0,
      stockFinal: 0,
      valeurAchat: 0,
      valeurVente: 0,
      prix_achat: p.prix_achat_detail > 0 ? p.prix_achat_detail : p.prix_achat_gros, // Privilégier achat détail
      prix_vente: p.prix_vente_detail > 0 ? p.prix_vente_detail : p.prix_vente_gros, // Privilégier vente détail
    });
  });

  let totalEntrees = 0;
  let totalSorties = 0;

  mouvements.forEach((m) => {
    const ligne = lignesMap.get(m.produit_id);
    if (!ligne) return;

    const isDateBefore = m.date_mouvement < startDate;
    const isDateInPeriod = m.date_mouvement >= startDate && m.date_mouvement <= endDate;

    const isSourceInternal = m.stock_source_id ? internalStockIds.includes(m.stock_source_id) : false;
    const isDestInternal = m.stock_destination_id ? internalStockIds.includes(m.stock_destination_id) : false;

    if (m.type === "ACHAT") {
      if (isDestInternal) {
        if (isDateBefore) ligne.stockInitial += m.quantite;
        else if (isDateInPeriod) {
          ligne.entrees += m.quantite;
          totalEntrees += m.quantite * m.prix_unitaire_applique;
        }
      }
    } else if (m.type === "VENTE") {
      if (isSourceInternal) {
        if (isDateBefore) ligne.stockInitial -= m.quantite;
        else if (isDateInPeriod) {
          ligne.sorties += m.quantite;
          totalSorties += m.quantite * m.prix_unitaire_applique;
        }
      }
    } else {
      // TRANSFERT
      if (isDestInternal) {
        if (isDateBefore) ligne.stockInitial += m.quantite;
        else if (isDateInPeriod) {
          ligne.entrees += m.quantite;
          // Ne pas compter les transferts dans le "totalEntrees" financier ?
          // ou on les compte à 0 F.
        }
      }
      if (isSourceInternal) {
        if (isDateBefore) ligne.stockInitial -= m.quantite;
        else if (isDateInPeriod) {
          ligne.sorties += m.quantite;
          // Ne pas compter les transferts dans le "totalSorties" financier
        }
      }
    }
  });

  let valeurTotaleAchat = 0;
  let valeurTotaleVente = 0;

  const lignes = Array.from(lignesMap.values()).map((ligne) => {
    ligne.stockFinal = ligne.stockInitial + ligne.entrees - ligne.sorties;
    ligne.valeurAchat = ligne.stockFinal * ligne.prix_achat;
    ligne.valeurVente = ligne.stockFinal * ligne.prix_vente;

    valeurTotaleAchat += ligne.valeurAchat;
    valeurTotaleVente += ligne.valeurVente;

    return ligne;
  });

  return {
    valeurTotaleAchat,
    valeurTotaleVente,
    totalEntrees,
    totalSorties,
    lignes: lignes.sort((a, b) => a.nom.localeCompare(b.nom)),
  };
}
