"use client";

import { useState } from "react";
import { payerCredit } from "./actions";
import { toast } from "react-hot-toast";

export function CreditsClient({ commandeId, resteAPayer }: { commandeId: string, resteAPayer: number }) {
  const [loading, setLoading] = useState(false);

  const handlePayer = async () => {
    const montantStr = prompt(`Entrez le montant remboursé (Max: ${resteAPayer} F) :`, resteAPayer.toString());
    if (!montantStr) return;
    
    const montant = parseInt(montantStr);
    if (isNaN(montant) || montant <= 0) {
      return toast.error("Montant invalide");
    }

    setLoading(true);
    try {
      await payerCredit(commandeId, Math.min(montant, resteAPayer));
      toast.success("Paiement enregistré !");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayer}
      disabled={loading}
      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
    >
      {loading ? "..." : "Encaisser"}
    </button>
  );
}
