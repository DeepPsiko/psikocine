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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { movie: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Opinión no encontrada" }, { status: 404 });
    }

    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId: user.id,
          reviewId: params.id,
        },
      },
    });

    let liked = false;
    if (existingLike) {
      await prisma.reviewLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      await prisma.reviewLike.create({
        data: {
          userId: user.id,
          reviewId: params.id,
        },
      });
      liked = true;

      // Create notification for review author if not liking own review
      if (review.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: review.userId,
            title: "Nuevo Like",
            message: `A ${user.name} le gustó tu opinión sobre "${review.movie.title}".`,
            type: "SUCCESS",
            link: `/movies/${review.movieId}`,
          },
        });
      }
    }

    const count = await prisma.reviewLike.count({
      where: { reviewId: params.id },
    });

    return NextResponse.json({ liked, likesCount: count });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Error al registrar like" }, { status: 500 });
  }
}
