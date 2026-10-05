import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { saturdayId, candidateId } = await req.json();
    if (!saturdayId || !candidateId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const event = await prisma.saturdayEvent.findUnique({
      where: { id: saturdayId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento de sábado no encontrado" }, { status: 404 });
    }

    if (event.status !== "VOTING") {
      return NextResponse.json({ error: "La votación no está activa actualmente" }, { status: 400 });
    }

    if (new Date() > new Date(event.votingDeadline)) {
      return NextResponse.json(
        { error: "El tiempo límite para votar ha terminado" },
        { status: 400 }
      );
    }

    const candidate = await prisma.saturdayCandidate.findUnique({
      where: { id: candidateId },
      include: { movie: true, proposedBy: true },
    });

    if (!candidate || candidate.saturdayId !== saturdayId) {
      return NextResponse.json({ error: "Candidata inválida para este sábado" }, { status: 400 });
    }

    // Upsert user vote (1 vote per user per SaturdayEvent)
    await prisma.saturdayVote.upsert({
      where: {
        saturdayId_userId: {
          saturdayId,
          userId: user.id,
        },
      },
      update: {
        candidateId,
      },
      create: {
        saturdayId,
        candidateId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      userVotedCandidateId: candidateId,
      message: `Has votado por "${candidate.movie.title}"`,
    });
  } catch (error) {
    console.error("Saturday vote error:", error);
    return NextResponse.json({ error: "Error al registrar voto" }, { status: 500 });
  }
}
