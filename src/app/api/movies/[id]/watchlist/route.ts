import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { toggleWatched } = body;

    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: params.id,
        },
      },
    });

    if (toggleWatched) {
      if (existing) {
        const updated = await prisma.watchlist.update({
          where: { id: existing.id },
          data: { isWatched: !existing.isWatched },
        });
        return NextResponse.json({
          inWatchlist: true,
          isWatched: updated.isWatched,
        });
      } else {
        const created = await prisma.watchlist.create({
          data: {
            userId: user.id,
            movieId: params.id,
            isWatched: true,
          },
        });
        return NextResponse.json({
          inWatchlist: true,
          isWatched: created.isWatched,
        });
      }
    }

    // Normal watchlist toggle
    if (existing) {
      await prisma.watchlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ inWatchlist: false, isWatched: false });
    } else {
      await prisma.watchlist.create({
        data: {
          userId: user.id,
          movieId: params.id,
          isWatched: false,
        },
      });
      return NextResponse.json({ inWatchlist: true, isWatched: false });
    }
  } catch (error) {
    console.error("Watchlist toggle error:", error);
    return NextResponse.json({ error: "Error al actualizar watchlist" }, { status: 500 });
  }
}
