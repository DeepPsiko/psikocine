import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const { name, username, avatar, bio } = parsed.data;

    // Check if new username is already taken by someone else
    if (username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Este nombre de usuario ya está en uso" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        username: username.toLowerCase(),
        avatar: avatar !== undefined ? (avatar && avatar.trim() ? avatar : null) : user.avatar,
        bio: bio || "",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        bio: updated.bio,
        role: updated.role,
        isBlocked: updated.isBlocked,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
