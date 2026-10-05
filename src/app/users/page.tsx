import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Users, Star, Film, MessageSquare, Heart } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

export const metadata: Metadata = {
  title: "Comunidad de Psikos — Miembros",
  description: "Descubre los perfiles y gustos cinéfilos de todos los miembros del grupo Psikos.",
};

export const revalidate = 0;

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { isBlocked: false },
    orderBy: { createdAt: "asc" },
    include: {
      ratings: true,
      reviews: { select: { id: true } },
      favorites: { select: { id: true } },
      watchlists: { select: { id: true, isWatched: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          CINE CLUB PSIKOS
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-400" />
          Comunidad de Psikos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {users.length} {users.length === 1 ? "miembro activo" : "miembros activos"} compartiendo películas cada sábado.
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const ratingCount = user.ratings.length;
          const totalRating = user.ratings.reduce((acc, curr) => acc + curr.value, 0);
          const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "—";
          const watchedCount = user.watchlists.filter((w) => w.isWatched).length;

          return (
            <Link
              key={user.id}
              href={`/users/${user.username}`}
              className="bg-psiko-card rounded-3xl p-6 border border-psiko-border hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    className="w-16 h-16 text-xl border-2 border-slate-700 group-hover:border-indigo-400 transition-colors"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {user.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stats Bar */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <p className="font-black text-white">{ratingCount}</p>
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Votos
                  </p>
                </div>
                <div>
                  <p className="font-black text-white">{watchedCount}</p>
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Film className="w-3 h-3 text-slate-400" /> Vistas
                  </p>
                </div>
                <div>
                  <p className="font-black text-white">{user.reviews.length}</p>
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <MessageSquare className="w-3 h-3 text-sky-400" /> Reseñas
                  </p>
                </div>
                <div>
                  <p className="font-black text-indigo-400">{avgRating}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Promedio</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
