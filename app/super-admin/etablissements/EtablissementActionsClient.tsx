"use client";

import { useState } from "react";
import { toggleEtablissementStatus, renewEtablissement, impersonateEtablissement, upgradeToPro, deleteEtablissement, resetEtablissementCredentials } from "./actions";

export default function EtablissementActionsClient({ 
  id, 
  actif, 
  expiration,
  plan_actuel,
  email_patron
}: { 
  id: string, 
  actif: boolean,
  expiration: Date | null,
  plan_actuel: string,
  email_patron?: string
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleEtablissementStatus(id, actif);
    setLoading(false);
  }

  async function handleRenew() {
    if (confirm("Voulez-vous ajouter 1 an d'abonnement à cet établissement ?")) {
      setLoading(true);
      await renewEtablissement(id);
      setLoading(false);
    }
  }

  async function handleUpgradeToPro() {
    if (confirm("Voulez-vous passer cet établissement en version PRO pour 1 an ?")) {
      setLoading(true);
      await upgradeToPro(id);
      setLoading(false);
    }
  }

  async function handleImpersonate() {
    setLoading(true);
    const result = await impersonateEtablissement(id);
    if (result?.error) {
      alert(result.error);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet établissement DÉFINITIVEMENT ? Toutes ses données (utilisateurs, produits, ventes) seront effacées.")) {
      setLoading(true);
      const result = await deleteEtablissement(id);
      if (result?.error) {
        alert(result.error);
        setLoading(false);
      }
    }
  }

  async function handleResetCredentials() {
    const newEmail = prompt("Nouvel email de connexion pour le Patron:", email_patron || "");
    if (newEmail === null) return; // Annulé
    
    if (!newEmail.trim()) {
      alert("L'email ne peut pas être vide.");
      return;
    }

    const newPassword = prompt("Nouveau mot de passe (laisser vide pour ne pas le changer):");
    if (newPassword === null) return; // Annulé

    setLoading(true);
    const result = await resetEtablissementCredentials(id, newEmail.trim(), newPassword);
    if (result?.error) {
      alert(result.error);
    } else {
      alert("Les accès ont été modifiés avec succès.");
    }
    setLoading(false);
  }

  return (
    <div className="flex justify-end gap-2 items-center flex-wrap">
      {plan_actuel === "Standard" && (
        <button 
          onClick={handleUpgradeToPro}
          disabled={loading}
          className="px-3 py-1.5 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
        >
          Passer en PRO
        </button>
      )}

      <button 
        onClick={handleResetCredentials}
        disabled={loading}
        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
      >
        Modifier Accès
      </button>

      <button 
        onClick={handleImpersonate}
        disabled={loading}
        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
      >
        Ouvrir l'espace
      </button>

      <button 
        onClick={handleToggle}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
          actif 
            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
            : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
        }`}
      >
        {actif ? "Désactiver" : "Activer"}
      </button>

      <button 
        onClick={handleRenew}
        disabled={loading}
        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
      >
        Renouveler 1 an
      </button>

      <button 
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
      >
        Supprimer
      </button>
    </div>
  );
}
