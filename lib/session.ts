import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// En production, il faut chiffrer ce cookie (avec jsonwebtoken ou jose)
// Ici nous faisons une implémentation basique pour l'exemple.
export type SessionData = {
  userId: string;
  nom: string;
  role: string;
  etablissement_id: string | null;
  impersonatedBySuperAdmin?: boolean;
  superAdminId?: string;
};

export async function createSession(data: SessionData) {
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semaine
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie) as SessionData;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
