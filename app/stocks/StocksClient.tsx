"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { addStock } from "./actions";

export function StocksClient({ stocks }: { stocks: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full sm:w-auto">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Magasin
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un Magasin"
      >
        <form 
          action={async (formData) => {
            await addStock(formData);
            setIsModalOpen(false);
          }} 
          className="space-y-4"
        >
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">Nom du magasin</label>
            <input 
              type="text" 
              name="nom" 
              id="nom" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Boutique Nord"
            />
          </div>
          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-slate-700 mb-1">Adresse (Optionnel)</label>
            <input 
              type="text" 
              name="adresse" 
              id="adresse" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: 12 rue de la Paix"
            />
          </div>
          <div>
            <label htmlFor="stock_parent_id" className="block text-sm font-medium text-slate-700 mb-1">Magasin Parent (Optionnel)</label>
            <select 
              name="stock_parent_id" 
              id="stock_parent_id"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">-- Aucun parent (Magasin principal) --</option>
              {stocks.map(s => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-4">
            <SubmitButton label="Créer le magasin" />
          </div>
        </form>
      </Modal>
    </>
  );
}
