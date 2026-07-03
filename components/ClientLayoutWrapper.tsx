"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { stopImpersonation } from "@/app/super-admin/etablissements/actions";
import { SessionData } from "@/lib/session";
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className="flex flex-1 overflow-hidden relative">
        {!isPublicOrPrint && (
          <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-30 absolute top-0 left-0 right-0">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">GESTION PRO</h1>
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 rounded-md">
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar Wrapper */}
            <div className={`
              fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <div className="h-full relative">
                {/* Close Button on Mobile */}
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden absolute top-4 right-4 p-2 bg-slate-800 text-white rounded-md z-50"
                >
                  <X className="h-5 w-5" />
                </button>
                {SidebarComponent}
              </div>
            </div>
          </>
        )}
        <main className={`flex-1 ${isPublicOrPrint ? '' : 'overflow-y-auto mt-[72px] md:mt-0'}`}>
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
