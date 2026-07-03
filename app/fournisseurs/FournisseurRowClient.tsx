"use client";

import { useState } from "react";
import { Edit2, Trash2, MapPin, Truck } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteFournisseur, updateFournisseur } from "./actions";

export function FournisseurRowClient({ fournisseur }: { fournisseur: any }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const cleanName = fournisseur.nom.replace("Fournisseur - ", "");

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{cleanName}</div>
              <div className="flex items-center gap-3 mt-0.5">
                {fournisseur.telephone && (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>📞</span>
                    {fournisseur.telephone}
                  </div>
                )}
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {fournisseur.adresse || "Aucun lieu"}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {new Date(fournisseur.createdAt).toLocaleDateString('fr-FR')}
          </span>
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Fournisseur">
        <form 
          action={async (formData) => {
            await updateFournisseur(formData);
            setIsEditModalOpen(false);
          }} 
          className="space-y-4"
        >
          <input type="hidden" name="id" value={fournisseur.id} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du fournisseur</label>
            <input type="text" name="nom" defaultValue={cleanName} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone (Optionnel)</label>
            <input type="tel" name="telephone" defaultValue={fournisseur.telephone || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lieu (Optionnel)</label>
            <input type="text" name="adresse" defaultValue={fournisseur.adresse || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
        title="Supprimer le fournisseur"
        description={`Êtes-vous sûr de vouloir supprimer le fournisseur "${cleanName}" ? Cette action est irréversible.`}
        onConfirm={async () => {
          await deleteFournisseur(fournisseur.id);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
}
