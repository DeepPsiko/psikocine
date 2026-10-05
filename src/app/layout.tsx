import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Psikos Cine — Catálogo y Sábado de Películas",
  description:
    "Plataforma cinematográfica privada para el grupo Psikos. Catálogo de películas, calificaciones, opiniones, votaciones y organización del Sábado de Películas.",
  keywords: ["cine", "películas", "psikos", "letterboxd", "sábado de películas", "votación"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="es" className="dark">
      <body className="bg-psiko-dark text-slate-100 flex flex-col min-h-screen antialiased selection:bg-indigo-600 selection:text-white">
        <ToastProvider>
          <Navbar initialUser={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
