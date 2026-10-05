import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { saturdayEventSchema } from "@/lib/validations";

export async function GET() {
  try {
    const currentUser = await getSessionUser();

    // Find active or scheduled event first, otherwise the most recent one
    let event = await prisma.saturdayEvent.findFirst({
      where: {
        status: { in: ["VOTING", "SCHEDULED"] },
      },
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

    if (!event) {
      event = await prisma.saturdayEvent.findFirst({
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

    if (!event) {
      return NextResponse.json({ event: null });
    }

    const totalVotes = event.votes.length;

    // Check user vote
    const userVote = currentUser
      ? event.votes.find((v) => v.userId === currentUser.id)
      : null;

    // Calculate candidate rankings & percentages
    const sortedCandidates = [...event.candidates].sort(
      (a, b) => b.votes.length - a.votes.length
    );

    const candidatesFormatted = sortedCandidates.map((c, index) => {
      const votesCount = c.votes.length;
      const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
      const movieRatings = c.movie.ratings || [];
      const avg =
        movieRatings.length > 0
          ? Number(
              (
                movieRatings.reduce((acc, curr) => acc + curr.value, 0) /
                movieRatings.length
              ).toFixed(1)
            )
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
    });

    let winnerMovieFormatted = null;
    if (event.winnerMovie) {
      const wRatings = event.winnerMovie.ratings || [];
      const wAvg =
        wRatings.length > 0
          ? Number(
              (
                wRatings.reduce((acc, curr) => acc + curr.value, 0) /
                wRatings.length
              ).toFixed(1)
            )
          : 0;

      winnerMovieFormatted = {
        id: event.winnerMovie.id,
        title: event.winnerMovie.title,
        originalTitle: event.winnerMovie.originalTitle,
        year: event.winnerMovie.year,
        description: event.winnerMovie.description,
        poster: event.winnerMovie.poster,
        backdrop: event.winnerMovie.backdrop,
        duration: event.winnerMovie.duration,
        director: event.winnerMovie.director,
        cast: event.winnerMovie.cast,
        country: event.winnerMovie.country,
        trailerUrl: event.winnerMovie.trailerUrl,
        createdAt: event.winnerMovie.createdAt.toISOString(),
        genres: event.winnerMovie.genres.map((g) => ({
          id: g.genre.id,
          name: g.genre.name,
          slug: g.genre.slug,
        })),
        averageRating: wAvg,
        ratingCount: wRatings.length,
      };
    }

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        votingDeadline: event.votingDeadline.toISOString(),
        status: event.status,
        winnerMovieId: event.winnerMovieId,
        winnerMovie: winnerMovieFormatted,
        notes: event.notes,
        candidates: candidatesFormatted,
        totalVotes,
        userVotedCandidateId: userVote?.candidateId || null,
      },
    });
  } catch (error) {
    console.error("Get saturday event error:", error);
    return NextResponse.json({ error: "Error al obtener evento de sábado" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Inicia sesión para crear eventos" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saturdayEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos incompletos" },
        { status: 400 }
      );
    }

    const { title, date, votingDeadline, notes } = parsed.data;

    const event = await prisma.saturdayEvent.create({
      data: {
        title,
        date: new Date(date),
        votingDeadline: new Date(votingDeadline),
        status: "VOTING",
        notes: notes || "",
      },
    });

    // Notify users that voting started
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const u of users) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          title: "¡Votación del sábado abierta!",
          message: `Ya comenzó la votación para "${title}". ¡Propón tu candidata o vota ahora!`,
          type: "VOTE",
          link: "/saturday",
        },
      });
    }

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Create saturday event error:", error);
    return NextResponse.json({ error: "Error al crear evento" }, { status: 500 });
  }
}
