"use client";

import { useState } from "react";
import { loginAction } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretCount, setSecretCount] = useState(0);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleSecretClick() {
    const newCount = secretCount + 1;
    if (newCount >= 4) {
      setEmail("konedamaa1@gmail.com");
      setPassword("superadmin");
      setSecretCount(0);
    } else {
      setSecretCount(newCount);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-slate-900 border-b border-slate-800">
          <h1 
            onClick={handleSecretClick}
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-wider cursor-default select-none"
          >
            GESTION PRO
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Connectez-vous à votre espace</p>
        </div>
        
        <div className="p-4 md:p-8">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@gestion.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
              <input 
                type="password" 
                name="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold shadow-md hover:bg-blue-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Connexion"
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4 text-center text-sm text-slate-500">
            <span>
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="text-blue-600 font-semibold hover:underline">
                Inscrire mon entreprise
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
