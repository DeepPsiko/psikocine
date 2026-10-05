import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getSessionUser();
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    if (adminUser.id === params.id) {
      return NextResponse.json({ error: "No puedes bloquearte a ti mismo" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { isBlocked: !targetUser.isBlocked },
    });

    return NextResponse.json({ success: true, isBlocked: updated.isBlocked });
  } catch (error) {
    console.error("Block user error:", error);
    return NextResponse.json({ error: "Error al bloquear/desbloquear usuario" }, { status: 500 });
  }
}
