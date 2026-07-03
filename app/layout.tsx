import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/session";

import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestion Commercial",
  description: "Plateforme centralisée de gestion commerciale Hub & Spoke",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientLayoutWrapper user={user} SidebarComponent={<Sidebar user={user} />}>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
