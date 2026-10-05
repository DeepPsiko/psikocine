import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { movieSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;
    const currentUser = await getSessionUser();

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
        reviews: {
          where: { isHidden: false },
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                role: true,
              },
            },
            likes: true,
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        favorites: currentUser
          ? {
              where: { userId: currentUser.id },
            }
          : false,
        watchlists: currentUser
          ? {
              where: { userId: currentUser.id },
            }
          : false,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: "Película no encontrada" }, { status: 404 });
    }

    // Ratings calculation
    const ratingCount = movie.ratings.length;
    const totalScore = movie.ratings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

    // Rating distribution
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

    // Attach user rating to their reviews
    const formattedReviews = movie.reviews.map((rev) => {
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

    return NextResponse.json({
      movie: {
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
        reviews: formattedReviews,
      },
    });
  } catch (error) {
    console.error("Get movie detail error:", error);
    return NextResponse.json({ error: "Error al obtener la película" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Inicia sesión para modificar películas" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = movieSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const { genres, ...movieData } = parsed.data;

    // Delete existing genres relation and recreate
    await prisma.movieGenre.deleteMany({ where: { movieId: params.id } });

    const genreConnections = [];
    for (const gName of genres) {
      let genreRecord = await prisma.genre.findFirst({
        where: { name: { equals: gName } },
      });
      if (!genreRecord) {
        const slug = gName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        genreRecord = await prisma.genre.create({
          data: { name: gName, slug },
        });
      }
      genreConnections.push({ genre: { connect: { id: genreRecord.id } } });
    }

    const updated = await prisma.movie.update({
      where: { id: params.id },
      data: {
        ...movieData,
        genres: {
          create: genreConnections,
        },
      },
    });

    return NextResponse.json({ success: true, movie: updated });
  } catch (error) {
    console.error("Update movie error:", error);
    return NextResponse.json({ error: "Error al actualizar película" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Inicia sesión para eliminar películas" }, { status: 401 });
    }

    await prisma.movie.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete movie error:", error);
    return NextResponse.json({ error: "Error al eliminar película" }, { status: 500 });
  }
}
