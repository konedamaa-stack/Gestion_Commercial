import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Lien invalide</h1>
          <p className="text-slate-500 mb-6">Le lien de vérification est manquant ou incorrect.</p>
          <Link href="/login" className="inline-block bg-slate-900 text-white font-medium px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  // Chercher l'utilisateur avec ce token
  const user = await prisma.utilisateur.findFirst({
    where: { token_verification: token }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Lien expiré ou invalide</h1>
          <p className="text-slate-500 mb-6">Ce lien a peut-être déjà été utilisé ou n'est plus valide.</p>
          <Link href="/login" className="inline-block bg-slate-900 text-white font-medium px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  // Activer l'utilisateur
  await prisma.utilisateur.update({
    where: { id: user.id },
    data: {
      est_verifie: true,
      token_verification: null // Invalider le token après usage
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Email vérifié !</h1>
        <p className="text-slate-500 mb-6">Votre compte est maintenant actif. Vous pouvez vous connecter.</p>
        <Link href="/login" className="inline-block bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
