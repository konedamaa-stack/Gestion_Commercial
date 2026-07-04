"use client";

import { useState, useEffect } from "react";
import { getUtilisateurs, deleteUtilisateur } from "./actions";
import { Users, Trash2, Search, Building2, User, UserCog } from "lucide-react";
import toast from "react-hot-toast";

type UtilisateurType = {
  id: string;
  nom: string;
  email: string;
  role: string;
  est_verifie: boolean;
  etablissement: { nom: string } | null;
  createdAt: Date;
};

export function UtilisateursClient() {
  const [users, setUsers] = useState<UtilisateurType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUtilisateurs();
      setUsers(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${name} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deleteUtilisateur(id);
      toast.success("Utilisateur supprimé avec succès");
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.nom.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.etablissement?.nom.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "SUPER_ADMIN": return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full flex items-center gap-1 w-fit"><UserCog className="w-3 h-3"/> Super Admin</span>;
      case "PATRON": return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 w-fit"><User className="w-3 h-3"/> Patron</span>;
      default: return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center gap-1 w-fit"><User className="w-3 h-3"/> Vendeur</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur (nom, email, entreprise)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Établissement</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <p>Chargement des utilisateurs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                          {user.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{user.nom}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {user.etablissement ? (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {user.etablissement.nom}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Aucun</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        user.est_verifie 
                          ? "bg-green-100 text-green-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {user.est_verifie ? "Actif" : "En attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "SUPER_ADMIN" && (
                        <button
                          onClick={() => handleDelete(user.id, user.nom)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-600">Aucun utilisateur trouvé</p>
                    <p className="text-sm">Modifiez vos critères de recherche.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
