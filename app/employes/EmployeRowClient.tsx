"use client";

import { useState } from "react";
import { Edit2, Trash2, Contact } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteEmploye, updateEmploye } from "./actions";

export function EmployeRowClient({ employe, stocks }: { employe: any, stocks: any[] }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Contact className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{employe.nom}</div>
              <div className="text-sm text-slate-500">{employe.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            employe.role === 'PATRON' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
          }`}>
            {employe.role}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          {employe.stock ? employe.stock.nom : <span className="italic text-slate-400">Global</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier l'Employé">
        <form 
          action={async (formData) => {
            await updateEmploye(formData);
            setIsEditModalOpen(false);
          }} 
          className="space-y-4"
        >
          <input type="hidden" name="id" value={employe.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <input type="text" name="nom" defaultValue={employe.nom} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
              <select name="role" defaultValue={employe.role} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                <option value="VENDEUR">Vendeur</option>
                <option value="PATRON">Patron / Admin</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" name="email" defaultValue={employe.email} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" name="mot_de_passe" placeholder="Laisser vide pour ne pas changer" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigner à un stock (Optionnel)</label>
            <select name="stock_id" defaultValue={employe.stock_id || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="">-- Non assigné (Accès global) --</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          
          <div className="pt-4">
            <SubmitButton label="Enregistrer les modifications" />
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer l'employé"
        description={`Êtes-vous sûr de vouloir révoquer l'accès de l'employé "${employe.nom}" ? Cette action est irréversible et supprimera le compte.`}
        onConfirm={async () => {
          await deleteEmploye(employe.id);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
}
