import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json({ error: "Opinión no encontrada" }, { status: 404 });
    }

    if (review.userId !== user.id) {
      return NextResponse.json({ error: "No puedes editar esta opinión" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        content: parsed.data.content,
        hasSpoiler: parsed.data.hasSpoiler,
      },
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
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
      },
    });

    const userRating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId: updated.userId,
          movieId: updated.movieId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        userRating: userRating?.value || null,
        likesCount: updated.likes.length,
        hasLiked: updated.likes.some((l) => l.userId === user.id),
        replies: updated.replies.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Error al actualizar opinión" }, { status: 500 });
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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json({ error: "Opinión no encontrada" }, { status: 404 });
    }

    if (review.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta opinión" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Error al eliminar opinión" }, { status: 500 });
  }
}
