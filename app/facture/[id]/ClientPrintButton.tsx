"use client";

import { Printer } from "lucide-react";

export default function ClientPrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm"
    >
      <Printer className="w-4 h-4" />
      Imprimer
    </button>
  );
}
