"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Truck, 
  Contact, 
  Warehouse, 
  ArrowRightLeft,
  Receipt,
  Wallet,
  HandCoins,
  BookOpen
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Guide de démarrage", href: "/guide", icon: BookOpen },
  { name: "Ventes & Factures", href: "/ventes", icon: Receipt },
  { name: "Mouvements", href: "/mouvements", icon: ArrowRightLeft },
  { name: "Inventaire & Rapports", href: "/dashboard/inventaire", icon: LayoutDashboard },
  { name: "Magasins", href: "/stocks", icon: Warehouse },
  { name: "Produits", href: "/produits", icon: Package },
  { name: "Crédits", href: "/credits", icon: HandCoins },
  { name: "Dépenses", href: "/depenses", icon: Wallet },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Fournisseurs", href: "/fournisseurs", icon: Truck },
  { name: "Utilisateurs (Admin)", href: "/employes", icon: Contact },
];

import { LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/app/login/logout";
import { SessionData } from "@/lib/session";

export function Sidebar({ user }: { user: SessionData | null }) {
  const pathname = usePathname();

  if (!user) return null; // Ne pas afficher de sidebar si non connecté (par sécurité)
  if (user.role === "SUPER_ADMIN") return null; // Le Super Admin a sa propre sidebar dans app/super-admin/layout.tsx

  return (
    <div className="flex h-full w-80 flex-col bg-slate-950 text-white shadow-2xl border-r border-slate-800/50 relative z-20">
      <div className="flex h-16 items-center justify-center border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
          GESTION PRO
        </h1>
      </div>
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          if (user.role === "VENDEUR" && ["/stocks", "/fournisseurs", "/employes", "/dashboard/inventaire"].includes(item.href)) {
            return null;
          }

          if (item.href === "/guide") {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 relative overflow-hidden bg-emerald-600 text-white shadow-md hover:bg-emerald-500 hover:shadow-emerald-500/20 border border-emerald-500/30 mb-4 mt-2"
              >
                <span className="mr-2 text-base relative z-10">🚀</span>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100 transition-opacity duration-300" />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 relative z-10 ${
                  isActive ? "text-white scale-110" : "text-slate-500 group-hover:text-indigo-400 group-hover:scale-110"
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800/50 p-4 bg-slate-950 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-inner border border-indigo-400/20 text-white">
            {user.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{user.nom}</p>
            <p className="text-xs text-indigo-400 truncate uppercase tracking-wider font-semibold">{user.role}</p>
          </div>
        </div>
        
        <Link href="/profil" className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-700">
          <Settings className="h-4 w-4" />
          Mon Profil
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all duration-200 border border-transparent hover:border-red-900/50 group">
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}
