import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { saturdayId, movieId } = await req.json();
    if (!saturdayId || !movieId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const event = await prisma.saturdayEvent.findUnique({
      where: { id: saturdayId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    if (event.status !== "VOTING" && event.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "La etapa para proponer películas ha cerrado" },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json({ error: "Película no encontrada" }, { status: 404 });
    }

    const existingCandidate = await prisma.saturdayCandidate.findUnique({
      where: {
        saturdayId_movieId: {
          saturdayId,
          movieId,
        },
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { error: "Esta película ya fue propuesta como candidata para este sábado" },
        { status: 400 }
      );
    }

    const candidate = await prisma.saturdayCandidate.create({
      data: {
        saturdayId,
        movieId,
        proposedById: user.id,
      },
      include: {
        movie: true,
        proposedBy: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Candidata agregada",
        message: `Tu propuesta "${movie.title}" fue agregada exitosamente a la votación del sábado.`,
        type: "SUCCESS",
        link: "/saturday",
      },
    });

    return NextResponse.json({ success: true, candidate }, { status: 201 });
  } catch (error) {
    console.error("Propose candidate error:", error);
    return NextResponse.json({ error: "Error al proponer película" }, { status: 500 });
  }
}
