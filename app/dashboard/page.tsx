import { prisma } from "@/lib/prisma";
import { ArrowRightLeft, FileWarning, ShoppingBag, PackageOpen, Store } from "lucide-react";
import Link from "next/link";
import { DonutChart } from "@/components/charts/DonutChart";
import { Timeline } from "@/components/ui/Timeline";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

// Couleurs de la maquette (Inspiration)
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userRole = session.role;

  if (userRole === "SUPER_ADMIN") redirect("/super-admin");

  // 1. Récupération des données
  const [produits, mouvements, stocksInternes] = await Promise.all([
    prisma.produit.findMany({ 
      where: { etablissement_id: session.etablissement_id! },
      include: { categorie: true } 
    }),
    prisma.mouvementStock.findMany({
      where: { etablissement_id: session.etablissement_id! },
      take: 20, // Plus de mouvements pour construire une timeline et des statistiques
      orderBy: { date_mouvement: 'desc' },
      include: { produit: { include: { categorie: true } }, stock_source: true, stock_destination: true, utilisateur: true }
    }),
    prisma.stock.findMany({ 
      where: { 
        etablissement_id: session.etablissement_id!,
        est_externe: false 
      } 
    })
  ]);

  // 2. Calculs complexes pour le Dashboard
  
  // A. Calcul de la valeur totale du stock (Approximation basée sur les mouvements et prix d'achat)
  // On considère que tout ce qui entre dans un stock interne (Achat/Transfert) ajoute de la valeur,
  // et tout ce qui sort (Vente/Transfert externe) en enlève.
  let totalValeur = 0;
  mouvements.forEach(mvt => {
    if (!mvt.stock_destination.est_externe) {
      totalValeur += mvt.quantite * mvt.produit.prix_achat_gros; // Entrée en stock
    }
    if (!mvt.stock_source.est_externe) {
      totalValeur -= mvt.quantite * mvt.produit.prix_achat_gros; // Sortie de stock
    }
  });
  // Empêcher d'avoir une valeur négative si l'historique est incomplet
  totalValeur = Math.max(0, totalValeur);

  // B. Répartition par catégorie (pour le DonutChart)
  // On se base sur le nombre de produits par catégorie pour la répartition
  const repartitionMap: Record<string, number> = {};
  produits.forEach(p => {
    repartitionMap[p.categorie.nom] = (repartitionMap[p.categorie.nom] || 0) + 1;
  });
  const repartitionData = Object.entries(repartitionMap).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  // C. Derniers produits ajoutés (Tableau)
  const derniersProduits = produits.slice(-4).reverse(); // Les 4 derniers créés

  // D. Timeline (Derniers mouvements)
  const timelineItems = mouvements.slice(0, 5).map(mvt => {
    const isAchat = mvt.type === 'ACHAT';
    const isVente = mvt.type === 'VENTE';
    
    return {
      id: mvt.id,
      date: new Date(mvt.date_mouvement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      title: isAchat ? 'Approvisionnement' : isVente ? 'Vente réalisée' : 'Transfert de stock',
      description: `${mvt.quantite}x ${mvt.produit.nom} (${isAchat ? 'Fournisseur' : 'Client'} : ${isAchat ? mvt.stock_source.nom : isVente ? mvt.stock_destination.nom : 'Interne'})`,
      type: mvt.type as 'ACHAT' | 'VENTE' | 'TRANSFERT',
      href: '/mouvements'
    };
  });

  // E. Activité Récente (Dernières ventes pour la liste de gauche)
  const dernieresVentes = mouvements
    .filter(m => m.type === 'VENTE')
    .slice(0, 3)
    .map(m => ({
      id: m.id,
      date: new Date(m.date_mouvement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      client: m.stock_destination.nom.replace('Client - ', ''),
      montant: m.quantite * m.prix_unitaire_applique,
      produit: m.produit.nom,
      vendeur: m.utilisateur.nom
    }));

  // F. Performance des Vendeurs (Top Sellers)
  const ventesParVendeur = new Map<string, { nom: string; total: number; ventes: number }>();
  mouvements.filter(m => m.type === 'VENTE').forEach(m => {
    const vendeurId = m.utilisateur.id;
    const montant = m.quantite * m.prix_unitaire_applique;
    if (!ventesParVendeur.has(vendeurId)) {
      ventesParVendeur.set(vendeurId, { nom: m.utilisateur.nom, total: 0, ventes: 0 });
    }
    const stats = ventesParVendeur.get(vendeurId)!;
    stats.total += montant;
    stats.ventes += 1;
  });
  const topVendeurs = Array.from(ventesParVendeur.values()).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER : Bienvenue & Alertes */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Widget Valeur Totale */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Bienvenue, {session.nom}</h1>
          
          {userRole === "PATRON" ? (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">VALEUR DU STOCK EST. (ACHAT)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(totalValeur)}
                </span>
                <span className="text-2xl font-bold text-slate-500">F</span>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-slate-500">
                Vous êtes connecté en tant que vendeur. Accédez à vos outils de vente depuis le menu latéral.
              </p>
            </div>
          )}
        </div>

        {/* Widget Alertes (Checklist) - Uniquement pour PATRON */}
        {userRole === "PATRON" && (
          <div className="lg:w-[400px] bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <ul className="space-y-4">
            <li className="flex items-start justify-between text-sm">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-indigo-500" />
                <span className="font-medium text-slate-700">{stocksInternes.length} entrepôt(s) actif(s)</span>
              </div>
              <Link href="/stocks" className="text-blue-600 hover:underline">Gérer</Link>
            </li>
            <li className="flex items-start justify-between text-sm">
              <div className="flex items-center gap-3">
                <PackageOpen className="h-5 w-5 text-orange-500" />
                <span className="font-medium text-slate-700">{produits.length} produits au catalogue</span>
              </div>
              <Link href="/produits" className="text-blue-600 hover:underline">Ajouter</Link>
            </li>
            <li className="flex items-start justify-between text-sm">
              <div className="flex items-center gap-3">
                <FileWarning className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-slate-700">Mouvements synchronisés</span>
              </div>
              <span className="text-slate-400 text-xs">À jour</span>
            </li>
          </ul>
        </div>
        )}
      </div>

      {/* ROW 1: Répartition & Contrats (Produits) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget Répartition */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Répartition Catalogue</h2>
          <div className="flex-1 flex flex-col justify-center">
            {repartitionData.length > 0 ? (
              <>
                <DonutChart data={repartitionData} totalValue={produits.length} />
                <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center">
                  {repartitionData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400">Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Widget Produits */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Derniers produits ajoutés</h2>
            <Link href="/produits" className="text-sm text-blue-600 hover:underline">Voir le catalogue</Link>
          </div>
          <div className="flex-1 p-0">
            <table className="min-w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">Catégorie</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">Prix Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {derniersProduits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">Aucun produit au catalogue.</td>
                  </tr>
                ) : (
                  derniersProduits.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{prod.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                          {prod.categorie.nom}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                        {prod.prix_vente_detail} F
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROW 2: RDV (Ventes) & Opérations (Mouvements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget Dernières Ventes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Dernières Ventes</h2>
            <Link href="/mouvements" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Nouveau
            </Link>
          </div>
          
          <div className="space-y-3">
            {dernieresVentes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Aucune vente récente.</p>
            ) : (
              dernieresVentes.map((v, i) => (
                <div key={i} className="relative pl-6 py-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl"></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500">{v.date}</span>
                    <span className="text-xs font-bold text-green-600">+{v.montant.toFixed(2)} F</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">Client : {v.client}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {v.produit}
                    </div>
                    <div className="font-medium bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                      Par: {v.vendeur}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget Top Vendeurs (Performance) */}
        {userRole === "PATRON" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Top Vendeurs</h2>
              <Link href="/employes" className="text-sm text-blue-600 hover:underline">Voir l'équipe</Link>
            </div>
            
            <div className="space-y-4">
              {topVendeurs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Aucune vente enregistrée.</p>
              ) : (
                topVendeurs.map((v, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {v.nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{v.nom}</p>
                        <p className="text-xs text-slate-500">{v.ventes} vente{v.ventes > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{v.total.toFixed(2)} F</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Widget Dernières Opérations (Timeline) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Historique des opérations</h2>
          </div>
          <div className="flex-1 p-6">
            <Timeline items={timelineItems} />
          </div>
          <div className="p-4 border-t border-slate-50 text-center bg-slate-50/50">
            <Link href="/mouvements" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              Voir toutes mes opérations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
