import React from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import AdminClient from "./AdminClient";
import { MovieItem, SafeUser, SaturdayEventItem, ReviewItem } from "@/types";

export const metadata: Metadata = {
  title: "Panel de Administración — Psikos Cine",
  description: "Panel de administración y control del club de cine Psikos.",
};

export const revalidate = 0;

export default async function AdminPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    redirect("/login");
  }
  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  // 1. Fetch Stats
  const moviesCount = await prisma.movie.count();
  const usersCount = await prisma.user.count();
  const reviewsCount = await prisma.review.count();
  const activeVotesCount = await prisma.saturdayEvent.count({
    where: { status: "VOTING" },
  });
  const finishedSaturdaysCount = await prisma.saturdayEvent.count({
    where: { status: "FINISHED" },
  });

  // 2. Fetch Movies
  const rawMovies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      genres: { include: { genre: true } },
      ratings: true,
      reviews: { select: { id: true } },
    },
  });

  const formattedMovies: MovieItem[] = rawMovies.map((m) => {
    const rCount = m.ratings.length;
    const totalScore = m.ratings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = rCount > 0 ? Number((totalScore / rCount).toFixed(1)) : 0;

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
      ratingCount: rCount,
      reviewCount: m.reviews.length,
    };
  });

  // 3. Fetch Users
  const rawUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedUsers: SafeUser[] = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    bio: u.bio,
    role: u.role as any,
    isBlocked: u.isBlocked,
    createdAt: u.createdAt.toISOString(),
  }));

  // 4. Fetch Reviews
  const rawReviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { id: true, name: true, username: true, avatar: true, role: true },
      },
      movie: {
        select: { title: true },
      },
      likes: true,
      replies: {
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
        },
      },
    },
  });

  const formattedReviews = rawReviews.map((r) => ({
    id: r.id,
    content: r.content,
    hasSpoiler: r.hasSpoiler,
    isHidden: r.isHidden,
    userId: r.userId,
    movieId: r.movieId,
    movieTitle: r.movie.title,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
    likesCount: r.likes.length,
    replies: r.replies.map((rep) => ({
      id: rep.id,
      content: rep.content,
      userId: rep.userId,
      reviewId: rep.reviewId,
      createdAt: rep.createdAt.toISOString(),
      user: rep.user,
    })),
  }));

  // 5. Fetch Saturdays
  const rawSaturdays = await prisma.saturdayEvent.findMany({
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

  const formattedSaturdays: SaturdayEventItem[] = rawSaturdays.map((s) => {
    const totalVotes = s.votes.length;
    return {
      id: s.id,
      title: s.title,
      date: s.date.toISOString(),
      votingDeadline: s.votingDeadline.toISOString(),
      status: s.status as any,
      winnerMovieId: s.winnerMovieId,
      winnerMovie: s.winnerMovie
        ? {
            id: s.winnerMovie.id,
            title: s.winnerMovie.title,
            originalTitle: s.winnerMovie.originalTitle,
            year: s.winnerMovie.year,
            description: s.winnerMovie.description,
            poster: s.winnerMovie.poster,
            backdrop: s.winnerMovie.backdrop,
            duration: s.winnerMovie.duration,
            director: s.winnerMovie.director,
            cast: s.winnerMovie.cast,
            country: s.winnerMovie.country,
            trailerUrl: s.winnerMovie.trailerUrl,
            createdAt: s.winnerMovie.createdAt.toISOString(),
            genres: s.winnerMovie.genres.map((g) => ({
              id: g.genre.id,
              name: g.genre.name,
              slug: g.genre.slug,
            })),
            averageRating: 0,
            ratingCount: 0,
          }
        : null,
      notes: s.notes,
      totalVotes,
      candidates: s.candidates.map((c, i) => ({
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
        },
        proposedBy: c.proposedBy,
        votesCount: c.votes.length,
        percentage: totalVotes > 0 ? Math.round((c.votes.length / totalVotes) * 100) : 0,
        rank: i + 1,
      })),
    };
  });

  return (
    <AdminClient
      stats={{
        moviesCount,
        usersCount,
        reviewsCount,
        activeVotesCount,
        finishedSaturdaysCount,
      }}
      initialMovies={formattedMovies}
      initialUsers={formattedUsers}
      initialReviews={formattedReviews}
      initialSaturdays={formattedSaturdays}
    />
  );
}
