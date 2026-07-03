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
  ArrowRightLeft 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mouvements", href: "/mouvements", icon: ArrowRightLeft },
  { name: "Stocks", href: "/stocks", icon: Warehouse },
  { name: "Produits", href: "/produits", icon: Package },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Fournisseurs", href: "/fournisseurs", icon: Truck },
  { name: "Utilisateurs (Admin)", href: "/employes", icon: Contact },
];

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/logout";
import { SessionData } from "@/lib/session";

export function Sidebar({ user }: { user: SessionData | null }) {
  const pathname = usePathname();

  if (!user) return null; // Ne pas afficher de sidebar si non connecté (par sécurité)
  if (user.role === "SUPER_ADMIN") return null; // Le Super Admin a sa propre sidebar dans app/super-admin/layout.tsx

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-wider">
          GESTION PRO
        </h1>
      </div>
      <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
        {navigation.map((item) => {
          // Si VENDEUR, on cache Stocks, Fournisseurs, Employés
          if (user.role === "VENDEUR" && ["/stocks", "/fournisseurs", "/employes"].includes(item.href)) {
            return null;
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4 bg-slate-950/50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner">
            {user.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user.nom}</p>
            <p className="text-xs text-slate-500 truncate">{user.role}</p>
          </div>
        </div>
        
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}
