"use client";

import { useState } from "react";
import { Edit2, Trash2, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteStock, updateStock } from "./actions";

export function StockRowClient({ stock, stocks }: { stock: any, stocks: any[] }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              stock.stock_parent_id ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <span className="font-bold text-lg">{stock.nom.charAt(0)}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{stock.nom}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {stock.adresse || "Aucune adresse"}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {stock.stock_parent ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
              Rattaché à : {stock.stock_parent.nom}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              Stock Principal
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-2">
            <a 
              href={`/stocks/${stock.id}`}
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
              title="Voir l'inventaire détaillé"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Stock">
        <form 
          action={async (formData) => {
            await updateStock(formData);
            setIsEditModalOpen(false);
          }} 
          className="space-y-4"
        >
          <input type="hidden" name="id" value={stock.id} />
          {/* est_externe est false pour la page Stocks */}
          <input type="hidden" name="est_externe" value="false" />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du stock / boutique</label>
            <input type="text" name="nom" defaultValue={stock.nom} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse (Optionnel)</label>
            <input type="text" name="adresse" defaultValue={stock.adresse || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Parent (Hiérarchie)</label>
            <select name="stock_parent_id" defaultValue={stock.stock_parent_id || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="">-- C'est un stock principal --</option>
              {stocks.filter(s => s.id !== stock.id).map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
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
        title="Supprimer le stock"
        description={`Êtes-vous sûr de vouloir supprimer "${stock.nom}" ? Cette action est irréversible.`}
        onConfirm={async () => {
          await deleteStock(stock.id);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
}
