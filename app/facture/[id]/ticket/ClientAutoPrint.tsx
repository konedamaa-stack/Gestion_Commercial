"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export default function ClientAutoPrint() {
  useEffect(() => {
    // Lancer l'impression automatiquement après un court délai
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="print:hidden absolute top-4 right-4">
      <button 
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
      >
        <Printer className="w-4 h-4" />
        Imprimer le Ticket
      </button>
    </div>
  );
}
