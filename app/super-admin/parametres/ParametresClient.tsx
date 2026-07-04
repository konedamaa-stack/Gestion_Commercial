"use client";

import { useState, useTransition } from "react";
import { changerMotDePasseAction } from "./actions";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export function ParametresClient({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    startTransition(() => {
      changerMotDePasseAction(formData).then((res) => {
        if (res?.error) {
          setError(res.error);
        } else if (res?.success) {
          setSuccess(res.success);
          formElement.reset(); // Vider le formulaire après succès
        }
      });
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Profil Administrateur</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Adresse Email</label>
            <input 
              type="text" 
              value={email} 
              disabled 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-2">L'email du Super Admin ne peut pas être modifié.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Changer de mot de passe</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmer le nouveau
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Modification en cours..." : "Enregistrer le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
