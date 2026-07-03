"use client";

import { useState } from "react";
import { toggleEtablissementStatus, renewEtablissement, impersonateEtablissement, upgradeToPro } from "./actions";

export default function EtablissementActionsClient({ 
  id, 
  actif, 
  expiration,
  plan_actuel
}: { 
  id: string, 
  actif: boolean,
  expiration: Date | null,
  plan_actuel: string
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
    </div>
  );
}
