"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type DonutChartProps = {
  data: { name: string; value: number; color: string }[];
  totalValue: number;
};

export function DonutChart({ data, totalValue }: DonutChartProps) {
  // Optionnel : s'il n'y a pas de données, on affiche un donut vide
  const displayData = data.length > 0 ? data : [{ name: "Aucune donnée", value: 1, color: "#e2e8f0" }];

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Centre du Donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-slate-900">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalValue)}
        </span>
        <span className="text-xs text-slate-500">Valeur Totale</span>
      </div>
    </div>
  );
}
