"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ClientRowClient } from "./ClientRowClient";

interface ClientsTableClientProps {
  initialClients: any[];
  userRole?: string;
}

export function ClientsTableClient({ initialClients, userRole }: ClientsTableClientProps) {
  const [search, setSearch] = useState("");

  const filteredClients = initialClients.filter(c => {
    const cleanName = c.nom.replace("Client - ", "").toLowerCase();
    const phone = (c.telephone || "").toLowerCase();
    const address = (c.adresse || "").toLowerCase();
    const query = search.toLowerCase();
    
    return cleanName.includes(query) || phone.includes(query) || address.includes(query);
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Search Zone */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher un client (nom, téléphone, adresse)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date d'ajout</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Crédit</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Aucun client trouvé.</td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <ClientRowClient key={client.id} client={client} userRole={userRole} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
