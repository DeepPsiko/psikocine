"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Film, Trophy, ArrowRight, Vote, Clock } from "lucide-react";
import SaturdayCountdown from "./SaturdayCountdown";
import { SaturdayEventItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface SaturdayHeroProps {
  event: SaturdayEventItem | null;
}

export default function SaturdayHero({ event }: SaturdayHeroProps) {
  if (!event) {
    return (
      <div className="relative rounded-3xl overflow-hidden border border-psiko-border bg-gradient-to-r from-slate-950 via-psiko-card to-slate-950 p-8 sm:p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
            🎬 SÁBADO DE PELÍCULAS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Qué veremos el próximo sábado?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Aún no se ha programado el próximo evento de votación. Puedes explorar el catálogo de películas o revisar las sesiones anteriores.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/movies"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-950/50 transition-all flex items-center gap-2"
            >
              <Film className="w-4 h-4" /> Explorar catálogo
            </Link>
            <Link
              href="/saturday/history"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-2xl border border-slate-700 transition-all"
            >
              Ver historial de sábados
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFinished = event.status === "FINISHED" && event.winnerMovie;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-psiko-border bg-psiko-card shadow-2xl">
      {/* Background Backdrop if winner or candidate exists */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            event.winnerMovie?.backdrop ||
            event.candidates?.[0]?.movie?.backdrop ||
            "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg"
          }
          alt="Backdrop"
          className="w-full h-full object-cover object-center opacity-25 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-psiko-darker via-psiko-dark/95 to-psiko-darker/90" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Event Info & Titles */}
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                {formatDate(event.date)}
              </span>

              {event.status === "VOTING" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 animate-pulse">
                  <Vote className="w-3.5 h-3.5" /> Votación en curso
                </span>
              )}

              {event.status === "FINISHED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Trophy className="w-3.5 h-3.5" /> Ganador confirmado
                </span>
              )}
            </div>

            {isFinished ? (
              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                  🏆 ESTE SÁBADO VEREMOS
                </p>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
                  {event.winnerMovie?.title}
                </h1>
                <p className="text-sm text-slate-300 mt-2 line-clamp-2 max-w-xl">
                  {event.winnerMovie?.description}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  ¿Qué veremos este sábado?
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Es hora de decidir nuestra próxima película. Revisa las candidatas propuestas por el grupo y deja tu voto.
                </p>
              </div>
            )}

            {/* Countdown when voting is active */}
            {event.status === "VOTING" && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  La votación termina en:
                </p>
                <SaturdayCountdown deadline={event.votingDeadline} />
              </div>
            )}

            {/* Call to action buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/saturday"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-950/50 transition-all flex items-center gap-2 group"
              >
                <span>{event.status === "VOTING" ? "Ver candidatos y votar" : "Detalle del sábado"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {isFinished && event.winnerMovie && (
                <Link
                  href={`/movies/${event.winnerMovie.id}`}
                  className="px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <Film className="w-4 h-4 text-indigo-400" /> Ver ficha de la película
                </Link>
              )}

              <Link
                href="/saturday/history"
                className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Historial de sábados
              </Link>
            </div>
          </div>

          {/* Right Column: Poster preview */}
          {isFinished && event.winnerMovie ? (
            <div className="shrink-0 flex justify-center">
              <Link
                href={`/movies/${event.winnerMovie.id}`}
                className="group relative block w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10 movie-card-hover"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.winnerMovie.poster}
                  alt={event.winnerMovie.title}
                  className="w-full h-full object-cover poster-hover"
                />
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-amber-400 font-bold text-xs border border-amber-500/40 flex items-center gap-1">
                  ⭐ {event.winnerMovie.averageRating > 0 ? event.winnerMovie.averageRating.toFixed(1) : "—"}
                </div>
              </Link>
            </div>
          ) : (
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-slate-800 text-center min-w-[240px]">
              <span className="text-3xl mb-2">🗳️</span>
              <span className="text-2xl font-black text-white">{event.candidates.length}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Candidatas activas
              </span>
              <span className="text-xs text-indigo-400 font-bold mt-2">
                {event.totalVotes} {event.totalVotes === 1 ? "voto registrado" : "votos registrados"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
