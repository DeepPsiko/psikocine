import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { replySchema } from "@/lib/validations";

export async function POST(
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
      include: { movie: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Opinión no encontrada" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Respuesta inválida" },
        { status: 400 }
      );
    }

    const reply = await prisma.reviewReply.create({
      data: {
        content: parsed.data.content,
        userId: user.id,
        reviewId: params.id,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    // Notify review owner if different
    if (review.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: review.userId,
          title: "Nueva respuesta",
          message: `${user.name} respondió a tu opinión sobre "${review.movie.title}".`,
          type: "INFO",
          link: `/movies/${review.movieId}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reply: {
        ...reply,
        createdAt: reply.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: "Error al publicar respuesta" }, { status: 500 });
  }
}
