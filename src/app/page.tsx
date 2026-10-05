import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import SaturdayHero from "@/components/SaturdayHero";
import MovieCard from "@/components/MovieCard";
import ReviewCard from "@/components/ReviewCard";
import UserAvatar from "@/components/UserAvatar";
import {
  Flame,
  Star,
  Sparkles,
  MessageSquare,
  Trophy,
  ArrowRight,
  TrendingUp,
  Film,
} from "lucide-react";
import { MovieItem, SaturdayEventItem, ReviewItem } from "@/types";

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  const currentUser = await getSessionUser();

  // 1. Fetch Saturday Event (active first, or last finished)
  let rawSaturday = await prisma.saturdayEvent.findFirst({
    where: { status: { in: ["VOTING", "SCHEDULED"] } },
    orderBy: { date: "asc" },
    include: {
      winnerMovie: {
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      },
      candidates: {
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              ratings: true,
            },
          },
          proposedBy: {
            select: { id: true, name: true, username: true, avatar: true },
          },
          votes: true,
        },
      },
      votes: true,
    },
  });

  if (!rawSaturday) {
    rawSaturday = await prisma.saturdayEvent.findFirst({
      orderBy: { date: "desc" },
      include: {
        winnerMovie: {
          include: {
            genres: { include: { genre: true } },
            ratings: true,
          },
        },
        candidates: {
          include: {
            movie: {
              include: {
                genres: { include: { genre: true } },
                ratings: true,
              },
            },
            proposedBy: {
              select: { id: true, name: true, username: true, avatar: true },
            },
            votes: true,
          },
        },
        votes: true,
      },
    });
  }

  let saturdayEvent: SaturdayEventItem | null = null;
  if (rawSaturday) {
    const totalVotes = rawSaturday.votes.length;
    const sortedCandidates = [...rawSaturday.candidates].sort(
      (a, b) => b.votes.length - a.votes.length
    );

    saturdayEvent = {
      id: rawSaturday.id,
      title: rawSaturday.title,
      date: rawSaturday.date.toISOString(),
      votingDeadline: rawSaturday.votingDeadline.toISOString(),
      status: rawSaturday.status as any,
      winnerMovieId: rawSaturday.winnerMovieId,
      winnerMovie: rawSaturday.winnerMovie
        ? {
            id: rawSaturday.winnerMovie.id,
            title: rawSaturday.winnerMovie.title,
            originalTitle: rawSaturday.winnerMovie.originalTitle,
            year: rawSaturday.winnerMovie.year,
            description: rawSaturday.winnerMovie.description,
            poster: rawSaturday.winnerMovie.poster,
            backdrop: rawSaturday.winnerMovie.backdrop,
            duration: rawSaturday.winnerMovie.duration,
            director: rawSaturday.winnerMovie.director,
            cast: rawSaturday.winnerMovie.cast,
            country: rawSaturday.winnerMovie.country,
            trailerUrl: rawSaturday.winnerMovie.trailerUrl,
            createdAt: rawSaturday.winnerMovie.createdAt.toISOString(),
            genres: rawSaturday.winnerMovie.genres.map((g) => ({
              id: g.genre.id,
              name: g.genre.name,
              slug: g.genre.slug,
            })),
            averageRating:
              rawSaturday.winnerMovie.ratings.length > 0
                ? Number(
                    (
                      rawSaturday.winnerMovie.ratings.reduce(
                        (acc, curr) => acc + curr.value,
                        0
                      ) / rawSaturday.winnerMovie.ratings.length
                    ).toFixed(1)
                  )
                : 0,
            ratingCount: rawSaturday.winnerMovie.ratings.length,
          }
        : null,
      notes: rawSaturday.notes,
      totalVotes,
      candidates: sortedCandidates.map((c, index) => {
        const votesCount = c.votes.length;
        const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
        const rList = c.movie.ratings || [];
        const avg =
          rList.length > 0
            ? Number((rList.reduce((acc, curr) => acc + curr.value, 0) / rList.length).toFixed(1))
            : 0;

        return {
          id: c.id,
          saturdayId: c.saturdayId,
          movieId: c.movieId,
          proposedById: c.proposedById,
          movie: {
            id: c.movie.id,
            title: c.movie.title,
            year: c.movie.year,
            poster: c.movie.poster,
            backdrop: c.movie.backdrop,
            director: c.movie.director,
            duration: c.movie.duration,
            genres: c.movie.genres.map((g) => ({
              genre: { id: g.genre.id, name: g.genre.name, slug: g.genre.slug },
            })),
            averageRating: avg,
          },
          proposedBy: c.proposedBy,
          votesCount,
          percentage,
          rank: index + 1,
        };
      }),
    };
  }

  // 2. Fetch all movies with aggregated data
  const rawMovies = await prisma.movie.findMany({
    include: {
      genres: { include: { genre: true } },
      ratings: true,
      reviews: { select: { id: true } },
      favorites: currentUser ? { where: { userId: currentUser.id } } : false,
      watchlists: currentUser ? { where: { userId: currentUser.id } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  const allMovies: MovieItem[] = rawMovies.map((m) => {
    const ratingCount = m.ratings.length;
    const totalScore = m.ratings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;
    const isFavorite = currentUser ? (m.favorites?.length || 0) > 0 : false;
    const inWatchlist = currentUser ? (m.watchlists?.length || 0) > 0 : false;
    const isWatched = currentUser ? m.watchlists?.[0]?.isWatched || false : false;

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
      isFavorite,
      inWatchlist,
      isWatched,
    };
  });

  // Popular movies (ratingCount desc)
  const popularMovies = [...allMovies]
    .sort((a, b) => b.ratingCount - a.ratingCount || b.averageRating - a.averageRating)
    .slice(0, 6);

  // Top rated movies (averageRating desc, min 1 rating)
  const topRatedMovies = [...allMovies]
    .filter((m) => m.ratingCount > 0)
    .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount)
    .slice(0, 6);

  // Recently added movies
  const recentMovies = [...allMovies].slice(0, 6);

  // 3. Fetch Recent Reviews
  const rawReviews = await prisma.review.findMany({
    where: { isHidden: false },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, username: true, avatar: true, role: true },
      },
      movie: {
        select: { id: true, title: true, poster: true, year: true },
      },
      likes: true,
      replies: {
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
        },
      },
    },
  });

  const recentReviews: (ReviewItem & { movie: { id: string; title: string; poster: string; year: number } })[] =
    rawReviews.map((r) => ({
      id: r.id,
      content: r.content,
      hasSpoiler: r.hasSpoiler,
      isHidden: r.isHidden,
      userId: r.userId,
      movieId: r.movieId,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      movie: r.movie,
      likesCount: r.likes.length,
      hasLiked: currentUser ? r.likes.some((l) => l.userId === currentUser.id) : false,
      replies: r.replies.map((rep) => ({
        id: rep.id,
        content: rep.content,
        userId: rep.userId,
        reviewId: rep.reviewId,
        createdAt: rep.createdAt.toISOString(),
        user: rep.user,
      })),
    }));

  // 4. Fetch Top Psikos Members ranking
  const rawUsers = await prisma.user.findMany({
    where: { isBlocked: false },
    include: {
      ratings: { select: { id: true } },
      reviews: { select: { id: true } },
      favorites: { select: { id: true } },
    },
  });

  const topUsers = rawUsers
    .map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      role: u.role,
      ratedCount: u.ratings.length,
      reviewsCount: u.reviews.length,
      favoritesCount: u.favorites.length,
      activityScore: u.ratings.length * 2 + u.reviews.length * 3 + u.favorites.length,
    }))
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* 1. Hero del próximo sábado */}
      <section>
        <SaturdayHero event={saturdayEvent} />
      </section>

      {/* 2. Películas Populares */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Películas Populares</h2>
              <p className="text-xs text-slate-400">Las más debatidas y votadas en Psikos</p>
            </div>
          </div>

          <Link
            href="/movies?sort=most_voted"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 3. Mejor calificadas */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Mejor Calificadas</h2>
              <p className="text-xs text-slate-400">Las obras maestras elegidas por el grupo</p>
            </div>
          </div>

          <Link
            href="/movies?sort=top_rated"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Ver ranking completo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topRatedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 4. Agregadas recientemente */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Agregadas Recientemente</h2>
              <p className="text-xs text-slate-400">Nuevas incorporaciones al catálogo</p>
            </div>
          </div>

          <Link
            href="/movies?sort=newly_added"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 5. Opiniones Recientes & Ranking de Psikos (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Opiniones Recientes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Opiniones Recientes</h2>
                <p className="text-xs text-slate-400">Lo que dicen los miembros de Psikos</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <div className="bg-psiko-card rounded-2xl p-8 border border-psiko-border text-center text-slate-400 text-sm">
                No hay opiniones registradas aún. ¡Sé el primero en calificar una película!
              </div>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
                    <span>Sobre</span>
                    <Link
                      href={`/movies/${review.movieId}`}
                      className="font-bold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Film className="w-3 h-3" /> {review.movie.title} ({review.movie.year})
                    </Link>
                  </div>
                  <ReviewCard
                    review={review}
                    currentUser={currentUser}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ranking de Psikos (1 col) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Ranking de Psikos</h2>
                <p className="text-xs text-slate-400">Miembros más activos</p>
              </div>
            </div>
            <Link
              href="/rankings"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Ver más
            </Link>
          </div>

          <div className="bg-psiko-card rounded-2xl p-4 border border-psiko-border divide-y divide-slate-800">
            {topUsers.map((u, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const medal = i < 3 ? medals[i] : `#${i + 1}`;

              return (
                <Link
                  key={u.id}
                  href={`/users/${u.username}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-400 w-6 text-center">
                      {medal}
                    </span>
                    <UserAvatar
                      src={u.avatar}
                      name={u.name}
                      className="w-10 h-10 text-sm border border-slate-700 group-hover:border-indigo-400 transition-colors"
                    />
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500">@{u.username}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-indigo-400">{u.ratedCount} votos</p>
                    <p className="text-[10px] text-slate-500">{u.reviewsCount} opiniones</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
