"use client";

import { useEffect } from "react";

export function FacturePrintClient() {
  useEffect(() => {
    // Automatically open print dialog on mount
    window.print();
  }, []);

  return (
    <div className="fixed top-4 right-4 print:hidden">
      <button 
        onClick={() => window.print()} 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-500 transition-colors flex items-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimer
      </button>
    </div>
  );
}
