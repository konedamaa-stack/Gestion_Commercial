"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { addClient } from "./actions";

export function ClientsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="mt-2 text-slate-500">
            Gérez votre base de clients pour vos ventes.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Client
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un Client"
      >
        <form 
          action={async (formData) => {
            await addClient(formData);
            setIsModalOpen(false);
          }} 
          className="space-y-4"
        >
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">Nom du client</label>
            <input 
              type="text" 
              name="nom" 
              id="nom" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ex: Jean Dupont"
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
              placeholder="ex: Marché central"
            />
          </div>
          
          <div className="pt-4">
            <SubmitButton label="Ajouter le client" />
          </div>
        </form>
      </Modal>
    </>
  );
}
