"use client";

import { usePathname } from "next/navigation";
import { stopImpersonation } from "@/app/super-admin/etablissements/actions";
import { SessionData } from "@/lib/session";
import { Toaster } from "react-hot-toast";

export function ClientLayoutWrapper({ 
  children, 
  SidebarComponent,
  user
}: { 
  children: React.ReactNode;
  SidebarComponent: React.ReactNode;
  user: SessionData | null;
}) {
  const pathname = usePathname();
  const isFacture = pathname.startsWith('/facture');
  const isLandingPage = pathname === '/';
  
  const isPublicOrPrint = isFacture || isLandingPage;

  return (
    <div className={`flex flex-col ${isPublicOrPrint ? 'min-h-screen bg-white text-black' : 'h-screen overflow-hidden bg-slate-50 text-slate-900'}`}>
      {user?.impersonatedBySuperAdmin && (
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⚠️</span>
            <span className="font-semibold text-sm">Mode Super Admin : Vous naviguez en tant que {user.nom} (Patron)</span>
          </div>
          <button 
            onClick={() => stopImpersonation()}
            className="px-4 py-1.5 bg-white text-red-600 rounded-md text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
          >
            Quitter ce mode et retourner au Super Admin
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {!isPublicOrPrint && SidebarComponent}
        <main className={`flex-1 ${isPublicOrPrint ? '' : 'overflow-y-auto'}`}>
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
