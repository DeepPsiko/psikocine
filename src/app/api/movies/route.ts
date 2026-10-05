import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { movieSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const genre = searchParams.get("genre") || "";
    const yearFrom = searchParams.get("yearFrom") ? parseInt(searchParams.get("yearFrom")!) : undefined;
    const yearTo = searchParams.get("yearTo") ? parseInt(searchParams.get("yearTo")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const sort = searchParams.get("sort") || "newly_added";

    const currentUser = await getSessionUser();

    // Build Prisma where filter
    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { originalTitle: { contains: q } },
        { director: { contains: q } },
        { cast: { contains: q } },
      ];
    }

    if (genre) {
      where.genres = {
        some: {
          genre: {
            OR: [
              { slug: genre.toLowerCase() },
              { name: { equals: genre } },
            ],
          },
        },
      };
    }

    if (yearFrom || yearTo) {
      where.year = {};
      if (yearFrom) where.year.gte = yearFrom;
      if (yearTo) where.year.lte = yearTo;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "recent") orderBy = { year: "desc" };
    if (sort === "oldest") orderBy = { year: "asc" };

    const moviesRaw = await prisma.movie.findMany({
      where,
      orderBy,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        ratings: true,
        reviews: {
          select: { id: true },
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

    // Format and calculate ratings
    let movies = moviesRaw.map((m) => {
      const ratingCount = m.ratings.length;
      const totalScore = m.ratings.reduce((acc, curr) => acc + curr.value, 0);
      const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

      const userRating = currentUser
        ? m.ratings.find((r) => r.userId === currentUser.id)?.value || null
        : null;

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
        userRating,
        isFavorite,
        inWatchlist,
        isWatched,
      };
    });

    // Filter by minRating if specified
    if (minRating) {
      movies = movies.filter((m) => m.averageRating >= minRating);
    }

    // Secondary sorts for aggregated fields
    if (sort === "top_rated") {
      movies.sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount);
    } else if (sort === "most_voted") {
      movies.sort((a, b) => b.ratingCount - a.ratingCount || b.averageRating - a.averageRating);
    } else if (sort === "most_reviewed") {
      movies.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return NextResponse.json({ movies });
  } catch (error) {
    console.error("Get movies error:", error);
    return NextResponse.json({ error: "Error al obtener películas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Inicia sesión para agregar una película." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = movieSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos incompletos" },
        { status: 400 }
      );
    }

    const { genres, ...movieData } = parsed.data;

    // Connect or create genres
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

    const movie = await prisma.movie.create({
      data: {
        ...movieData,
        genres: {
          create: genreConnections,
        },
      },
      include: {
        genres: { include: { genre: true } },
      },
    });

    return NextResponse.json({ success: true, movie }, { status: 201 });
  } catch (error) {
    console.error("Create movie error:", error);
    return NextResponse.json({ error: "Error al agregar película" }, { status: 500 });
  }
}
