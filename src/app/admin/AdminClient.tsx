"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Film,
  Users,
  MessageSquare,
  Calendar,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Trophy,
  AlertTriangle,
  Lock,
  Unlock,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import UserAvatar from "@/components/UserAvatar";
import { MovieItem, ReviewItem, SafeUser, SaturdayEventItem } from "@/types";
import { formatDate } from "@/lib/utils";

interface AdminClientProps {
  stats: {
    moviesCount: number;
    usersCount: number;
    reviewsCount: number;
    activeVotesCount: number;
    finishedSaturdaysCount: number;
  };
  initialMovies: MovieItem[];
  initialUsers: SafeUser[];
  initialReviews: (ReviewItem & { movieTitle: string })[];
  initialSaturdays: SaturdayEventItem[];
}

export default function AdminClient({
  stats,
  initialMovies,
  initialUsers,
  initialReviews,
  initialSaturdays,
}: AdminClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "MOVIES" | "SATURDAYS" | "REVIEWS" | "USERS">("OVERVIEW");
  const [movies, setMovies] = useState(initialMovies);
  const [users, setUsers] = useState(initialUsers);
  const [reviews, setReviews] = useState(initialReviews);
  const [saturdays, setSaturdays] = useState(initialSaturdays);

  // New Saturday Event form state
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creatingSaturday, setCreatingSaturday] = useState(false);

  // Movie deletion
  const handleDeleteMovie = async (movieId: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/movies/${movieId}`, { method: "DELETE" });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== movieId));
        toast(`Película "${title}" eliminada`, "info");
      } else {
        toast("Error al eliminar película", "error");
      }
    } catch {
      toast("Error de conexión al eliminar", "error");
    }
  };

  // Review deletion
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("¿Eliminar esta opinión permanentemente?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast("Opinión eliminada", "info");
      } else {
        toast("Error al eliminar opinión", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  };

  // Toggle user block
  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? "desbloquear" : "bloquear";
    if (!confirm(`¿Deseas ${action} este usuario?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}/block`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBlocked: data.isBlocked } : u))
        );
        toast(`Usuario ${data.isBlocked ? "bloqueado" : "desbloqueado"}`, "info");
      } else {
        toast(data.error || "Error al cambiar estado", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  };

  // Toggle user role
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const actionText = nextRole === "ADMIN" ? "hacer Administrador a" : "quitar permisos de Admin a";
    if (!confirm(`¿Deseas ${actionText} este usuario?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}/role`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: data.role } : u))
        );
        toast(`Rol cambiado a ${data.role === "ADMIN" ? "Administrador" : "Usuario"}`, "success");
      } else {
        toast(data.error || "Error al cambiar rol", "error");
      }
    } catch {
      toast("Error de conexión al cambiar rol", "error");
    }
  };

  // Close Saturday voting and declare winner
  const handleFinishSaturday = async (saturdayId: string) => {
    if (!confirm("¿Cerrar la votación y declarar la película con más votos como ganadora?")) {
      return;
    }

    try {
      const res = await fetch(`/api/saturday/${saturdayId}/finish`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast("¡Votación cerrada y ganador anunciado con éxito!", "success");
        setSaturdays((prev) =>
          prev.map((s) => (s.id === saturdayId ? { ...s, status: "FINISHED" } : s))
        );
        router.refresh();
      } else {
        toast(data.error || "Error al cerrar votación", "error");
      }
    } catch {
      toast("Error al finalizar votación", "error");
    }
  };

  // Create new Saturday event
  const handleCreateSaturday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newDeadline) {
      toast("Por favor completa los campos requeridos", "error");
      return;
    }

    try {
      setCreatingSaturday(true);
      const res = await fetch("/api/saturday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          date: newDate,
          votingDeadline: newDeadline,
          notes: newNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al crear sábado", "error");
        return;
      }

      toast("¡Sábado de Películas creado y usuarios notificados!", "success");
      setNewTitle("");
      setNewDate("");
      setNewDeadline("");
      setNewNotes("");
      router.refresh();
    } catch {
      toast("Error de conexión al crear sábado", "error");
    } finally {
      setCreatingSaturday(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Admin Title */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400">
              PANEL DE CONTROL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Administración de Psikos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión de catálogo, moderación de opiniones, organización de sábados y usuarios.
          </p>
        </div>

        <Link
          href="/admin/movies/new"
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar nueva película
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-colors ${
            activeTab === "OVERVIEW"
              ? "bg-psiko-card text-indigo-400 border-t border-x border-slate-800"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Resumen General
        </button>

        <button
          onClick={() => setActiveTab("MOVIES")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-colors ${
            activeTab === "MOVIES"
              ? "bg-psiko-card text-indigo-400 border-t border-x border-slate-800"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Películas ({movies.length})
        </button>

        <button
          onClick={() => setActiveTab("SATURDAYS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-colors ${
            activeTab === "SATURDAYS"
              ? "bg-psiko-card text-indigo-400 border-t border-x border-slate-800"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Sábados ({saturdays.length})
        </button>

        <button
          onClick={() => setActiveTab("REVIEWS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-colors ${
            activeTab === "REVIEWS"
              ? "bg-psiko-card text-indigo-400 border-t border-x border-slate-800"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Moderación ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-colors ${
            activeTab === "USERS"
              ? "bg-psiko-card text-indigo-400 border-t border-x border-slate-800"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Usuarios ({users.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-indigo-400" /> Películas
              </span>
              <p className="text-3xl font-black text-white">{stats.moviesCount}</p>
            </div>

            <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" /> Usuarios
              </span>
              <p className="text-3xl font-black text-white">{stats.usersCount}</p>
            </div>

            <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Opiniones
              </span>
              <p className="text-3xl font-black text-white">{stats.reviewsCount}</p>
            </div>

            <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-400" /> Votaciones
              </span>
              <p className="text-3xl font-black text-white">{stats.activeVotesCount}</p>
            </div>

            <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> Sábados Hechos
              </span>
              <p className="text-3xl font-black text-white">{stats.finishedSaturdaysCount}</p>
            </div>
          </div>

          <div className="bg-psiko-card rounded-3xl p-6 border border-psiko-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" /> Acciones Rápidas de Administración
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/admin/movies/new"
                className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all group"
              >
                <Plus className="w-5 h-5 text-indigo-400 mb-1" />
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400">
                  Agregar Película
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registra un nuevo título con sinopsis, poster y detalles
                </p>
              </Link>

              <button
                onClick={() => setActiveTab("SATURDAYS")}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all group text-left"
              >
                <Calendar className="w-5 h-5 text-rose-400 mb-1" />
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400">
                  Crear Votación
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Abre la convocatoria para el siguiente Sábado de Películas
                </p>
              </button>

              <button
                onClick={() => setActiveTab("REVIEWS")}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all group text-left"
              >
                <MessageSquare className="w-5 h-5 text-sky-400 mb-1" />
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400">
                  Moderar Opiniones
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Revisa comentarios de usuarios o elimina spam
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIES MANAGEMENT */}
      {activeTab === "MOVIES" && (
        <div className="bg-psiko-card rounded-3xl border border-psiko-border overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Catálogo de Películas ({movies.length})</h3>
            <Link
              href="/admin/movies/new"
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 flex items-center gap-1 shadow-md shadow-indigo-950/40"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar película
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Película</th>
                  <th className="p-4">Director</th>
                  <th className="p-4">Año</th>
                  <th className="p-4">Calificación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-10 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div>
                        <Link
                          href={`/movies/${m.id}`}
                          className="font-bold text-white hover:text-indigo-400"
                        >
                          {m.title}
                        </Link>
                        <p className="text-[10px] text-slate-500">{m.genres.map((g) => g.name).join(", ")}</p>
                      </div>
                    </td>
                    <td className="p-4">{m.director}</td>
                    <td className="p-4">{m.year}</td>
                    <td className="p-4 font-bold text-amber-400">
                      ⭐ {m.averageRating > 0 ? m.averageRating.toFixed(1) : "—"} ({m.ratingCount})
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/movies/${m.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg inline-block"
                        title="Editar película"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteMovie(m.id, m.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg inline-block"
                        title="Eliminar película"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SATURDAY EVENTS MANAGEMENT */}
      {activeTab === "SATURDAYS" && (
        <div className="space-y-8">
          {/* Create new Saturday Event */}
          <form
            onSubmit={handleCreateSaturday}
            className="bg-psiko-card rounded-3xl p-6 border border-psiko-border space-y-4 shadow-xl"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Crear Nueva Convocatoria de Sábado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título del Evento</label>
                <input
                  type="text"
                  placeholder="ej. Sábado de Películas #43"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Fecha del Sábado (Noche)</label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Límite para Votar</label>
                <input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Notas / Mensaje para el grupo</label>
              <input
                type="text"
                placeholder="ej. Esta semana toca maratón de ciencia ficción clásica..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={creatingSaturday}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 disabled:opacity-50 transition-colors"
            >
              {creatingSaturday ? "Creando..." : "Crear Convocatoria y Notificar"}
            </button>
          </form>

          {/* List of Saturday events */}
          <div className="bg-psiko-card rounded-3xl border border-psiko-border p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Eventos de Sábado Registrados</h3>
            <div className="space-y-3">
              {saturdays.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{s.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          s.status === "VOTING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Fecha: {formatDate(s.date)} · Candidatas: {s.candidates.length} · Votos: {s.totalVotes}
                    </p>
                    {s.winnerMovie && (
                      <p className="text-xs text-amber-400 font-bold mt-1">
                        🏆 Ganador: {s.winnerMovie.title}
                      </p>
                    )}
                  </div>

                  {s.status === "VOTING" && (
                    <button
                      onClick={() => handleFinishSaturday(s.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                    >
                      Cerrar Votación y Confirmar Ganador
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS MODERATION */}
      {activeTab === "REVIEWS" && (
        <div className="bg-psiko-card rounded-3xl border border-psiko-border p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Moderación de Opiniones ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">{rev.user.name}</span>
                    <span className="text-slate-500">@{rev.user.username}</span>
                    <span className="text-slate-500">sobre</span>
                    <span className="font-semibold text-indigo-400">{rev.movieTitle}</span>
                    {rev.hasSpoiler && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                        Spoiler
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.content}</p>
                </div>

                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                  title="Eliminar comentario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === "USERS" && (
        <div className="bg-psiko-card rounded-3xl border border-psiko-border overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Usuarios del Club ({users.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <UserAvatar
                        src={u.avatar}
                        name={u.name}
                        size="sm"
                        className="border border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white">{u.name}</span>
                        <p className="text-[10px] text-slate-500">@{u.username}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          <Shield className="w-3 h-3 text-indigo-400" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          Usuario
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.isBlocked ? (
                        <span className="text-rose-400 font-bold">Bloqueado</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Activo</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                          u.role === "ADMIN"
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                            : "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30"
                        }`}
                        title={u.role === "ADMIN" ? "Cambiar a Usuario normal" : "Ascender a Administrador"}
                      >
                        {u.role === "ADMIN" ? "Quitar Admin" : "Hacer Admin"}
                      </button>
                      <button
                        onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                        className={`p-1.5 rounded-lg inline-block ${
                          u.isBlocked
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-rose-400 hover:bg-rose-500/10"
                        }`}
                        title={u.isBlocked ? "Desbloquear" : "Bloquear"}
                      >
                        {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
