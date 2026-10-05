import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import UserProfileClient from "./UserProfileClient";
import { MovieItem, ReviewItem } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    select: { name: true, username: true, bio: true },
  });

  if (!user) {
    return {
      title: "Usuario no encontrado — Psikos",
    };
  }

  return {
    title: `${user.name} (@${user.username}) — Psikos Cine`,
    description: user.bio || `Perfil y catálogo calificado de ${user.name} en el club de cine Psikos.`,
  };
}

export const revalidate = 0;

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const currentUser = await getSessionUser();

  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      ratings: {
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              ratings: true,
            },
          },
        },
        orderBy: { value: "desc" },
      },
      favorites: {
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              ratings: true,
            },
          },
        },
      },
      watchlists: {
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              ratings: true,
            },
          },
        },
      },
      reviews: {
        where: { isHidden: false },
        orderBy: { createdAt: "desc" },
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              ratings: true,
            },
          },
          likes: true,
          replies: {
            include: {
              user: { select: { id: true, name: true, username: true, avatar: true } },
            },
          },
        },
      },
    },
  });

  if (!user || user.isBlocked) {
    notFound();
  }

  const ratingsCount = user.ratings.length;
  const totalScore = user.ratings.reduce((acc, curr) => acc + curr.value, 0);
  const averageGiven = ratingsCount > 0 ? (totalScore / ratingsCount).toFixed(1) : "—";
  const watchedCount = user.watchlists.filter((w) => w.isWatched).length;

  const mapMovie = (m: any): MovieItem => {
    const rList = m.ratings || [];
    const avg =
      rList.length > 0
        ? Number((rList.reduce((acc: number, curr: any) => acc + curr.value, 0) / rList.length).toFixed(1))
        : 0;

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
      genres: m.genres.map((g: any) => ({
        id: g.genre.id,
        name: g.genre.name,
        slug: g.genre.slug,
      })),
      averageRating: avg,
      ratingCount: rList.length,
    };
  };

  const favorites = user.favorites.map((f) => mapMovie(f.movie));
  const watched = user.watchlists.filter((w) => w.isWatched).map((w) => mapMovie(w.movie));
  const pending = user.watchlists.filter((w) => !w.isWatched).map((w) => mapMovie(w.movie));
  const topRated = user.ratings.map((r) => mapMovie(r.movie));

  const reviews: ReviewItem[] = user.reviews.map((r) => ({
    id: r.id,
    content: r.content,
    hasSpoiler: r.hasSpoiler,
    isHidden: r.isHidden,
    userId: r.userId,
    movieId: r.movieId,
    createdAt: r.createdAt.toISOString(),
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
    },
    userRating: user.ratings.find((rt) => rt.movieId === r.movieId)?.value || null,
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

  const safeProfileUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role as any,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt.toISOString(),
    averageGiven,
    ratingsCount,
    watchedCount,
    reviewsCount: user.reviews.length,
  };

  return (
    <UserProfileClient
      profileUser={safeProfileUser}
      currentUser={currentUser}
      favorites={favorites}
      watched={watched}
      pending={pending}
      topRated={topRated}
      reviews={reviews}
    />
  );
}
