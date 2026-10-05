import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { History, Calendar, Star, Film, ArrowRight, Award } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Historial de Sábados — Psikos",
  description: "Registro cronológico de todas las películas vistas por el grupo Psikos en sus Sábados de Películas.",
};

export const revalidate = 0;

export default async function SaturdayHistoryPage() {
  const events = await prisma.saturdayEvent.findMany({
    where: {
      status: "FINISHED",
      winnerMovieId: { not: null },
    },
    orderBy: { date: "desc" },
    include: {
      winnerMovie: {
        include: {
          genres: { include: { genre: true } },
          ratings: true,
          reviews: { select: { id: true } },
        },
      },
      candidates: {
        include: {
          movie: { select: { id: true, title: true } },
          votes: true,
        },
      },
      votes: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            ARCHIVO HISTÓRICO
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-400" />
            Historial de Sábados
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cada sesión, cada debate y cada obra vista por la comunidad de Psikos.
          </p>
        </div>

        <Link
          href="/saturday"
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/40 transition-opacity self-start sm:self-auto"
        >
          Próximo Sábado 🍿
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-psiko-card rounded-3xl p-12 border border-psiko-border text-center space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay sábados en el historial todavía</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Cuando se complete la primera votación y sesión, aparecerá registrada en esta cronología.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 space-y-10 py-2">
          {events.map((ev, idx) => {
            const movie = ev.winnerMovie;
            if (!movie) return null;

            const rList = movie.ratings || [];
            const avg =
              rList.length > 0
                ? Number((rList.reduce((acc, curr) => acc + curr.value, 0) / rList.length).toFixed(1))
                : 0;

            return (
              <div key={ev.id} className="relative pl-6 sm:pl-8 group">
                {/* Timeline node icon */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-xs shadow-md group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4 text-indigo-400" />
                </div>

                {/* Event Card */}
                <div className="bg-psiko-card rounded-3xl border border-psiko-border p-6 hover:border-psiko-borderLight transition-all shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {ev.title}
                      </span>
                      <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        {formatDate(ev.date)}
                      </h3>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold self-start sm:self-auto">
                      {ev.votes.length} {ev.votes.length === 1 ? "voto emitido" : "votos emitidos"}
                    </span>
                  </div>

                  {/* Movie Winner Preview */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <Link href={`/movies/${movie.id}`} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl border border-slate-700 shadow-md group-hover:border-indigo-400 transition-colors"
                      />
                    </Link>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {movie.genres.map((g) => (
                          <span
                            key={g.genre.id}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {g.genre.name}
                          </span>
                        ))}
                        <span className="text-xs text-slate-400 font-medium">
                          {movie.year} · {formatDuration(movie.duration)}
                        </span>
                      </div>

                      <Link
                        href={`/movies/${movie.id}`}
                        className="text-xl sm:text-2xl font-black text-white hover:text-indigo-400 transition-colors inline-block"
                      >
                        🎬 {movie.title}
                      </Link>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{avg > 0 ? `${avg} / 5` : "Sin calificar"}</span>
                        </div>
                        <span className="text-slate-400">Dirigida por <strong>{movie.director}</strong></span>
                      </div>

                      {ev.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          &quot;{ev.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
                    <span className="text-slate-500">
                      Candidatas participantes: {ev.candidates.map((c) => c.movie.title).join(", ")}
                    </span>
                    <Link
                      href={`/movies/${movie.id}`}
                      className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/link shrink-0 ml-2"
                    >
                      <span>Ver ficha</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
