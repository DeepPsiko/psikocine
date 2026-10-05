"use client";

import React, { useState } from "react";
import {
  Heart,
  Bookmark,
  CheckCircle2,
  Clock,
  Film,
  Calendar,
  Globe,
  User,
  Users,
  Share2,
} from "lucide-react";
import RatingWidget from "@/components/RatingWidget";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import MoviePoster from "@/components/MoviePoster";
import { useToast } from "@/components/Toast";
import { MovieItem, ReviewItem, SafeUser } from "@/types";
import { formatDuration } from "@/lib/utils";

interface MovieDetailClientProps {
  initialMovie: MovieItem;
  initialReviews: ReviewItem[];
  currentUser: SafeUser | null;
}

export default function MovieDetailClient({
  initialMovie,
  initialReviews,
  currentUser,
}: MovieDetailClientProps) {
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieItem>(initialMovie);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const [isFavorite, setIsFavorite] = useState(initialMovie.isFavorite || false);
  const [inWatchlist, setInWatchlist] = useState(initialMovie.inWatchlist || false);
  const [isWatched, setIsWatched] = useState(initialMovie.isWatched || false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [togglingWatch, setTogglingWatch] = useState(false);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      toast("Inicia sesión para agregar a favoritas", "error");
      return;
    }

    try {
      setTogglingFav(true);
      const res = await fetch(`/api/movies/${movie.id}/favorite`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.isFavorite);
        toast(
          data.isFavorite ? "❤️ Agregada a tus favoritas" : "Eliminada de tus favoritas",
          data.isFavorite ? "success" : "info"
        );
      }
    } catch {
      toast("Error al actualizar favoritos", "error");
    } finally {
      setTogglingFav(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!currentUser) {
      toast("Inicia sesión para guardar en tu lista", "error");
      return;
    }

    try {
      setTogglingWatch(true);
      const res = await fetch(`/api/movies/${movie.id}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleWatched: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setInWatchlist(data.inWatchlist);
        toast(
          data.inWatchlist ? "📌 Agregada a tu lista de pendientes" : "Eliminada de tu lista",
          data.inWatchlist ? "success" : "info"
        );
      }
    } catch {
      toast("Error al actualizar lista", "error");
    } finally {
      setTogglingWatch(false);
    }
  };

  const handleToggleWatched = async () => {
    if (!currentUser) {
      toast("Inicia sesión para marcar como vista", "error");
      return;
    }

    try {
      const res = await fetch(`/api/movies/${movie.id}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleWatched: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsWatched(data.isWatched);
        setInWatchlist(data.inWatchlist);
        toast(
          data.isWatched ? "👁️ Marcada como vista" : "Marcada como pendiente",
          "success"
        );
      }
    } catch {
      toast("Error al marcar como vista", "error");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast("Enlace copiado al portapapeles", "success");
    }
  };

  const handleRatingChanged = (
    newAvg: number,
    newCount: number,
    userRating: number | null
  ) => {
    setMovie((prev) => ({
      ...prev,
      averageRating: newAvg,
      ratingCount: newCount,
      userRating,
    }));
  };

  const handleReviewAdded = (newReview: ReviewItem) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleReviewDeleted = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReviewUpdated = (updatedReview: ReviewItem) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  return (
    <div className="space-y-12">
      {/* 1. Cinematic Backdrop Hero Header */}
      <div className="relative w-full min-h-[460px] md:min-h-[520px] flex items-end">
        {/* Backdrop Image */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-50 contrast-110"
          />
          {/* Dark Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-psiko-dark via-psiko-dark/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-psiko-darker/90 via-transparent to-psiko-darker/60" />
        </div>

        {/* Content over Backdrop */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            {/* Poster Card */}
            <div className="shrink-0 w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-900 glow-indigo">
              <MoviePoster
                src={movie.poster}
                title={movie.title}
                year={movie.year}
                className="w-full h-full"
              />
            </div>

            {/* Info details */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30"
                  >
                    {g.name}
                  </span>
                ))}
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium ml-1">
                  <Calendar className="w-3.5 h-3.5" /> {movie.year}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {formatDuration(movie.duration)}
                </span>
                {movie.country && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Globe className="w-3.5 h-3.5" /> {movie.country}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-sm text-slate-400 italic font-medium -mt-1">
                  Título original: {movie.originalTitle}
                </p>
              )}

              {/* Action Buttons: Favorite, Watchlist, Watched, Share */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={handleToggleFavorite}
                  disabled={togglingFav}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isFavorite
                      ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/40"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`} />
                  <span>{isFavorite ? "En favoritas" : "Agregar a favoritas"}</span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  disabled={togglingWatch}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    inWatchlist
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-950/40"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? "fill-white" : ""}`} />
                  <span>{inWatchlist ? "En mi Watchlist" : "Quiero verla"}</span>
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isWatched
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/40"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isWatched ? "fill-white" : ""}`} />
                  <span>{isWatched ? "Vista" : "Marcar como vista"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
                  title="Compartir enlace"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left / Middle (2 cols): Synopsis, Cast, Director, Trailer */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section className="bg-psiko-card rounded-2xl p-6 sm:p-7 border border-psiko-border space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" /> Sinopsis
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {movie.description}
              </p>
            </section>

            {/* Director & Cast */}
            <section className="bg-psiko-card rounded-2xl p-6 sm:p-7 border border-psiko-border space-y-5">
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" /> Director
                </h3>
                <p className="text-base font-bold text-white">{movie.director}</p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" /> Reparto principal
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.split(",").map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-900 text-slate-200 text-xs font-medium border border-slate-800"
                    >
                      {actor.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    💬 Opiniones de Psikos
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"} de nuestros miembros
                  </p>
                </div>
              </div>

              {/* Add review form */}
              <ReviewForm
                movieId={movie.id}
                isAuthenticated={!!currentUser}
                onReviewAdded={handleReviewAdded}
              />

              {/* Reviews list */}
              <div className="space-y-4 pt-2">
                {reviews.length === 0 ? (
                  <div className="bg-psiko-card rounded-2xl p-8 border border-psiko-border text-center text-slate-400 text-sm">
                    Aún no hay opiniones escritas sobre esta película. ¡Sé el primero en compartir tu punto de vista!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <ReviewCard
                      key={rev.id}
                      review={rev}
                      currentUser={currentUser}
                      onReviewDeleted={handleReviewDeleted}
                      onReviewUpdated={handleReviewUpdated}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column (1 col): Rating Widget & Statistics */}
          <div className="space-y-6">
            <RatingWidget
              movieId={movie.id}
              initialRating={movie.userRating}
              averageRating={movie.averageRating}
              ratingCount={movie.ratingCount}
              distribution={movie.ratingDistribution}
              isAuthenticated={!!currentUser}
              onRatingChanged={handleRatingChanged}
            />

            {/* Quick stats panel */}
            <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ficha Técnica
              </h4>
              <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Año de estreno:</span>
                  <span className="font-semibold text-white">{movie.year}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Duración:</span>
                  <span className="font-semibold text-white">{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">País de origen:</span>
                  <span className="font-semibold text-white">{movie.country || "Internacional"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Director:</span>
                  <span className="font-semibold text-indigo-400">{movie.director}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Opiniones registradas:</span>
                  <span className="font-semibold text-white">{reviews.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
