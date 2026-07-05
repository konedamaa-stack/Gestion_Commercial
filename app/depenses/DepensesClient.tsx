"use client";

import { useState } from "react";
import { Plus, X, Wallet } from "lucide-react";
import { addDepense, deleteDepense } from "./actions";
import { toast } from "react-hot-toast";

export function DepensesClient({ userRole }: { userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const MOTIFS = [
    "Salaire", "Facture Électricité", "Facture Eau", "Loyer",
    "Transport / Livraison", "Achat Matériel", "Carburant", "Autre"
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const motif = formData.get("motif") as string;
    const motif_autre = formData.get("motif_autre") as string;
    const finalMotif = motif === "Autre" ? motif_autre : motif;
    
    setLoading(true);
    try {
      await addDepense({
        motif: finalMotif,
        description: formData.get("description") as string,
        montant: parseInt(formData.get("montant") as string) || 0
      });
      toast.success("Dépense enregistrée");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette dépense ?")) return;
    try {
      await deleteDepense(id);
      toast.success("Dépense supprimée");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  return (
    <>
      <div className="w-full sm:w-auto">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvelle Dépense
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-red-600" />
                Enregistrer une dépense
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motif</label>
                <select name="motif" id="motifSelect" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  onChange={(e) => {
                    const autreInput = document.getElementById("motifAutreContainer");
                    if (e.target.value === "Autre" && autreInput) autreInput.style.display = "block";
                    else if (autreInput) autreInput.style.display = "none";
                  }}
                >
                  <option value="">Sélectionnez un motif...</option>
                  {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div id="motifAutreContainer" style={{display: 'none'}}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Précisez le motif</label>
                <input type="text" name="motif_autre" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ex: Réparation porte" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Montant (F)</label>
                <input type="number" name="montant" required min="1" step="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ex: 5000" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optionnel)</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Détails supplémentaires..." />
              </div>

              <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors mt-6">
                {loading ? "Enregistrement..." : "Valider la dépense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
