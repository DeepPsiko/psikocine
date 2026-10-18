"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Wand2, Search } from "lucide-react";
import { useToast } from "@/components/Toast";

interface AutofillData {
  title: string;
  originalTitle: string;
  year: number;
  duration: number;
  director: string;
  cast: string;
  country: string;
  description: string;
  genres: string[];
}

interface MovieAiAutofillProps {
  onAutofill: (data: AutofillData) => void;
}

export default function MovieAiAutofill({ onAutofill }: MovieAiAutofillProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      toast("Escribe el nombre de la película a buscar", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/movies/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "No se pudo autocompletar la película", "error");
        return;
      }

      onAutofill(data.movie);

      if (data.warning) {
        toast(data.warning, "info");
      } else {
        toast(`¡Datos de "${data.movie.title}" rellenados con éxito por Gemini!`, "success");
      }
    } catch {
      toast("Error de conexión al consultar la IA", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickChip = (movieName: string) => {
    setQuery(movieName);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/50 rounded-2xl p-5 border border-indigo-500/30 shadow-xl relative overflow-hidden space-y-3">
      {/* Glow highlight */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              Rellenar con IA (Gemini)
            </h3>
            <p className="text-[11px] text-slate-400">
              Escribe el título (ej. <span className="text-indigo-300 font-semibold">Avengers 2012</span>) y la IA completará los datos. Tú solo subes el póster.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-1">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ej. Avengers 2012, Inception 2010, El Padrino..."
            disabled={loading}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Consultando IA...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Rellenar con IA</span>
            </>
          )}
        </button>
      </form>

      {/* Sugerencias rápidas */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
        <span className="font-medium">Ejemplos:</span>
        {["Avengers 2012", "Interstellar 2014", "El Viaje de Chihiro 2001", "Parasite 2019"].map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => handleQuickChip(ex)}
            className="px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-indigo-950/60 hover:text-indigo-300 text-slate-400 border border-slate-800 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
