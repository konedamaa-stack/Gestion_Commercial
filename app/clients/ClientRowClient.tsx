"use client";

import { useState } from "react";
import { Edit2, Trash2, MapPin, Users, Eye, Printer, Calendar, DollarSign, Package } from "lucide-react";
import { Modal } from "@/components/Modal";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteClient, updateClient } from "./actions";
import { formatNumber } from "@/lib/format";

export function ClientRowClient({ 
  client,
  userRole 
}: { 
  client: any,
  userRole?: string
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const cleanName = client.nom.replace("Client - ", "");

  const totalCredit = client.commandes?.reduce(
    (sum: number, cmd: any) => sum + (cmd.montant_total - cmd.montant_paye), 
    0
  ) || 0;

  const totalAchats = client.commandes?.reduce(
    (sum: number, cmd: any) => sum + cmd.montant_total, 
    0
  ) || 0;

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{cleanName}</div>
              <div className="flex items-center gap-3 mt-0.5">
                {client.telephone && (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>📞</span>
                    {client.telephone}
                  </div>
                )}
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {client.adresse || "Aucun lieu"}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {new Date(client.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {totalCredit > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
              {formatNumber(totalCredit)} F
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
              Aucun
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsDetailsModalOpen(true)}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              title="Voir la fiche client (Historique & Crédits)"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
            >
              <Edit2 className="h-4 w-4" />
            </button>
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
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Client">
        <form 
          action={async (formData) => {
            await updateClient(formData);
            setIsEditModalOpen(false);
          }} 
          className="space-y-4"
        >
          <input type="hidden" name="id" value={client.id} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du client</label>
            <input type="text" name="nom" defaultValue={cleanName} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone (Optionnel)</label>
            <input type="tel" name="telephone" defaultValue={client.telephone || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lieu (Optionnel)</label>
            <input type="text" name="adresse" defaultValue={client.adresse || ""} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
        title="Supprimer le client"
        description={`Êtes-vous sûr de vouloir supprimer le client "${cleanName}" ? Cette action est irréversible.`}
        onConfirm={async () => {
          await deleteClient(client.id);
          setIsDeleteModalOpen(false);
        }}
      />

      {/* Details / History Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title={`Fiche Client : ${cleanName}`}
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Achats</span>
              <span className="text-lg font-extrabold text-slate-900">{formatNumber(totalAchats)} F</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Payé</span>
              <span className="text-lg font-extrabold text-green-600">{formatNumber(totalAchats - totalCredit)} F</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Crédit Restant</span>
              <span className={`text-lg font-extrabold ${totalCredit > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                {formatNumber(totalCredit)} F
              </span>
            </div>
          </div>

          {/* Info contact */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Téléphone :</span>
              {client.telephone || "Non renseigné"}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Adresse / Lieu :</span>
              {client.adresse || "Non renseigné"}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Membre depuis le :</span>
              {new Date(client.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Historique des achats (Mouvements) */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-600" />
              Historique des Factures & Achats
            </h3>
            
            {!client.commandes || client.commandes.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-6 text-center rounded-xl border border-dashed border-slate-200">
                Aucune transaction enregistrée pour ce client.
              </p>
            ) : (
              <div className="space-y-3">
                {client.commandes.map((cmd: any) => {
                  const resteAPayer = cmd.montant_total - cmd.montant_paye;
                  return (
                    <div key={cmd.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {cmd.numero_facture}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(cmd.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`/facture/${cmd.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 hover:border-blue-600 rounded-md transition-all duration-200 shadow-sm"
                          >
                            <Printer className="h-3 w-3" />
                            Facture
                          </a>
                        </div>
                      </div>

                      {/* Liste des produits achetés */}
                      <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Détail des articles</span>
                        {cmd.lignes.map((ligne: any) => (
                          <div key={ligne.id} className="text-[11px] text-slate-600 flex justify-between gap-4">
                            <span className="font-medium">{ligne.produit.nom}</span>
                            <span className="text-slate-500 font-mono">
                              {ligne.quantite} x {formatNumber(ligne.prix_unitaire)} F = {formatNumber(ligne.quantite * ligne.prix_unitaire)} F
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totaux de la commande */}
                      <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-medium pt-1">
                        <div className="flex gap-4">
                          <div>
                            <span className="text-slate-400">Total : </span>
                            <span className="font-bold text-slate-800">{formatNumber(cmd.montant_total)} F</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Payé : </span>
                            <span className="font-bold text-green-600">{formatNumber(cmd.montant_paye)} F</span>
                          </div>
                        </div>
                        {resteAPayer > 0 ? (
                          <div className="bg-orange-50 px-2 py-0.5 rounded border border-orange-100 text-[10px]">
                            <span className="text-orange-700 font-bold">Reste : {formatNumber(resteAPayer)} F</span>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                            <span className="text-emerald-700 font-bold">Soldé</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
