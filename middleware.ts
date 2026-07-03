import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Récupérer le cookie de session
  const session = request.cookies.get("session")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isInscriptionPage = request.nextUrl.pathname.startsWith("/inscription");
  const isLandingPage = request.nextUrl.pathname === "/";

  // Pages publiques accessibles sans être connecté
  const isPublicPage = isLoginPage || isInscriptionPage || isLandingPage;

  // Rediriger vers /login si l'utilisateur n'est pas connecté et n'est pas sur une page publique
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rediriger si l'utilisateur est connecté et essaie d'aller sur une page publique (/login, /inscription, /)
  if (session && isPublicPage) {
    // Parser le session cookie (qui est un JSON stringifié dans notre système simplifié)
    try {
      const userData = JSON.parse(session);
      if (userData.role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/super-admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (e) {
      // Fallback si on n'arrive pas à lire le rôle
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Appliquer le middleware sur toutes les pages sauf les fichiers statiques (images, css, etc.) et les API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
