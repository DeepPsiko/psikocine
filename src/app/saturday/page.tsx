import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import SaturdayClient from "./SaturdayClient";
import { SaturdayEventItem } from "@/types";

export const metadata: Metadata = {
  title: "Sábado de Películas — Psikos",
  description:
    "Votación comunitaria y cartelera para el próximo Sábado de Películas del grupo Psikos.",
};

export const revalidate = 0;

export default async function SaturdayPage() {
  const currentUser = await getSessionUser();

  // Find active or scheduled event first, otherwise the most recent one
  let rawEvent = await prisma.saturdayEvent.findFirst({
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

  if (!rawEvent) {
    rawEvent = await prisma.saturdayEvent.findFirst({
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

  let event: SaturdayEventItem | null = null;
  if (rawEvent) {
    const totalVotes = rawEvent.votes.length;
    const userVote = currentUser
      ? rawEvent.votes.find((v) => v.userId === currentUser.id)
      : null;

    const sortedCandidates = [...rawEvent.candidates].sort(
      (a, b) => b.votes.length - a.votes.length
    );

    event = {
      id: rawEvent.id,
      title: rawEvent.title,
      date: rawEvent.date.toISOString(),
      votingDeadline: rawEvent.votingDeadline.toISOString(),
      status: rawEvent.status as any,
      winnerMovieId: rawEvent.winnerMovieId,
      winnerMovie: rawEvent.winnerMovie
        ? {
            id: rawEvent.winnerMovie.id,
            title: rawEvent.winnerMovie.title,
            originalTitle: rawEvent.winnerMovie.originalTitle,
            year: rawEvent.winnerMovie.year,
            description: rawEvent.winnerMovie.description,
            poster: rawEvent.winnerMovie.poster,
            backdrop: rawEvent.winnerMovie.backdrop,
            duration: rawEvent.winnerMovie.duration,
            director: rawEvent.winnerMovie.director,
            cast: rawEvent.winnerMovie.cast,
            country: rawEvent.winnerMovie.country,
            trailerUrl: rawEvent.winnerMovie.trailerUrl,
            createdAt: rawEvent.winnerMovie.createdAt.toISOString(),
            genres: rawEvent.winnerMovie.genres.map((g) => ({
              id: g.genre.id,
              name: g.genre.name,
              slug: g.genre.slug,
            })),
            averageRating:
              rawEvent.winnerMovie.ratings.length > 0
                ? Number(
                    (
                      rawEvent.winnerMovie.ratings.reduce((acc, curr) => acc + curr.value, 0) /
                      rawEvent.winnerMovie.ratings.length
                    ).toFixed(1)
                  )
                : 0,
            ratingCount: rawEvent.winnerMovie.ratings.length,
          }
        : null,
      notes: rawEvent.notes,
      totalVotes,
      userVotedCandidateId: userVote?.candidateId || null,
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

  return <SaturdayClient initialEvent={event} currentUser={currentUser} />;
}
