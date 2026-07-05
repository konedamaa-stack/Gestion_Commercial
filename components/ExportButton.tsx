"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns: { header: string; key: string }[];
}

export function ExportButton({ data, filename, columns }: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Créer l'en-tête CSV
    const headerRow = columns.map(col => `"${col.header}"`).join(",");
    
    // Créer les lignes de données
    const rows = data.map(row => {
      return columns.map(col => {
        let value = row;
        const keys = col.key.split('.');
        for (const k of keys) {
          if (value === undefined || value === null) break;
          value = value[k];
        }
        // Gérer les guillemets et sauts de ligne pour le CSV
        const strValue = String(value ?? "").replace(/"/g, '""');
        return `"${strValue}"`;
      }).join(",");
    });

    const csvContent = [headerRow, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // uFEFF = BOM pour Excel
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
    >
      <Download className="w-4 h-4" />
      Exporter Excel
    </button>
  );
}
