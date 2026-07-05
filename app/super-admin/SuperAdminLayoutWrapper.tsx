"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Toaster } from "react-hot-toast";

export function SuperAdminLayoutWrapper({ 
  children, 
  SidebarComponent 
}: { 
  children: React.ReactNode;
  SidebarComponent: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex-none flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-30">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Portail Super Admin</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 rounded-md">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
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
            <div className="h-full relative" onClick={() => setIsSidebarOpen(false)}>
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
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
