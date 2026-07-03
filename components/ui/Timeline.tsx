import { ArrowRightLeft } from "lucide-react";
import Link from "next/link";

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'ACHAT' | 'VENTE' | 'TRANSFERT';
  href?: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <div className="text-sm text-slate-500 py-4 text-center">Aucune opération récente.</div>;
  }

  return (
    <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-slate-200">
      {items.map((item) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="absolute -left-2 mt-1">
            <div className={`h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
              item.type === 'ACHAT' ? 'bg-blue-500' :
              item.type === 'VENTE' ? 'bg-green-500' :
              'bg-purple-500'
            }`} />
          </div>
          
          <div className="ml-6 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                <span className="text-xs text-slate-500">{item.date}</span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{item.description}</p>
            </div>
            {item.href && (
              <Link href={item.href} className="text-xs font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap">
                Voir le détail
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
