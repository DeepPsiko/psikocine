import React from "react";
import Link from "next/link";
import { Film, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-psiko-darker/90 py-12 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-lg shadow-lg shadow-indigo-950/50">
              🎬
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-wide">PSIKOS CINE CLUB</p>
              <p className="text-xs text-slate-500">Organizando el Sábado de Películas desde siempre 🍿</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              Inicio
            </Link>
            <Link href="/movies" className="hover:text-indigo-400 transition-colors">
              Películas
            </Link>
            <Link href="/saturday" className="hover:text-indigo-400 transition-colors">
              Sábado de Películas
            </Link>
            <Link href="/saturday/history" className="hover:text-indigo-400 transition-colors">
              Historial de Sábados
            </Link>
            <Link href="/rankings" className="hover:text-indigo-400 transition-colors">
              Rankings
            </Link>
            <Link href="/users" className="hover:text-indigo-400 transition-colors">
              Comunidad
            </Link>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>Diseñado con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para el grupo Psikos</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
          © {new Date().getFullYear()} Psikos Cine. Todos los derechos reservados al club de cine.
        </div>
      </div>
    </footer>
  );
}
