"use client";

import { useState } from "react";
import { Trash2, ArrowRightLeft } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteMouvement } from "./actions";

export function MouvementRowClient({ 
  mvt,
  userRole 
}: { 
  mvt: any,
  userRole?: string
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              mvt.type === 'ACHAT' ? 'bg-blue-100 text-blue-600' : 
              mvt.type === 'VENTE' ? 'bg-green-100 text-green-600' : 
              'bg-slate-100 text-slate-600'
            }`}>
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{mvt.type}</div>
              <div className="text-xs text-slate-500">{new Date(mvt.date_mouvement).toLocaleDateString('fr-FR', { hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-slate-900">{mvt.produit.nom}</div>
          <div className="text-xs text-slate-500">Par: {mvt.utilisateur.nom}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
          <span className="font-medium text-slate-900">
            {mvt.stock_source ? mvt.stock_source.nom.replace('Fournisseur - ', '').replace('Client - ', '') : 'Externe (Fournisseur)'}
          </span>
          <span className="mx-2 text-slate-400">→</span>
          <span className="font-medium text-slate-900">
            {mvt.stock_destination ? mvt.stock_destination.nom.replace('Fournisseur - ', '').replace('Client - ', '') : 'Externe (Client)'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
          {mvt.quantite}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="text-sm font-bold text-slate-900">{(mvt.quantite * mvt.prix_unitaire_applique).toFixed(2)} F</div>
          <div className="text-xs text-slate-500">{mvt.prix_unitaire_applique} F / u</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-2">
            {mvt.type === 'VENTE' && (
              <a 
                href={`/facture/${mvt.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                title="Imprimer le reçu"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </a>
            )}
            {userRole !== "VENDEUR" && (
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Supprimer ce mouvement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Delete Modal */}
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer l'historique"
        description={`Attention : En supprimant ce mouvement de ${mvt.quantite} x ${mvt.produit.nom}, vous faussez potentiellement l'historique comptable. Continuer ?`}
        onConfirm={async () => {
          await deleteMouvement(mvt.id);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
}
