import React from "react";
import Link from "next/link";
import { Star, Clock, Heart, BookmarkCheck } from "lucide-react";
import MoviePoster from "./MoviePoster";
import { MovieItem } from "@/types";

interface MovieCardProps {
  movie: MovieItem;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const mainGenre = movie.genres?.[0]?.name || "Película";

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group flex flex-col bg-psiko-card rounded-2xl overflow-hidden border border-psiko-border hover:border-indigo-500/50 movie-card-hover shadow-lg hover:shadow-2xl hover:shadow-black/60 relative"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <MoviePoster
          src={movie.poster}
          title={movie.title}
          year={movie.year}
          className="w-full h-full poster-hover"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-psiko-dark via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-psiko-darker/90 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{movie.averageRating > 0 ? movie.averageRating.toFixed(1) : "—"}</span>
        </div>

        {/* User Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {movie.isFavorite && (
            <span className="p-1.5 rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-400 shadow-md" title="Favorita">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
            </span>
          )}
          {movie.isWatched && (
            <span className="p-1.5 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 shadow-md" title="Vista">
              <BookmarkCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Duration tag at bottom */}
        {movie.duration > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
          </div>
        )}
      </div>

      {/* Movie Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-psiko-card">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-400 truncate">
              {mainGenre}
            </span>
            <span className="text-xs text-slate-400 font-medium shrink-0">{movie.year}</span>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
            {movie.title}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-200">
              {movie.averageRating > 0 ? `${movie.averageRating.toFixed(1)}/5` : "Sin votos"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {movie.ratingCount} {movie.ratingCount === 1 ? "voto" : "votos"}
          </span>
        </div>
      </div>
    </Link>
  );
}
