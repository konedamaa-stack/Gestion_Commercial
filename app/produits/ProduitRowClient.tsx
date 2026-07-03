"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteProduit, updateProduit } from "./actions";

export function ProduitRowClient({ 
  produit, 
  categories,
  userRole
}: { 
  produit: any, 
  categories: any[],
  userRole?: string
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-slate-900">{produit.nom}</div>
          <div className="text-xs text-slate-500">{produit.code_barre || "Sans code barre"}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {produit.categorie.nom}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-slate-900">{produit.prix_achat_gros} F</div>
          <div className="text-xs text-slate-500">{produit.prix_achat_detail} F (Détail)</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-slate-900">{produit.prix_vente_gros} F</div>
          <div className="text-xs text-slate-500">{produit.prix_vente_detail} F (Détail)</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-2">
            {userRole !== "VENDEUR" && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {userRole !== "VENDEUR" && (
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Produit">
        <form 
          action={async (formData) => {
            await updateProduit(formData);
            setIsEditModalOpen(false);
          }} 
          className="space-y-4"
        >
          <input type="hidden" name="id" value={produit.id} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du produit</label>
            <input type="text" name="nom" defaultValue={produit.nom} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code Barre (Opt)</label>
              <input type="text" name="code_barre" defaultValue={produit.code_barre || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <select name="categorie_id" defaultValue={produit.categorie_id} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
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
                  <input type="number" step="0.01" name="prix_achat_gros" defaultValue={produit.prix_achat_gros} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Détail (F)</label>
                  <input type="number" step="0.01" name="prix_achat_detail" defaultValue={produit.prix_achat_detail} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Prix de Vente</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gros (F)</label>
                  <input type="number" step="0.01" name="prix_vente_gros" defaultValue={produit.prix_vente_gros} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Détail (F)</label>
                  <input type="number" step="0.01" name="prix_vente_detail" defaultValue={produit.prix_vente_detail} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
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
        title="Supprimer le produit"
        description={`Êtes-vous sûr de vouloir supprimer le produit "${produit.nom}" ? Cette action est irréversible et supprimera le produit de votre catalogue. Si des mouvements de stocks existent pour ce produit, la suppression sera bloquée.`}
        onConfirm={async () => {
          await deleteProduit(produit.id);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
}
