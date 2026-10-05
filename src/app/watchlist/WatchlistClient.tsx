"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bookmark, CheckCircle2, Trash2, Film, Clock, Star } from "lucide-react";
import { useToast } from "@/components/Toast";
import { MovieItem } from "@/types";
import { formatDuration } from "@/lib/utils";

interface WatchlistClientProps {
  initialMovies: (MovieItem & { isWatched: boolean; addedAt: string })[];
}

export default function WatchlistClient({ initialMovies }: WatchlistClientProps) {
  const { toast } = useToast();
  const [movies, setMovies] = useState(initialMovies);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "WATCHED">("ALL");

  const handleToggleWatched = async (movieId: string) => {
    try {
      const res = await fetch(`/api/movies/${movieId}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleWatched: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setMovies((prev) =>
          prev.map((m) =>
            m.id === movieId ? { ...m, isWatched: data.isWatched } : m
          )
        );
        toast(
          data.isWatched ? "👁️ Marcada como vista" : "Marcada como pendiente",
          "success"
        );
      }
    } catch {
      toast("Error al actualizar estado", "error");
    }
  };

  const handleRemove = async (movieId: string) => {
    try {
      const res = await fetch(`/api/movies/${movieId}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleWatched: false }),
      });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== movieId));
        toast("Eliminada de tu lista", "info");
      }
    } catch {
      toast("Error al eliminar de la lista", "error");
    }
  };

  const filtered = movies.filter((m) => {
    if (filter === "PENDING") return !m.isWatched;
    if (filter === "WATCHED") return m.isWatched;
    return true;
  });

  const pendingCount = movies.filter((m) => !m.isWatched).length;
  const watchedCount = movies.filter((m) => m.isWatched).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500">
            MI COLECCIÓN PRIVADA
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-rose-500 fill-rose-500" />
            Mi Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Películas pendientes por ver y aquellas que ya has disfrutado.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todas ({movies.length})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "PENDING"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("WATCHED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === "WATCHED"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vistas ({watchedCount})
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      {filtered.length === 0 ? (
        <div className="bg-psiko-card rounded-3xl p-12 border border-psiko-border text-center space-y-4">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay películas en esta lista</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explora el catálogo y pulsa &quot;Quiero verla&quot; en las películas que te interesen para guardarlas aquí.
          </p>
          <Link
            href="/movies"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((movie) => (
            <div
              key={movie.id}
              className="bg-psiko-card rounded-2xl p-4 border border-psiko-border hover:border-indigo-500/40 transition-all flex gap-4 group"
            >
              <Link href={`/movies/${movie.id}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-20 aspect-[2/3] object-cover rounded-xl border border-slate-700 group-hover:border-indigo-400 transition-colors"
                />
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 truncate">
                      {movie.genres?.[0]?.name || "Película"}
                    </span>
                    <span className="text-[11px] text-slate-500">{movie.year}</span>
                  </div>

                  <Link
                    href={`/movies/${movie.id}`}
                    className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate block"
                  >
                    {movie.title}
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : "—"}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {formatDuration(movie.duration)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleWatched(movie.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      movie.isWatched
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900 text-slate-300 border border-slate-700 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{movie.isWatched ? "Vista" : "Pendiente"}</span>
                  </button>

                  <button
                    onClick={() => handleRemove(movie.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Eliminar de mi lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
