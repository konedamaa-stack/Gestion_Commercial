"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteProduit, updateProduit } from "./actions";
import { formatNumber } from "@/lib/format";
import { toast } from "react-hot-toast";

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
          <div className="flex items-center gap-3">
            {produit.imageUrl ? (
              <img src={produit.imageUrl} alt={produit.nom} className="w-10 h-10 rounded object-cover bg-slate-100 border border-slate-200" />
            ) : (
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">IMG</div>
            )}
            <div>
              <div className="text-sm font-medium text-slate-900">{produit.nom}</div>
              <div className="text-xs text-slate-500">{produit.code_barre || "Sans code barre"}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {produit.categorie.nom}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-slate-900">{formatNumber(produit.prix_achat_gros)} F</div>
          <div className="text-xs text-slate-500">{formatNumber(produit.prix_achat_detail)} F (Détail)</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-slate-900">{formatNumber(produit.prix_vente_gros)} F</div>
          <div className="text-xs text-slate-500">{formatNumber(produit.prix_vente_detail)} F (Détail)</div>
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
            try {
              await updateProduit(formData);
              setIsEditModalOpen(false);
              toast.success("Produit modifié");
            } catch (err: any) {
              toast.error(err.message || "Erreur");
            }
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seuil Alerte Stock</label>
              <input type="number" name="seuil_alerte_stock" defaultValue={produit.seuil_alerte_stock ?? 10} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image du Produit (Remplacer)</label>
              <input type="hidden" name="imageUrl" value={produit.imageUrl || ""} />
              <input type="file" name="imageFile" accept="image/*" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {produit.imageUrl && <p className="text-xs text-slate-500 mt-1">Image actuelle: {produit.imageUrl.split('/').pop()}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Prix d'Achat</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gros (F)</label>
                  <input type="number" step="1" name="prix_achat_gros" defaultValue={produit.prix_achat_gros} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Détail (F)</label>
                  <input type="number" step="1" name="prix_achat_detail" defaultValue={produit.prix_achat_detail} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Prix de Vente</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gros (F)</label>
                  <input type="number" step="1" name="prix_vente_gros" defaultValue={produit.prix_vente_gros} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Détail (F)</label>
                  <input type="number" step="1" name="prix_vente_detail" defaultValue={produit.prix_vente_detail} required className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
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
          try {
            await deleteProduit(produit.id);
            setIsDeleteModalOpen(false);
            toast.success("Produit supprimé");
          } catch (err: any) {
            toast.error(err.message || "Erreur lors de la suppression");
          }
        }}
      />
    </>
  );
}
