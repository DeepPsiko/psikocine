"use client";

import React, { useState } from "react";
import { Loader2, Wand2, Search, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast("Escribe el nombre de la película a buscar", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/movies/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "No se pudo autocompletar la película", "error");
        return;
      }

      onAutofill(data.movie);
      setIsOpen(false);
      setQuery("");

      if (data.warning) {
        toast(data.warning, "info");
      } else {
        toast(`¡Datos de "${data.movie.title}" rellenados con éxito!`, "success");
      }
    } catch {
      toast("Error de conexión al consultar la IA", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón que abre la interfaz modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 hover:scale-[1.02] self-start sm:self-auto shrink-0"
      >
        <Wand2 className="w-4 h-4" />
        <span>Rellenar con IA</span>
      </button>

      {/* Modal Interfaz */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-psiko-card border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Rellenar con IA</h3>
                  <p className="text-xs text-slate-400">
                    Ingresa el nombre de la película
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!loading) setIsOpen(false);
                }}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de búsqueda (div para evitar form anidado) */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Título y año de la película
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="ej. Avengers 2012, Inception..."
                    disabled={loading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  La IA completará los datos de la ficha excepto las imágenes.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/50 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Rellenar datos</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
