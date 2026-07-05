"use client";

import { Printer, Receipt } from "lucide-react";
import Link from "next/link";

export default function ClientPrintButton({ factureId }: { factureId?: string }) {
  return (
    <div className="flex gap-2">
      {factureId && (
        <Link 
          href={`/facture/${factureId}/ticket`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm shadow-sm"
        >
          <Receipt className="w-4 h-4" />
          Format Ticket (80mm)
        </Link>
      )}
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm"
      >
        <Printer className="w-4 h-4" />
        Imprimer (A4)
      </button>
    </div>
  );
}
