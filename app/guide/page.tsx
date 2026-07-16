import { 
  BookOpen, 
  Warehouse, 
  Tag, 
  Package, 
  Truck, 
  ArrowRightLeft, 
  Users, 
  Receipt, 
  HandCoins 
} from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function GuidePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const steps = [
    {
      num: "1",
      title: "Créer un Magasin",
      desc: "Définissez vos entrepôts principaux ou vos boutiques de vente. Vous devez en avoir au moins un avant de pouvoir gérer des stocks.",
      icon: Warehouse,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      iconColor: "text-blue-600"
    },
    {
      num: "2",
      title: "Créer une Catégorie",
      desc: "Créez vos catégories de produits (ex: Boissons, Épicerie). Chaque produit doit obligatoirement appartenir à une catégorie.",
      icon: Tag,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      iconColor: "text-purple-600"
    },
    {
      num: "3",
      title: "Ajouter des Produits",
      desc: "Enregistrez vos produits avec leur nom, code-barres et prix (Achat, Gros et Détail). Par défaut, leur stock initial est à 0.",
      icon: Package,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      num: "4",
      title: "Ajouter des Fournisseurs",
      desc: "Créez la liste de vos fournisseurs. Ils sont indispensables pour tracer la provenance lors de l'approvisionnement des stocks.",
      icon: Truck,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      iconColor: "text-amber-600"
    },
    {
      num: "5",
      title: "Approvisionner les Stocks",
      desc: "Faites une Entrée de stock pour alimenter vos magasins. C'est cette action qui augmente le stock disponible de vos produits.",
      icon: ArrowRightLeft,
      color: "bg-sky-50 text-sky-600 border-sky-100",
      iconColor: "text-sky-600"
    },
    {
      num: "6",
      title: "Enregistrer vos Clients",
      desc: "Ajoutez vos clients réguliers pour suivre leurs achats ou leurs crédits. Utilisez 'Client de passage' pour les ventes rapides.",
      icon: Users,
      color: "bg-teal-50 text-teal-600 border-teal-100",
      iconColor: "text-teal-600"
    },
    {
      num: "7",
      title: "Vendre & Transférer",
      desc: "Utilisez la caisse (POS) pour enregistrer vos ventes. Seuls les produits ayant du stock (étape 5) y seront visibles.",
      icon: Receipt,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      num: "8",
      title: "Suivre les Crédits & Dépenses",
      desc: "Suivez les règlements dans l'onglet Crédits et enregistrez vos frais (loyer, salaires) pour calculer votre bénéfice net réel.",
      icon: HandCoins,
      color: "bg-orange-50 text-orange-600 border-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Guide d'Utilisation & Démarrage
        </h1>
        <p className="mt-2 text-slate-500 text-lg">
          Pour exploiter pleinement la plateforme, configurez vos outils dans l'ordre logique ci-dessous.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg border ${step.color} shrink-0`}>
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${step.iconColor}`} />
                  {step.title}
                </h3>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <h3 className="font-bold text-slate-800 mb-2">💡 Conseil d'utilisation</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Si vous venez de réinitialiser vos données ou de supprimer un établissement, assurez-vous de vous déconnecter et de vous reconnecter. Cela garantit que votre navigateur utilise la session avec le nouvel identifiant de votre boutique.
        </p>
      </div>
    </div>
  );
}
