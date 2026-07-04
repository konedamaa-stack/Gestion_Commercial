"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { addEmploye } from "./actions";

export function EmployesClient({ stocks }: { stocks: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Comptes Utilisateurs</h1>
          <p className="mt-2 text-slate-500">
            Gérez les accès de vos vendeurs, responsables et autres admins.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un compte
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un Employé"
      >
        <form 
          action={async (formData) => {
            await addEmploye(formData);
            setIsModalOpen(false);
          }} 
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <input type="text" name="nom" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: Jean Dupont" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
              <select name="role" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                <option value="VENDEUR">Vendeur</option>
                <option value="PATRON">Patron / Admin</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="jean@exemple.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" name="mot_de_passe" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigner à un stock (Optionnel)</label>
            <select name="stock_id" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="">-- Non assigné (Accès global) --</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Si assigné, le vendeur ne verra que ce stock par défaut.</p>
          </div>
          
          <div className="pt-4">
            <SubmitButton label="Créer le compte" />
          </div>
        </form>
      </Modal>
    </>
  );
}
