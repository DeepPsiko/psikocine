import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

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
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Opinión inválida" },
        { status: 400 }
      );
    }

    const { content, hasSpoiler } = parsed.data;

    const review = await prisma.review.create({
      data: {
        content,
        hasSpoiler,
        userId: user.id,
        movieId: params.id,
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
      },
    });

    const userRating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: params.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        createdAt: review.createdAt.toISOString(),
        userRating: userRating?.value || null,
        likesCount: 0,
        hasLiked: false,
        replies: [],
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Error al publicar opinión" }, { status: 500 });
  }
}
