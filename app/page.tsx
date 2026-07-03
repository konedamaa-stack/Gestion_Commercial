import Link from "next/link";
import { ArrowRight, BarChart3, Building2, Package, Users } from "lucide-react";
import { loginAction } from "@/app/login/actions";
import { SecretFooter } from "@/components/SecretFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              GESTION PRO
            </span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              href="/inscription" 
              className="px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-xl"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-4 border border-blue-100">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            La solution N°1 pour les PME
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Gérez votre commerce <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              comme un pro.
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            La plateforme tout-en-un pour gérer vos stocks, vos ventes, vos employés et vos multiples boutiques depuis une seule interface intelligente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link 
              href="/inscription" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1"
            >
              Commencer maintenant <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-500 text-lg">Une suite complète d'outils pensés pour votre croissance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gestion des Stocks</h3>
              <p className="text-slate-500 leading-relaxed">
                Suivez vos inventaires en temps réel, gérez les alertes de rupture et organisez vos produits efficacement.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Boutiques</h3>
              <p className="text-slate-500 leading-relaxed">
                Supervisez plusieurs points de vente depuis un seul compte. Transférez du stock et analysez les performances globales.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gestion du Personnel</h3>
              <p className="text-slate-500 leading-relaxed">
                Créez des accès vendeurs, suivez qui a vendu quoi et maîtrisez complètement les permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SecretFooter />
    </div>
  );
}
