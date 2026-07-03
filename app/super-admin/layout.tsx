import Link from "next/link";
import { Building2, Users, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/login/logout";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const navigation = [
    { name: "Tableau de bord", href: "/super-admin", icon: LayoutDashboard },
    { name: "Établissements", href: "/super-admin/etablissements", icon: Building2 },
    { name: "Utilisateurs globaux", href: "/super-admin/utilisateurs", icon: Users },
    { name: "Paramètres", href: "/super-admin/parametres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Super Admin */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Portail Super Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5 text-slate-400" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header mobile (si nécessaire) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 md:hidden">
          <span className="font-bold text-slate-800">Portail Super Admin</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
