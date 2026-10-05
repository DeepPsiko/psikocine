import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  Trophy,
  Star,
  Flame,
  MessageSquare,
  Heart,
  Eye,
  Film,
  Users,
  Award,
} from "lucide-react";
import { MovieItem } from "@/types";

export const metadata: Metadata = {
  title: "Rankings — Psikos Cine",
  description:
    "Las mejores películas calificadas, más votadas, comentadas y favoritas por la comunidad cinéfila de Psikos.",
};

export const revalidate = 0;

export default async function RankingsPage() {
  const rawMovies = await prisma.movie.findMany({
    include: {
      genres: { include: { genre: true } },
      ratings: true,
      reviews: { select: { id: true } },
      favorites: { select: { id: true } },
      watchlists: { select: { isWatched: true } },
    },
  });

  const movies: (MovieItem & {
    favoritesTotal: number;
    watchedTotal: number;
  })[] = rawMovies.map((m) => {
    const ratingCount = m.ratings.length;
    const totalScore = m.ratings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;
    const watchedTotal = m.watchlists.filter((w) => w.isWatched).length;

    return {
      id: m.id,
      title: m.title,
      originalTitle: m.originalTitle,
      year: m.year,
      description: m.description,
      poster: m.poster,
      backdrop: m.backdrop,
      duration: m.duration,
      director: m.director,
      cast: m.cast,
      country: m.country,
      trailerUrl: m.trailerUrl,
      createdAt: m.createdAt.toISOString(),
      genres: m.genres.map((g) => ({
        id: g.genre.id,
        name: g.genre.name,
        slug: g.genre.slug,
      })),
      averageRating,
      ratingCount,
      reviewCount: m.reviews.length,
      favoritesTotal: m.favorites.length,
      watchedTotal,
    };
  });

  // Top Rated (min 1 rating)
  const topRated = [...movies]
    .filter((m) => m.ratingCount > 0)
    .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount)
    .slice(0, 10);

  // Most Voted
  const mostVoted = [...movies]
    .sort((a, b) => b.ratingCount - a.ratingCount || b.averageRating - a.averageRating)
    .slice(0, 10);

  // Most Reviewed
  const mostReviewed = [...movies]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 10);

  // Community Favorites
  const favorites = [...movies]
    .sort((a, b) => b.favoritesTotal - a.favoritesTotal)
    .slice(0, 10);

  // Most Watched
  const mostWatched = [...movies]
    .sort((a, b) => b.watchedTotal - a.watchedTotal)
    .slice(0, 10);

  // Top Users ranking
  const rawUsers = await prisma.user.findMany({
    where: { isBlocked: false },
    include: {
      ratings: { select: { id: true, value: true } },
      reviews: { select: { id: true } },
      favorites: { select: { id: true } },
    },
  });

  const topUsers = rawUsers
    .map((u) => {
      const avgGiven =
        u.ratings.length > 0
          ? Number((u.ratings.reduce((acc, curr) => acc + curr.value, 0) / u.ratings.length).toFixed(1))
          : 0;

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        ratingsCount: u.ratings.length,
        reviewsCount: u.reviews.length,
        avgGiven,
        score: u.ratings.length * 2 + u.reviews.length * 3 + u.favorites.length,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          ESTADÍSTICAS Y TABLAS DE HONOR
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-indigo-400" />
          Rankings de Psikos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Las películas consagradas por el grupo según calificación, popularidad y debates.
        </p>
      </div>

      {/* Main Grid: Mejor calificadas (Top Highlight) */}
      <section className="bg-psiko-card rounded-3xl border border-psiko-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              🏆 Mejor Calificadas por Psikos
            </h2>
            <p className="text-xs text-slate-400">
              El podio supremo del cine votado por nuestra comunidad
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {topRated.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aún no hay películas con calificaciones para el podio. ¡Sé el primero en calificar una película del catálogo!
            </div>
          ) : (
            topRated.map((movie, index) => {
              const medals = ["🥇", "🥈", "🥉"];
              const isPodium = index < 3;

            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all group ${
                  isPodium
                    ? "bg-indigo-500/5 border-indigo-500/30 hover:border-indigo-500/60 shadow-lg shadow-indigo-950/20"
                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xl sm:text-2xl font-black text-slate-400 w-8 text-center shrink-0">
                    {index < 3 ? medals[index] : `#${index + 1}`}
                  </span>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl border border-slate-700 group-hover:border-indigo-400 transition-colors shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {movie.year} · Dir. {movie.director}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {movie.genres.slice(0, 2).map((g) => (
                        <span
                          key={g.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-base sm:text-lg font-black text-white">
                      {movie.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">/ 5</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {movie.ratingCount} {movie.ratingCount === 1 ? "voto" : "votos"}
                  </p>
                </div>
              </Link>
            );
          })
        )}
        </div>
      </section>

      {/* Sub-rankings 3-columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Más Votadas */}
        <section className="bg-psiko-card rounded-2xl border border-psiko-border p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Flame className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Más Votadas</h3>
          </div>

          <div className="space-y-2.5">
            {mostVoted.slice(0, 5).map((m, i) => (
              <Link
                key={m.id}
                href={`/movies/${m.id}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors group text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-bold text-slate-500 w-4">{i + 1}.</span>
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-400 truncate">
                    {m.title}
                  </span>
                </div>
                <span className="text-slate-400 font-bold shrink-0 ml-2">
                  {m.ratingCount} votos
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Más Comentadas */}
        <section className="bg-psiko-card rounded-2xl border border-psiko-border p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Más Comentadas</h3>
          </div>

          <div className="space-y-2.5">
            {mostReviewed.slice(0, 5).map((m, i) => (
              <Link
                key={m.id}
                href={`/movies/${m.id}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors group text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-bold text-slate-500 w-4">{i + 1}.</span>
                  <span className="font-semibold text-slate-200 group-hover:text-sky-400 truncate">
                    {m.title}
                  </span>
                </div>
                <span className="text-slate-400 font-bold shrink-0 ml-2">
                  {m.reviewCount} opiniones
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Favoritas del Grupo */}
        <section className="bg-psiko-card rounded-2xl border border-psiko-border p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="text-base font-bold text-white">Favoritas del Grupo</h3>
          </div>

          <div className="space-y-2.5">
            {favorites.slice(0, 5).map((m, i) => (
              <Link
                key={m.id}
                href={`/movies/${m.id}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors group text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-bold text-slate-500 w-4">{i + 1}.</span>
                  <span className="font-semibold text-slate-200 group-hover:text-rose-400 truncate">
                    {m.title}
                  </span>
                </div>
                <span className="text-slate-400 font-bold shrink-0 ml-2">
                  {m.favoritesTotal} ❤️
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Miembros de Psikos Ranking */}
      <section className="bg-psiko-card rounded-3xl border border-psiko-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Cinéfilos de Psikos
            </h2>
            <p className="text-xs text-slate-400">
              Ranking de participación y actividad de los miembros
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topUsers.map((user, i) => (
            <Link
              key={user.id}
              href={`/users/${user.username}`}
              className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 transition-all group flex flex-col items-center text-center space-y-3"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 group-hover:border-indigo-400 transition-colors"
                />
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
                  #{i + 1}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500">@{user.username}</p>
              </div>

              <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
                <div>
                  <p className="font-bold text-white">{user.ratingsCount}</p>
                  <p className="text-[10px] text-slate-500">Calificadas</p>
                </div>
                <div>
                  <p className="font-bold text-white">{user.reviewsCount}</p>
                  <p className="text-[10px] text-slate-500">Opiniones</p>
                </div>
                <div>
                  <p className="font-bold text-indigo-400">{user.avgGiven > 0 ? user.avgGiven : "—"}</p>
                  <p className="text-[10px] text-slate-500">Promedio</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
