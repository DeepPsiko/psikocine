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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let selectedWinnerId = body.winnerMovieId;

    const event = await prisma.saturdayEvent.findUnique({
      where: { id: params.id },
      include: {
        candidates: {
          include: { votes: true, movie: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // If no winnerMovieId was manually provided, calculate candidate with most votes
    if (!selectedWinnerId && event.candidates.length > 0) {
      const sorted = [...event.candidates].sort(
        (a, b) => b.votes.length - a.votes.length
      );
      selectedWinnerId = sorted[0].movieId;
    }

    const updated = await prisma.saturdayEvent.update({
      where: { id: params.id },
      data: {
        status: "FINISHED",
        winnerMovieId: selectedWinnerId || null,
        notes: body.notes !== undefined ? body.notes : event.notes,
      },
      include: {
        winnerMovie: true,
      },
    });

    // Notify all users about the winner
    if (updated.winnerMovie) {
      const users = await prisma.user.findMany({ select: { id: true } });
      for (const u of users) {
        await prisma.notification.create({
          data: {
            userId: u.id,
            title: "🏆 ¡Tenemos película para el sábado!",
            message: `La votación ha concluido. La película ganadora es "${updated.winnerMovie.title}". ¡Prepara las palomitas! 🍿`,
            type: "WINNER",
            link: "/saturday",
          },
        });
      }
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    console.error("Finish saturday error:", error);
    return NextResponse.json({ error: "Error al cerrar votación" }, { status: 500 });
  }
}
