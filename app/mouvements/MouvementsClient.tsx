"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { addMouvement } from "./actions";

interface DataProps {
  produits: any[];
  stocks: any[];
  utilisateurs: any[];
}

export function MouvementsClient({ produits, stocks, utilisateurs }: DataProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("ACHAT"); // ACHAT, VENTE, TRANSFERT

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mouvements de Stock</h1>
          <p className="mt-2 text-slate-500">
            Historique des achats, ventes et transferts.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Mouvement
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Enregistrer un Mouvement"
      >
        <form 
          action={async (formData) => {
            await addMouvement(formData);
            setIsModalOpen(false);
          }} 
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type de mouvement</label>
            <select 
              name="type" 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none"
            >
              <option value="ACHAT">Achat (Entrée stock)</option>
              <option value="VENTE">Vente (Sortie stock)</option>
              <option value="TRANSFERT">Transfert Interne</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Produit</label>
            <select name="produit_id" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {type !== "ACHAT" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock Source (Interne)
                </label>
                <select name="stock_source_id" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                  {stocks.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            )}
            
            {type !== "VENTE" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock Destination (Interne)
                </label>
                <select name="stock_destination_id" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                  {stocks.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
              <input type="number" name="quantite" min="1" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: 10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix Unitaire (F)</label>
              <input type="number" step="1" name="prix_unitaire" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: 4500" />
            </div>
          </div>

          <div className="pt-4">
            <SubmitButton label="Valider le mouvement" />
          </div>
        </form>
      </Modal>
    </>
  );
}
