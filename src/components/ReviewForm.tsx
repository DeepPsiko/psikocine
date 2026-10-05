"use client";

import React, { useState } from "react";
import { MessageSquare, Send, AlertTriangle } from "lucide-react";
import { useToast } from "./Toast";
import { ReviewItem } from "@/types";

interface ReviewFormProps {
  movieId: string;
  isAuthenticated: boolean;
  onReviewAdded: (newReview: ReviewItem) => void;
}

export default function ReviewForm({
  movieId,
  isAuthenticated,
  onReviewAdded,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast("Debes iniciar sesión para publicar una opinión", "error");
      return;
    }
    if (!content.trim() || content.trim().length < 5) {
      toast("Tu opinión debe tener al menos 5 caracteres", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, hasSpoiler }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al publicar opinión", "error");
        return;
      }

      toast("¡Tu opinión fue publicada!", "success");
      setContent("");
      setHasSpoiler(false);
      onReviewAdded(data.review);
    } catch {
      toast("Error de conexión al enviar opinión", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-psiko-card rounded-2xl p-6 border border-psiko-border text-center">
        <MessageSquare className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">¿Qué te pareció la película?</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Inicia sesión para compartir tu opinión con el grupo de Psikos.
        </p>
        <a
          href="/login"
          className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs rounded-xl transition-colors border border-indigo-500/30"
        >
          Iniciar sesión para comentar
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-psiko-card rounded-2xl p-5 border border-psiko-border space-y-4"
    >
      <div className="flex items-center gap-2 text-white font-bold text-sm">
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <span>Escribe tu opinión</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Comparte qué te gustó, detalles de la dirección, interpretaciones o si la recomiendas al grupo..."
        rows={4}
        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasSpoiler}
            onChange={(e) => setHasSpoiler(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Contiene spoilers
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? "Publicando..." : "Publicar opinión"}</span>
        </button>
      </div>
    </form>
  );
}
