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

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: params.id,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          movieId: params.id,
        },
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json({ error: "Error al actualizar favoritos" }, { status: 500 });
  }
}
