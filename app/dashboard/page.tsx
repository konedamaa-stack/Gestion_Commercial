import { prisma } from "@/lib/prisma";
import { ArrowRightLeft, FileWarning, ShoppingBag, PackageOpen, Store, TrendingUp, Wallet, HandCoins } from "lucide-react";
import Link from "next/link";
import { DonutChart } from "@/components/charts/DonutChart";
import { Timeline } from "@/components/ui/Timeline";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatNumber } from "@/lib/format";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userRole = session.role;

  if (userRole === "SUPER_ADMIN") redirect("/super-admin");

  // Récupérer les données globales
  const [produits, mouvements, stocksInternes, commandes, depenses] = await Promise.all([
    prisma.produit.findMany({ 
      where: { etablissement_id: session.etablissement_id! },
      include: { categorie: true } 
    }),
    prisma.mouvementStock.findMany({
      where: { 
        etablissement_id: session.etablissement_id!,
        ...(userRole === "VENDEUR" ? { utilisateur_id: session.userId } : {})
      },
      take: 20,
      orderBy: { date_mouvement: 'desc' },
      include: { produit: { include: { categorie: true } }, stock_source: true, stock_destination: true, utilisateur: true }
    }),
    prisma.stock.findMany({ 
      where: { 
        etablissement_id: session.etablissement_id!,
        est_externe: false 
      } 
    }),
    prisma.commande.findMany({
      where: { 
        etablissement_id: session.etablissement_id!,
        ...(userRole === "VENDEUR" ? { vendeur_id: session.userId } : {})
      },
      include: { lignes: true, client: true, vendeur: true }
    }),
    prisma.depense.findMany({
      where: { 
        etablissement_id: session.etablissement_id!,
        ...(userRole === "VENDEUR" ? { enregistre_par_id: session.userId } : {})
      }
    })
  ]);

  // A. Valeur du Stock
  let totalValeur = 0;
  mouvements.forEach(mvt => {
    if (mvt.stock_destination && !mvt.stock_destination.est_externe) {
      totalValeur += mvt.quantite * mvt.produit.prix_achat_gros;
    }
    if (mvt.stock_source && !mvt.stock_source.est_externe) {
      totalValeur -= mvt.quantite * mvt.produit.prix_achat_gros;
    }
  });
  totalValeur = Math.max(0, totalValeur);

  // B. Statistiques de Vente et Bénéfice
  let totalVentes = 0;
  let totalCoutsAchatsVendus = 0;
  let totalCredits = 0;

  commandes.forEach(cmd => {
    // Si ce n'est pas un transfert interne, c'est une vraie vente
    if (cmd.type_vente !== "TRANSFERT_INTERNE") {
      totalVentes += cmd.montant_total;
      cmd.lignes.forEach(ligne => {
        totalCoutsAchatsVendus += ligne.quantite * ligne.prix_achat_unitaire;
      });
      totalCredits += (cmd.montant_total - cmd.montant_paye);
    }
  });

  const totalDepenses = depenses.reduce((acc, d) => acc + d.montant, 0);
  const beneficeNet = totalVentes - totalCoutsAchatsVendus - totalDepenses;

  // C. Répartition Catalogue
  const repartitionMap: Record<string, number> = {};
  produits.forEach(p => {
    repartitionMap[p.categorie.nom] = (repartitionMap[p.categorie.nom] || 0) + 1;
  });
  const repartitionData = Object.entries(repartitionMap).map(([name, value], index) => ({
    name, value, color: COLORS[index % COLORS.length]
  }));

  const derniersProduits = produits.slice(-4).reverse();

  // D. Timeline des Mouvements
  const timelineItems = mouvements.slice(0, 5).map(mvt => {
    const isAchat = mvt.type === 'ACHAT';
    const isVente = mvt.type === 'VENTE';
    return {
      id: mvt.id,
      date: new Date(mvt.date_mouvement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      title: isAchat ? 'Approvisionnement' : isVente ? 'Sortie Stock (Vente)' : 'Transfert',
      description: `${mvt.quantite}x ${mvt.produit.nom}`,
      type: mvt.type as 'ACHAT' | 'VENTE' | 'TRANSFERT',
      href: '/mouvements'
    };
  });

  const dernieresVentes = commandes
    .filter(c => c.type_vente !== "TRANSFERT_INTERNE")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      date: new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      client: c.client?.nom || "Client de passage",
      montant: c.montant_total,
      articles: c.lignes.length,
      vendeur: c.vendeur.nom
    }));

  const ventesParVendeur = new Map<string, { nom: string; total: number; ventes: number }>();
  commandes.filter(c => c.type_vente !== "TRANSFERT_INTERNE").forEach(c => {
    const vendeurId = c.vendeur.id;
    if (!ventesParVendeur.has(vendeurId)) {
      ventesParVendeur.set(vendeurId, { nom: c.vendeur.nom, total: 0, ventes: 0 });
    }
    const stats = ventesParVendeur.get(vendeurId)!;
    stats.total += c.montant_total;
    stats.ventes += 1;
  });
  const topVendeurs = Array.from(ventesParVendeur.values()).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>
          
          {userRole === "PATRON" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chiffre d'Affaires</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{formatNumber(totalVentes)}</span>
                  <span className="font-bold text-slate-500">F</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Bénéfice Net</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${beneficeNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatNumber(beneficeNet)}</span>
                  <span className="font-bold text-slate-500">F</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-red-600 flex items-center gap-1"><Wallet className="w-3 h-3"/> Dépenses</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{formatNumber(totalDepenses)}</span>
                  <span className="font-bold text-slate-500">F</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-orange-600 flex items-center gap-1"><HandCoins className="w-3 h-3"/> Crédits à Recouvrer</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{formatNumber(totalCredits)}</span>
                  <span className="font-bold text-slate-500">F</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-slate-500">Accédez à vos outils de vente depuis le menu latéral.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Dernières Ventes Réalisées</h2>
            <Link href="/ventes" className="text-sm text-blue-600 hover:underline">Point de Vente</Link>
          </div>
          <div className="flex-1 p-0">
            <table className="min-w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">Articles</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dernieresVentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Aucune vente enregistrée.</td>
                  </tr>
                ) : (
                  dernieresVentes.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{v.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{v.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{v.articles}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                        {formatNumber(v.montant)} F
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userRole === "PATRON" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Top Vendeurs</h2>
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
                        <p className="text-xs text-slate-500">{v.ventes} facture(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatNumber(v.total)} F</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Historique des mouvements de stock</h2>
          </div>
          <div className="flex-1 p-6">
            <Timeline items={timelineItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
