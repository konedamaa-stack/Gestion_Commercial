"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function impersonateEtablissement(etablissementId: string) {
  const currentSession = await getSession();
  
  // Vérification de sécurité stricte
  if (!currentSession || currentSession.role !== "SUPER_ADMIN") {
    return { error: "Accès refusé" };
  }

  // Trouver le compte Patron de cet établissement
  const patron = await prisma.utilisateur.findFirst({
    where: {
      etablissement_id: etablissementId,
      role: "PATRON"
    }
  });

  if (!patron) {
    return { error: "Aucun compte Patron trouvé pour cet établissement." };
  }

  // Créer une nouvelle session en usurpant l'identité du Patron
  await createSession({
    userId: patron.id,
    nom: patron.nom,
    role: patron.role,
    etablissement_id: patron.etablissement_id,
    impersonatedBySuperAdmin: true,
    superAdminId: currentSession.userId // On garde l'ID original pour pouvoir revenir
  });

  redirect("/dashboard");
}

export async function stopImpersonation() {
  const currentSession = await getSession();
  
  if (!currentSession || !currentSession.impersonatedBySuperAdmin || !currentSession.superAdminId) {
    return { error: "Session invalide" };
  }

  // Retrouver le compte Super Admin
  const superAdmin = await prisma.utilisateur.findUnique({
    where: { id: currentSession.superAdminId }
  });

  if (!superAdmin) {
    return { error: "Compte Super Admin introuvable" };
  }

  // Restaurer la session Super Admin
  await createSession({
    userId: superAdmin.id,
    nom: superAdmin.nom,
    role: superAdmin.role,
    etablissement_id: null
  });

  redirect("/super-admin/etablissements");
}

export async function toggleEtablissementStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.etablissement.update({
      where: { id },
      data: {
        actif: !currentStatus
      }
    });
    revalidatePath("/super-admin/etablissements");
    return { success: true };
  } catch (error) {
    console.error("Erreur toggle statut:", error);
    return { error: "Impossible de modifier le statut." };
  }
}

export async function renewEtablissement(id: string) {
  try {
    const etablissement = await prisma.etablissement.findUnique({ where: { id } });
    if (!etablissement) return { error: "Établissement introuvable." };

    // Si pas d'expiration ou déjà expiré, on part d'aujourd'hui. Sinon, on ajoute 1 an à l'expiration actuelle.
    const baseDate = (!etablissement.expiration || etablissement.expiration < new Date()) 
      ? new Date() 
      : new Date(etablissement.expiration);

    // Ajouter 1 an (365 jours)
    const newExpiration = new Date(baseDate);
    newExpiration.setFullYear(newExpiration.getFullYear() + 1);

    await prisma.etablissement.update({
      where: { id },
      data: {
        expiration: newExpiration,
        actif: true // On réactive automatiquement lors d'un paiement
      }
    });
    
    revalidatePath("/super-admin/etablissements");
    return { success: true };
  } catch (error) {
    console.error("Erreur renouvellement:", error);
    return { error: "Impossible de renouveler l'abonnement." };
  }
}

export async function upgradeToPro(id: string) {
  try {
    const etablissement = await prisma.etablissement.findUnique({ where: { id } });
    if (!etablissement) return { error: "Établissement introuvable." };

    const baseDate = (!etablissement.expiration || etablissement.expiration < new Date()) 
      ? new Date() 
      : new Date(etablissement.expiration);

    const newExpiration = new Date(baseDate);
    newExpiration.setFullYear(newExpiration.getFullYear() + 1);

    await prisma.etablissement.update({
      where: { id },
      data: {
        plan_actuel: "Pro",
        expiration: newExpiration,
        actif: true
      }
    });
    
    revalidatePath("/super-admin/etablissements");
    return { success: true };
  } catch (error) {
    console.error("Erreur upgrade:", error);
    return { error: "Impossible de passer en Pro." };
  }
}
