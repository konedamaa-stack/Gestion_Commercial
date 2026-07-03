"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { changePasswordAction } from "./actions";
import toast from "react-hot-toast";

export function ProfilClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await changePasswordAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Mot de passe mis à jour avec succès");
      // Reset the form
      const form = document.getElementById('password-form') as HTMLFormElement;
      if (form) form.reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <Lock className="h-5 w-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-800">Changer de mot de passe</h2>
      </div>
      
      <div className="p-6">
        <form id="password-form" action={handleSubmit} className="space-y-6 max-w-md">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe actuel</label>
            <input 
              type="password" 
              name="currentPassword" 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
            <input 
              type="password" 
              name="newPassword" 
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input 
              type="password" 
              name="confirmPassword" 
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[150px]"
          >
            {loading ? "Mise à jour..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
