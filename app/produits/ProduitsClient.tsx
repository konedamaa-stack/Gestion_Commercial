"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { addProduit } from "./actions";

export function ProduitsClient({ categories, userRole }: { categories: any[], userRole?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Le vendeur ne peut pas ajouter de produit
  if (userRole === "VENDEUR") return null;

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Ajouter un Produit
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un Produit"
      >
        <form 
          action={async (formData) => {
            await addProduit(formData);
            setIsModalOpen(false);
          }} 
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du produit</label>
            <input type="text" name="nom" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: Ordinateur Portable" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code Barre (Opt)</label>
              <input type="text" name="code_barre" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <select name="categorie_id" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Prix d'Achat</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gros (F)</label>
                  <input type="number" step="0.01" name="prix_achat_gros" required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Détail (F)</label>
                  <input type="number" step="0.01" name="prix_achat_detail" required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Prix de Vente</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gros (F)</label>
                  <input type="number" step="0.01" name="prix_vente_gros" required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Détail (F)</label>
                  <input type="number" step="0.01" name="prix_vente_detail" required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <SubmitButton label="Ajouter le produit" />
          </div>
        </form>
      </Modal>
    </>
  );
}
