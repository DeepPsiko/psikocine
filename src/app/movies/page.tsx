"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, SlidersHorizontal, Star, Film, RotateCcw, Plus } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieItem } from "@/types";

const GENRES = [
  "Todos",
  "Acción",
  "Aventura",
  "Animación",
  "Comedia",
  "Crimen",
  "Drama",
  "Terror",
  "Ciencia ficción",
  "Fantasía",
  "Romance",
  "Suspenso",
  "Thriller",
];

const SORT_OPTIONS = [
  { value: "newly_added", label: "Agregadas recientemente" },
  { value: "top_rated", label: "Mejor calificadas" },
  { value: "most_voted", label: "Más votadas" },
  { value: "most_reviewed", label: "Más comentadas" },
  { value: "recent", label: "Año: Más recientes" },
  { value: "oldest", label: "Año: Más antiguas" },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [minRating, setMinRating] = useState<number | "">("");
  const [sort, setSort] = useState("newly_added");
  const [showFilters, setShowFilters] = useState(false);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.append("q", query.trim());
      if (selectedGenre && selectedGenre !== "Todos") params.append("genre", selectedGenre);
      if (minRating) params.append("minRating", minRating.toString());
      if (sort) params.append("sort", sort);

      const res = await fetch(`/api/movies?${params.toString()}`);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedGenre, minRating, sort]);

  const resetFilters = () => {
    setQuery("");
    setSelectedGenre("Todos");
    setMinRating("");
    setSort("newly_added");
  };

  const hasActiveFilters =
    query !== "" ||
    selectedGenre !== "Todos" ||
    minRating !== "" ||
    sort !== "newly_added";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            CATÁLOGO OFICIAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Películas de Psikos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explora títulos, calificaciones, reparto y opiniones de nuestro cine club.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href="/movies/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Película</span>
          </Link>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              showFilters
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-900 border-slate-700 text-slate-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-psiko-card border border-psiko-border rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, director, actor o género..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort Selection */}
          <div className="w-full md:w-56">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Extended filters (collapsible on mobile) */}
        <div className={`${showFilters ? "block" : "hidden md:block"} pt-3 border-t border-slate-800/80 space-y-4`}>
          {/* Genre chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Género:
            </span>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                  selectedGenre === g
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30"
                    : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Rating filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-400">Calificación mínima:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <button
                    key={star}
                    onClick={() => setMinRating(minRating === star ? "" : star)}
                    className={`flex items-center gap-0.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                      minRating === star
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{star}+</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-3 text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of movies (5-6 desktop, 3-4 tablet, 2 mobile) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mostrando {movies.length} {movies.length === 1 ? "película" : "películas"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-psiko-card rounded-2xl aspect-[2/3] animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="bg-psiko-card rounded-3xl p-12 border border-psiko-border text-center space-y-3">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No se encontraron películas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o filtros seleccionados.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-xl transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
