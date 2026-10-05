"use client";

import React, { useState } from "react";
import { Star, Trash2, Check } from "lucide-react";
import { useToast } from "./Toast";
import { RatingDistribution } from "@/types";

interface RatingWidgetProps {
  movieId: string;
  initialRating?: number | null;
  averageRating: number;
  ratingCount: number;
  distribution?: RatingDistribution[];
  isAuthenticated: boolean;
  onRatingChanged?: (newAvg: number, newCount: number, userRating: number | null) => void;
}

export default function RatingWidget({
  movieId,
  initialRating = null,
  averageRating,
  ratingCount,
  distribution = [],
  isAuthenticated,
  onRatingChanged,
}: RatingWidgetProps) {
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number | null>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const stars = [1, 2, 3, 4, 5];

  const handleRate = async (value: number) => {
    if (!isAuthenticated) {
      toast("Debes iniciar sesión para calificar", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/movies/${movieId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al calificar", "error");
        return;
      }

      setUserRating(value);
      toast(`¡Calificado con ${value} estrellas!`, "success");
      if (onRatingChanged) {
        onRatingChanged(data.averageRating, data.ratingCount, value);
      }
    } catch {
      toast("Error de conexión al guardar tu voto", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!isAuthenticated || userRating === null) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/movies/${movieId}/rate`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al eliminar calificación", "error");
        return;
      }

      setUserRating(null);
      toast("Calificación eliminada", "info");
      if (onRatingChanged) {
        onRatingChanged(data.averageRating, data.ratingCount, null);
      }
    } catch {
      toast("Error al eliminar calificación", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border">
      {/* Header with Average */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-white">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 5</span>
            <div className="flex items-center text-amber-400 ml-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Basado en {ratingCount} {ratingCount === 1 ? "calificación" : "calificaciones"} de Psikos
          </p>
        </div>

        {/* User rating interactive area */}
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-xs font-medium text-slate-400 mb-1">
            {userRating ? "Tu calificación:" : "Califica esta película:"}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {stars.map((star) => {
                const activeValue = hoverRating !== null ? hoverRating : userRating || 0;
                const isFilled = star <= activeValue;

                return (
                  <button
                    key={star}
                    disabled={loading}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRate(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 hover:scale-125 transition-transform disabled:opacity-50"
                    title={`Calificar con ${star} estrellas`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        isFilled ? "fill-amber-400 text-amber-400" : "text-slate-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {userRating !== null && (
              <button
                onClick={handleDeleteRating}
                disabled={loading}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                title="Eliminar mi calificación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {userRating !== null && (
            <span className="text-[11px] text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Has votado {userRating} estrellas
            </span>
          )}
        </div>
      </div>

      {/* Distribution Bars */}
      {distribution && distribution.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Distribución de votos
          </p>
          {distribution.map((dist) => (
            <div key={dist.star} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-slate-400 font-medium flex items-center gap-1 justify-end">
                {dist.star} <Star className="w-3 h-3 fill-amber-400/80 text-amber-400/80" />
              </span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-400 font-medium">
                {dist.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
