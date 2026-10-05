"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Film, ArrowLeft, Save, Check } from "lucide-react";
import { useToast } from "@/components/Toast";
import MovieImageUploader from "@/components/MovieImageUploader";

const AVAILABLE_GENRES = [
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
  "Documental",
];

export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState("");
  const [backdrop, setBackdrop] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [country, setCountry] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (res.ok) {
          const data = await res.json();
          const m = data.movie;
          setTitle(m.title);
          setOriginalTitle(m.originalTitle || "");
          setYear(m.year);
          setDescription(m.description);
          setPoster(m.poster);
          setBackdrop(m.backdrop || "");
          setDuration(m.duration);
          setDirector(m.director);
          setCast(m.cast);
          setCountry(m.country || "");
          setSelectedGenres(m.genres.map((g: any) => g.name));
        } else {
          toast("No se encontró la película", "error");
          router.push("/admin");
        }
      } catch {
        toast("Error al cargar la película", "error");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId, router, toast]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !year || !description.trim() || !poster.trim() || !duration || !director.trim() || !cast.trim()) {
      toast("Por favor completa los campos requeridos", "error");
      return;
    }

    if (selectedGenres.length === 0) {
      toast("Selecciona al menos un género", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/movies/${movieId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          originalTitle: originalTitle || null,
          year: Number(year),
          description,
          poster,
          backdrop: backdrop || null,
          duration: Number(duration),
          director,
          cast,
          country: country || null,
          genres: selectedGenres,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al actualizar película", "error");
        return;
      }

      toast("¡Película actualizada con éxito!", "success");
      router.push(`/movies/${movieId}`);
      router.refresh();
    } catch {
      toast("Error de conexión al actualizar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Cargando película...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link
          href="/admin"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel de administración
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Film className="w-7 h-7 text-indigo-400" /> Editar Película: {title}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Actualiza los datos de la ficha técnica y multimedia.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-psiko-card rounded-3xl p-6 sm:p-8 border border-psiko-border shadow-2xl space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Título en Español <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Título Original</label>
            <input
              type="text"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Año <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              required
              value={year}
              onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Duración (min) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">País</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Director <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Reparto <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={cast}
              onChange={(e) => setCast(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Poster and Backdrop Image Uploaders */}
        <div className="space-y-4">
          <MovieImageUploader
            label="Póster de la Película"
            shape="poster"
            value={poster}
            onChange={setPoster}
            required
            hint="Sube la portada oficial desde tus archivos o pega una URL. Puedes acomodar y hacer zoom en el encuadre vertical 2:3."
          />

          <MovieImageUploader
            label="Fondo / Banner de la Película"
            shape="backdrop"
            value={backdrop}
            onChange={setBackdrop}
            hint="Sube una imagen panorámica de fondo (16:9) o pega una URL para la cabecera de la película."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            Sinopsis <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Géneros <span className="text-rose-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GENRES.map((g) => {
              const isSelected = selectedGenres.includes(g);
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/80">
          <Link
            href="/admin"
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Guardando..." : "Guardar Modificaciones"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
