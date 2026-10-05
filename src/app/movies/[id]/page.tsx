import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import MovieDetailClient from "./MovieDetailClient";
import { MovieItem, ReviewItem } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const movie = await prisma.movie.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, poster: true },
  });

  if (!movie) {
    return {
      title: "Película no encontrada — Psikos",
    };
  }

  return {
    title: `${movie.title} — Psikos`,
    description: `Información, calificaciones y opiniones de ${movie.title} en Psikos.`,
    openGraph: {
      title: `${movie.title} — Psikos`,
      description: `Información, calificaciones y opiniones de ${movie.title} en Psikos.`,
      images: [{ url: movie.poster }],
    },
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await getSessionUser();

  const movie = await prisma.movie.findUnique({
    where: { id: params.id },
    include: {
      genres: {
        include: { genre: true },
      },
      ratings: true,
      reviews: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true, role: true },
          },
          likes: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, name: true, username: true, avatar: true } },
            },
          },
        },
      },
      favorites: currentUser ? { where: { userId: currentUser.id } } : false,
      watchlists: currentUser ? { where: { userId: currentUser.id } } : false,
    },
  });

  if (!movie) {
    notFound();
  }

  const ratingCount = movie.ratings.length;
  const totalScore = movie.ratings.reduce((acc, curr) => acc + curr.value, 0);
  const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

  // Breakdown distribution
  const counts = [0, 0, 0, 0, 0];
  movie.ratings.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.value)));
    counts[star - 1]++;
  });

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = counts[star - 1];
    const percentage = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
    return { star, count, percentage };
  });

  const userRating = currentUser
    ? movie.ratings.find((r) => r.userId === currentUser.id)?.value || null
    : null;

  const isFavorite = currentUser ? (movie.favorites?.length || 0) > 0 : false;
  const inWatchlist = currentUser ? (movie.watchlists?.length || 0) > 0 : false;
  const isWatched = currentUser ? movie.watchlists?.[0]?.isWatched || false : false;

  const initialMovie: MovieItem = {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.originalTitle,
    year: movie.year,
    description: movie.description,
    poster: movie.poster,
    backdrop: movie.backdrop,
    duration: movie.duration,
    director: movie.director,
    cast: movie.cast,
    country: movie.country,
    trailerUrl: movie.trailerUrl,
    createdAt: movie.createdAt.toISOString(),
    genres: movie.genres.map((g) => ({
      id: g.genre.id,
      name: g.genre.name,
      slug: g.genre.slug,
    })),
    averageRating,
    ratingCount,
    ratingDistribution: distribution,
    userRating,
    isFavorite,
    inWatchlist,
    isWatched,
  };

  const initialReviews: ReviewItem[] = movie.reviews.map((rev) => {
    const revUserRating = movie.ratings.find((r) => r.userId === rev.userId)?.value || null;
    const hasLiked = currentUser
      ? rev.likes.some((l) => l.userId === currentUser.id)
      : false;

    return {
      id: rev.id,
      content: rev.content,
      hasSpoiler: rev.hasSpoiler,
      isHidden: rev.isHidden,
      userId: rev.userId,
      movieId: rev.movieId,
      createdAt: rev.createdAt.toISOString(),
      user: rev.user,
      userRating: revUserRating,
      likesCount: rev.likes.length,
      hasLiked,
      replies: rev.replies.map((rep) => ({
        id: rep.id,
        content: rep.content,
        userId: rep.userId,
        reviewId: rep.reviewId,
        createdAt: rep.createdAt.toISOString(),
        user: rep.user,
      })),
    };
  });

  return (
    <MovieDetailClient
      initialMovie={initialMovie}
      initialReviews={initialReviews}
      currentUser={currentUser}
    />
  );
}
