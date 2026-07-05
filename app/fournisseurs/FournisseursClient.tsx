"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { addFournisseur } from "./actions";

export function FournisseursClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full sm:w-auto">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Fournisseur
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un Fournisseur"
      >
        <form 
          action={async (formData) => {
            await addFournisseur(formData);
            setIsModalOpen(false);
          }} 
          className="space-y-4"
        >
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">Nom du fournisseur</label>
            <input 
              type="text" 
              name="nom" 
              id="nom" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: GlobalTech"
            />
          </div>
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 mb-1">Téléphone (Optionnel)</label>
            <input 
              type="tel" 
              name="telephone" 
              id="telephone" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: 0123456789"
            />
          </div>
          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-slate-700 mb-1">Lieu (Optionnel)</label>
            <input 
              type="text" 
              name="adresse" 
              id="adresse" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Zone Industrielle Sud"
            />
          </div>
          
          <div className="pt-4">
            <SubmitButton label="Ajouter le fournisseur" />
          </div>
        </form>
      </Modal>
    </>
  );
}
