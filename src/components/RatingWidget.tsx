"use client";

import React, { useState } from "react";
import { Star, Trash2, Check, Sparkles } from "lucide-react";
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

const STARS = [1, 2, 3, 4, 5];

/**
 * Componente para renderizar una estrella (vacía, mitad, o completa)
 */
function StarGlyph({
  fill,
  sizeClass = "w-7 h-7 sm:w-8 sm:h-8",
  className = "",
}: {
  fill: "full" | "half" | "empty";
  sizeClass?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${sizeClass} ${className} shrink-0 select-none`}>
      {/* Estrella base vacía */}
      <Star className="w-full h-full text-slate-700 stroke-[1.5]" />

      {/* Estrella completa rellena */}
      {fill === "full" && (
        <Star className="absolute inset-0 w-full h-full fill-amber-400 text-amber-400 stroke-[1.5] transition-colors" />
      )}

      {/* Media estrella rellena (cortada al 50%) */}
      {fill === "half" && (
        <div className="absolute inset-0 w-1/2 overflow-hidden pointer-events-none">
          <Star className={`${sizeClass} max-w-none fill-amber-400 text-amber-400 stroke-[1.5] transition-colors`} />
        </div>
      )}
    </div>
  );
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

  const activeValue = hoverRating !== null ? hoverRating : userRating || 0;

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
      toast(`¡Calificado con ${value} ${value === 1 ? "estrella" : "estrellas"}!`, "success");
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

  const getStarFill = (starIndex: number, currentVal: number): "full" | "half" | "empty" => {
    if (currentVal >= starIndex) return "full";
    if (currentVal >= starIndex - 0.5) return "half";
    return "empty";
  };

  return (
    <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border w-full overflow-hidden space-y-4">
      {/* 1. Cabecera con Promedio General */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-white">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ 5</span>
          <div className="flex items-center gap-0.5 ml-1">
            {STARS.map((s) => {
              const roundedAvg = Math.round(averageRating * 2) / 2;
              const fill =
                roundedAvg >= s ? "full" : roundedAvg >= s - 0.5 ? "half" : "empty";
              return (
                <StarGlyph
                  key={s}
                  fill={fill}
                  sizeClass="w-4 h-4"
                />
              );
            })}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Basado en {ratingCount} {ratingCount === 1 ? "calificación" : "calificaciones"} de Psikos
        </p>
      </div>

      {/* 2. Zona de Calificación del Usuario */}
      <div className="pb-4 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {hoverRating !== null ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Votar: {hoverRating} {hoverRating === 1 ? "estrella" : "estrellas"}
              </span>
            ) : userRating !== null ? (
              "Tu calificación:"
            ) : (
              "Califica esta película:"
            )}
          </span>

          {userRating !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                ★ {userRating}
              </span>
              <button
                type="button"
                onClick={handleDeleteRating}
                disabled={loading}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Eliminar mi calificación"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 5 Estrellas Interactivas con Soporte de Mitad */}
        <div
          className="flex items-center justify-center gap-1 sm:gap-2 bg-slate-900/70 py-3 px-2 rounded-2xl border border-slate-800"
          onMouseLeave={() => setHoverRating(null)}
        >
          {STARS.map((star) => {
            const fill = getStarFill(star, activeValue);

            return (
              <div key={star} className="relative group/star p-0.5">
                {/* Visual de la estrella */}
                <StarGlyph
                  fill={fill}
                  sizeClass="w-8 h-8 sm:w-9 sm:h-9"
                  className="transition-transform group-hover/star:scale-110"
                />

                {/* Mitad Izquierda (media estrella: star - 0.5) */}
                <button
                  type="button"
                  disabled={loading}
                  onMouseEnter={() => setHoverRating(star - 0.5)}
                  onClick={() => handleRate(star - 0.5)}
                  className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                  title={`${star - 0.5} estrellas`}
                  aria-label={`Calificar con ${star - 0.5} estrellas`}
                />

                {/* Mitad Derecha (estrella completa: star) */}
                <button
                  type="button"
                  disabled={loading}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => handleRate(star)}
                  className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                  title={`${star} estrellas`}
                  aria-label={`Calificar con ${star} estrellas`}
                />
              </div>
            );
          })}
        </div>

        {userRating !== null && (
          <div className="text-center pt-0.5">
            <span className="text-[11px] text-amber-400/90 font-medium inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Has votado {userRating} {userRating === 1 ? "estrella" : "estrellas"}
            </span>
          </div>
        )}
      </div>

      {/* 3. Barras de Distribución de Votos */}
      {distribution && distribution.length > 0 && (
        <div className="space-y-1.5">
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
              <span className="w-16 text-right text-slate-400 font-medium">
                {dist.percentage}% <span className="text-slate-600 text-[10px]">({dist.count})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
