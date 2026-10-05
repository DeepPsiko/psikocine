"use client";

import React, { useState, useEffect } from "react";
import { Film, Plus, Search, X, Check } from "lucide-react";
import { useToast } from "./Toast";
import { MovieItem } from "@/types";

interface ProposeMovieModalProps {
  saturdayId: string;
  isOpen: boolean;
  onClose: () => void;
  onCandidateAdded: () => void;
  existingMovieIds: string[];
}

export default function ProposeMovieModal({
  saturdayId,
  isOpen,
  onClose,
  onCandidateAdded,
  existingMovieIds,
}: ProposeMovieModalProps) {
  const { toast } = useToast();
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMovies();
    }
  }, [isOpen]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/movies");
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies
    .filter((m) => !existingMovieIds.includes(m.id))
    .filter(
      (m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.director.toLowerCase().includes(search.toLowerCase())
    );

  const handleSubmit = async () => {
    if (!selectedMovieId) {
      toast("Selecciona una película para proponer", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/saturday/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saturdayId,
          movieId: selectedMovieId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al proponer película", "error");
        return;
      }

      toast("¡Película propuesta con éxito!", "success");
      onCandidateAdded();
      onClose();
    } catch {
      toast("Error de conexión al proponer candidata", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-psiko-card border border-psiko-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Proponer película para el sábado</h3>
              <p className="text-xs text-slate-400">Elige del catálogo la película que quieres ver</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o director..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Movie List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Cargando catálogo...</div>
          ) : filteredMovies.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Film className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No se encontraron películas disponibles para proponer.</p>
            </div>
          ) : (
            filteredMovies.map((movie) => {
              const isSelected = selectedMovieId === movie.id;
              return (
                <div
                  key={movie.id}
                  onClick={() => setSelectedMovieId(movie.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-indigo-500/15 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{movie.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {movie.year} · {movie.director}
                    </p>
                    <p className="text-[11px] text-amber-400/90 font-medium">
                      ⭐ {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : "Sin calificar"}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "border-slate-700 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedMovieId}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50"
          >
            {submitting ? "Proponiendo..." : "Proponer candidata"}
          </button>
        </div>
      </div>
    </div>
  );
}
