import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ratingSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Calificación inválida" },
        { status: 400 }
      );
    }

    const { value } = parsed.data;

    // Upsert rating
    await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: params.id,
        },
      },
      update: { value },
      create: {
        userId: user.id,
        movieId: params.id,
        value,
      },
    });

    // Recalculate movie statistics
    const allRatings = await prisma.rating.findMany({
      where: { movieId: params.id },
    });

    const ratingCount = allRatings.length;
    const totalScore = allRatings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      userRating: value,
      averageRating,
      ratingCount,
    });
  } catch (error) {
    console.error("Rate movie error:", error);
    return NextResponse.json({ error: "Error al guardar calificación" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await prisma.rating.deleteMany({
      where: {
        userId: user.id,
        movieId: params.id,
      },
    });

    const allRatings = await prisma.rating.findMany({
      where: { movieId: params.id },
    });

    const ratingCount = allRatings.length;
    const totalScore = allRatings.reduce((acc, curr) => acc + curr.value, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      averageRating,
      ratingCount,
    });
  } catch (error) {
    console.error("Delete rating error:", error);
    return NextResponse.json({ error: "Error al eliminar calificación" }, { status: 500 });
  }
}
