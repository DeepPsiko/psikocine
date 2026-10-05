import React from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import WatchlistClient from "./WatchlistClient";
import { MovieItem } from "@/types";

export const metadata: Metadata = {
  title: "Mi Watchlist — Psikos Cine",
  description: "Tu lista personalizada de películas pendientes y vistas en Psikos.",
};

export const revalidate = 0;

export default async function WatchlistPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/watchlist");
  }

  const entries = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      movie: {
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
      },
    },
  });

  const formattedMovies: (MovieItem & { isWatched: boolean; addedAt: string })[] = entries.map(
    (entry) => {
      const m = entry.movie;
      const rList = m.ratings || [];
      const totalScore = rList.reduce((acc, curr) => acc + curr.value, 0);
      const averageRating = rList.length > 0 ? Number((totalScore / rList.length).toFixed(1)) : 0;

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
        ratingCount: rList.length,
        isWatched: entry.isWatched,
        addedAt: entry.createdAt.toISOString(),
      };
    }
  );

  return <WatchlistClient initialMovies={formattedMovies} />;
}
