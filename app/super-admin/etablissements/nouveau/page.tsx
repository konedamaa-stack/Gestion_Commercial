"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEtablissement } from "./actions";
import { Building2, User, Mail, Lock } from "lucide-react";

export default function NouvelEtablissementPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await createEtablissement(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/super-admin/etablissements");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nouvel Établissement</h1>
        <p className="text-slate-500">Créez une nouvelle boutique et générez son compte administrateur (Patron).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form action={handleSubmit}>
          <div className="p-6 space-y-8">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Section Établissement */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Informations de la boutique
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'établissement *</label>
                <input 
                  type="text" 
                  name="nom_etablissement" 
                  required
                  placeholder="Ex: Super U Cocody"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan SaaS</label>
                <select name="plan" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="Essai Gratuit 14j">Essai Gratuit 14j</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Section Compte Patron */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="h-5 w-5 text-indigo-500" />
                Compte d'accès principal (PATRON)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom du responsable *</label>
                  <input 
                    type="text" 
                    name="nom_patron" 
                    required
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email de connexion *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      name="email_patron" 
                      required
                      placeholder="patron@boutique.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe par défaut *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="password" 
                      name="password_patron" 
                      required
                      minLength={6}
                      placeholder="Minimum 6 caractères"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Créer l'établissement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
