"use client";

import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, UserPlus, CreditCard, Banknote, X } from "lucide-react";
import { createCommande, LignePanier } from "./actions";
import { toast } from "react-hot-toast";
import { formatNumber } from "@/lib/format";

export function VentesClient({ produits, stocks, clients, userRole, inventaire }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [typeVente, setTypeVente] = useState("DETAIL");
  const [client, setClient] = useState("");
  const [stockSource, setStockSource] = useState(stocks.length > 0 ? stocks[0].id : "");
  const [stockDestination, setStockDestination] = useState("");
  
  const [panier, setPanier] = useState<any[]>([]);
  const [montantPaye, setMontantPaye] = useState(0);
  const [loading, setLoading] = useState(false);

  const ajouterAuPanier = (produitId: string) => {
    if (!produitId) return;
    const prod = produits.find((p: any) => p.id === produitId);
    if (!prod) return;

    const existant = panier.find(p => p.id === produitId);
    if (existant) {
      setPanier(panier.map(p => p.id === produitId ? { ...p, quantite: p.quantite + 1 } : p));
    } else {
      setPanier([...panier, { ...prod, quantite: 1 }]);
    }
  };

  const updateQuantite = (id: string, qte: number) => {
    if (qte < 1) return;
    setPanier(panier.map(p => p.id === id ? { ...p, quantite: qte } : p));
  };

  const updatePrixVenteLigne = (id: string, prix: number) => {
    if (prix < 0) return;
    setPanier(panier.map(p => p.id === id ? { ...p, prix_vente_personnalise: prix } : p));
  };

  const getPrixUnitaire = (p: any) => {
    if (p.prix_vente_personnalise !== undefined) return p.prix_vente_personnalise;
    return typeVente === "GROS" ? p.prix_vente_gros : p.prix_vente_detail;
  };

  const getPrixAchatUnitaire = (p: any) => {
    return typeVente === "GROS" ? p.prix_achat_gros : p.prix_achat_detail;
  };

  const supprimerDuPanier = (id: string) => {
    setPanier(panier.filter(p => p.id !== id));
  };

  const montantTotal = panier.reduce((acc, p) => acc + (getPrixUnitaire(p) * p.quantite), 0);

  const validerVente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (panier.length === 0) return toast.error("Le panier est vide");
    if (typeVente === "TRANSFERT_INTERNE" && !stockDestination) return toast.error("Veuillez sélectionner le stock de destination");
    
    setLoading(true);
    try {
      const lignes: LignePanier[] = panier.map(p => ({
        produit_id: p.id,
        quantite: p.quantite,
        prix_unitaire: getPrixUnitaire(p),
        prix_achat_unitaire: getPrixAchatUnitaire(p),
      }));

      const res = await createCommande({
        type_vente: typeVente,
        client_id: client || undefined,
        stock_source_id: stockSource,
        stock_destination_id: typeVente === "TRANSFERT_INTERNE" ? stockDestination : undefined,
        montant_total: montantTotal,
        montant_paye: typeVente === "TRANSFERT_INTERNE" ? montantTotal : montantPaye,
        lignes
      });

      if (res.success) {
        toast.success(`Facture ${res.numero_facture} générée !`);
        setIsOpen(false);
        setPanier([]);
        setMontantPaye(0);
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la vente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full sm:w-auto">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Nouvelle Vente
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Point de Vente (POS)
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
              
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type d'opération</label>
                    <select 
                      value={typeVente}
                      onChange={(e) => setTypeVente(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DETAIL">Vente au Détail</option>
                      <option value="GROS">Vente en Gros</option>
                      {stocks.length > 1 && <option value="TRANSFERT_INTERNE">Transfert entre Boutiques</option>}
                    </select>
                  </div>
                  
                  {typeVente === "TRANSFERT_INTERNE" ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Magasin de Destination</label>
                      <select 
                        value={stockDestination}
                        onChange={(e) => setStockDestination(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une boutique...</option>
                        {stocks.filter((s:any) => s.id !== stockSource).map((s:any) => (
                          <option key={s.id} value={s.id}>{s.nom}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Client (Optionnel)</label>
                      <select 
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Client de passage</option>
                        {clients.map((c:any) => (
                          <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Depuis le magasin</label>
                    <select 
                      value={stockSource}
                      onChange={(e) => setStockSource(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {stocks.map((s:any) => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Ajouter un produit</label>
                  <select 
                    onChange={(e) => ajouterAuPanier(e.target.value)}
                    value=""
                    className="w-full px-3 py-3 bg-white border-2 border-blue-200 rounded-xl outline-none focus:border-blue-500 text-blue-900 shadow-sm"
                  >
                    <option value="" disabled>Rechercher ou scanner un produit...</option>
                    {produits.map((p:any) => {
                      const stockDispo = (inventaire && inventaire[stockSource] && inventaire[stockSource][p.id]) || 0;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.nom} - {typeVente === "GROS" ? formatNumber(p.prix_vente_gros) : formatNumber(p.prix_vente_detail)} F (Stock dispo: {stockDispo})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 border-b border-slate-200 font-semibold text-slate-700">
                  Panier ({panier.length} articles)
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {panier.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                      Panier vide
                    </div>
                  ) : (
                    panier.map((p, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-between gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.nom} className="w-12 h-12 rounded object-cover border border-slate-200 bg-slate-50 flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-[10px] flex-shrink-0">IMG</div>
                        )}
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">{p.nom}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <input 
                              type="number" 
                              min="1" 
                              value={p.quantite} 
                              onChange={(e) => updateQuantite(p.id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm" 
                            />
                            <div className="text-xs text-slate-500 mt-1">
                              {formatNumber(getPrixUnitaire(p))} F x {p.quantite}
                            </div>
                            <input 
                              type="number" 
                              min="0"
                              value={getPrixUnitaire(p)} 
                              onChange={(e) => updatePrixVenteLigne(p.id, parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-right text-sm" 
                            />
                            <span className="text-sm font-semibold text-blue-700">= {formatNumber(getPrixUnitaire(p) * p.quantite)} F</span>
                          </div>
                        </div>
                        <button onClick={() => supprimerDuPanier(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="bg-white border-t border-slate-200 p-4 space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-600 font-medium">Total de la commande</span>
                    <span className="text-3xl font-black text-slate-900">{formatNumber(montantTotal)} F</span>
                  </div>
                  
                  {typeVente !== "TRANSFERT_INTERNE" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Montant encaissé (F)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={montantPaye}
                        onChange={(e) => setMontantPaye(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-3 border-2 border-green-200 bg-green-50 rounded-xl focus:ring-0 focus:border-green-500 outline-none text-xl font-bold text-green-900 text-right"
                        placeholder="Ex: 5000"
                      />
                      {montantPaye < montantTotal && montantPaye > 0 && (
                        <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <p className="text-orange-600 text-sm font-medium">Reste à payer (Crédit) : {formatNumber(montantTotal - montantPaye)} F</p>
                        </div>
                      )}
                      {montantPaye > montantTotal && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-blue-600 text-sm font-medium">Monnaie à rendre : {formatNumber(montantPaye - montantTotal)} F</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={validerVente}
                    disabled={loading || panier.length === 0}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                  >
                    {loading ? "Génération en cours..." : "Valider la facture"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
