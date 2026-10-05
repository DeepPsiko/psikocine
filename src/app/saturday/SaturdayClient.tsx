"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Vote,
  Plus,
  Trophy,
  Clock,
  Film,
  Check,
  History,
  Star,
  Sparkles,
} from "lucide-react";
import SaturdayCountdown from "@/components/SaturdayCountdown";
import ProposeMovieModal from "@/components/ProposeMovieModal";
import { useToast } from "@/components/Toast";
import { SaturdayEventItem, SafeUser } from "@/types";
import { formatDate } from "@/lib/utils";

interface SaturdayClientProps {
  initialEvent: SaturdayEventItem | null;
  currentUser: SafeUser | null;
}

export default function SaturdayClient({
  initialEvent,
  currentUser,
}: SaturdayClientProps) {
  const { toast } = useToast();
  const [event, setEvent] = useState<SaturdayEventItem | null>(initialEvent);
  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [votingCandidateId, setVotingCandidateId] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      const res = await fetch("/api/saturday");
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch {
      // Ignored
    }
  };

  const handleVote = async (candidateId: string) => {
    if (!currentUser) {
      toast("Debes iniciar sesión para votar", "error");
      return;
    }
    if (!event) return;

    try {
      setVotingCandidateId(candidateId);
      const res = await fetch("/api/saturday/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saturdayId: event.id,
          candidateId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al votar", "error");
        return;
      }

      toast(data.message || "¡Tu voto ha sido registrado!", "success");
      await fetchEvent();
    } catch {
      toast("Error al registrar voto", "error");
    } finally {
      setVotingCandidateId(null);
    }
  };

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-3xl">
          🍿
        </div>
        <h1 className="text-3xl font-extrabold text-white">Sábado de Películas</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Actualmente no hay ninguna votación activa programada para el próximo sábado.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/movies"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/50"
          >
            Explorar catálogo
          </Link>
          <Link
            href="/saturday/history"
            className="px-6 py-2.5 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700"
          >
            Ver historial
          </Link>
        </div>
      </div>
    );
  }

  const isVotingActive =
    event.status === "VOTING" && new Date() < new Date(event.votingDeadline);
  const isFinished = event.status === "FINISHED" && event.winnerMovie;

  const userVotedCandidate = event.candidates.find(
    (c) => c.id === event.userVotedCandidateId
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍿</span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
              SÁBADO DE PELÍCULAS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span>Fecha del evento: <strong className="text-slate-200">{formatDate(event.date)}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/saturday/history"
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4" /> Historial de sábados
          </Link>

          {isVotingActive && (
            <button
              onClick={() => {
                if (!currentUser) {
                  toast("Inicia sesión para proponer películas", "error");
                  return;
                }
                setIsProposeOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Proponer película
            </button>
          )}
        </div>
      </div>

      {/* WINNER SHOWCASE (When event is finished) */}
      {isFinished && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-psiko-card to-slate-950 p-6 sm:p-10 shadow-2xl glow-gold">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.winnerMovie!.poster}
              alt={event.winnerMovie!.title}
              className="w-44 sm:w-52 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-amber-500/40 shrink-0"
            />
            <div className="space-y-4 text-center md:text-left flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> PELÍCULA GANADORA DEL SÁBADO
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white">
                {event.winnerMovie!.title}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-slate-300">
                <span>{event.winnerMovie!.year}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {event.winnerMovie!.averageRating > 0 ? event.winnerMovie!.averageRating.toFixed(1) : "—"} / 5
                </span>
                <span>·</span>
                <span>Dirigida por {event.winnerMovie!.director}</span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-3">
                {event.winnerMovie!.description}
              </p>
              <div className="pt-2">
                <Link
                  href={`/movies/${event.winnerMovie!.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  <Film className="w-4 h-4" /> Ver ficha y opiniones de la película
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Countdown and Status banner */}
      {isVotingActive && (
        <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Votación en curso
            </span>
            <p className="text-sm font-semibold text-white">
              Vota por la película que más te gustaría ver este sábado
            </p>
            {userVotedCandidate && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Tu voto actual: <strong>{userVotedCandidate.movie.title}</strong> (puedes cambiarlo mientras la votación siga abierta)
              </p>
            )}
          </div>

          <div className="shrink-0">
            <SaturdayCountdown deadline={event.votingDeadline} onFinish={fetchEvent} />
          </div>
        </div>
      )}

      {/* Candidates List with Voting Progress Bars */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white">
              Películas Candidatas ({event.candidates.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Total: <strong>{event.totalVotes}</strong> {event.totalVotes === 1 ? "voto" : "votos"}
          </span>
        </div>

        {event.candidates.length === 0 ? (
          <div className="bg-psiko-card rounded-3xl p-12 border border-psiko-border text-center space-y-4">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Aún no hay candidatas propuestas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sé el primero en proponer una película del catálogo para la votación de este sábado.
            </p>
            {isVotingActive && (
              <button
                onClick={() => setIsProposeOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40"
              >
                + Proponer primera película
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {event.candidates.map((cand) => {
              const isUserVote = event.userVotedCandidateId === cand.id;
              const isLeader = cand.rank === 1 && cand.votesCount > 0;

              return (
                <div
                  key={cand.id}
                  className={`bg-psiko-card rounded-2xl p-4 sm:p-5 border transition-all ${
                    isUserVote
                      ? "border-indigo-500/70 bg-indigo-500/10 shadow-xl shadow-indigo-950/30"
                      : "border-psiko-border hover:border-psiko-borderLight"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Movie poster + Title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xl font-black text-slate-400 w-8 text-center shrink-0">
                        {cand.rank === 1 ? "🥇" : cand.rank === 2 ? "🥈" : cand.rank === 3 ? "🥉" : `#${cand.rank}`}
                      </span>

                      <Link href={`/movies/${cand.movie.id}`} className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cand.movie.poster}
                          alt={cand.movie.title}
                          className="w-14 sm:w-16 aspect-[2/3] object-cover rounded-xl border border-slate-700 hover:border-indigo-400 transition-colors"
                        />
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={`/movies/${cand.movie.id}`}
                          className="text-base sm:text-lg font-bold text-white hover:text-indigo-400 transition-colors truncate block"
                        >
                          {cand.movie.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {cand.movie.year} · Dirigida por {cand.movie.director}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          Propuesta por <strong className="text-slate-300">@{cand.proposedBy.username}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Right: Vote counts and Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-right">
                        <p className="text-base font-black text-white">
                          {cand.votesCount} {cand.votesCount === 1 ? "voto" : "votos"}
                        </p>
                        <p className="text-xs text-indigo-400 font-bold">{cand.percentage}%</p>
                      </div>

                      {isVotingActive && (
                        <button
                          onClick={() => handleVote(cand.id)}
                          disabled={votingCandidateId === cand.id}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isUserVote
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                              : "bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-indigo-500/50"
                          }`}
                        >
                          {isUserVote ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Votada</span>
                            </>
                          ) : (
                            <span>Votar</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLeader
                          ? "bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-400 shadow-md shadow-indigo-500/40"
                          : "bg-gradient-to-r from-slate-600 to-slate-500"
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Propose Movie Modal */}
      <ProposeMovieModal
        saturdayId={event.id}
        isOpen={isProposeOpen}
        onClose={() => setIsProposeOpen(false)}
        onCandidateAdded={fetchEvent}
        existingMovieIds={event.candidates.map((c) => c.movieId)}
      />
    </div>
  );
}
