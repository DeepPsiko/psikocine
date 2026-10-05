"use client";

import React, { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

interface SpoilerBlockProps {
  content: string;
  hasSpoiler: boolean;
}

export default function SpoilerBlock({ content, hasSpoiler }: SpoilerBlockProps) {
  const [revealed, setRevealed] = useState(!hasSpoiler);

  if (!hasSpoiler || revealed) {
    return (
      <div className="relative">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{content}</p>
        {hasSpoiler && (
          <button
            onClick={() => setRevealed(false)}
            className="mt-2 text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" /> Ocultar spoiler de nuevo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 my-2 text-center flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4" />
        <span>Contiene Spoilers</span>
      </div>
      <p className="text-xs text-slate-400 max-w-sm">
        Esta opinión contiene revelaciones importantes sobre la trama de la película.
      </p>
      <button
        onClick={() => setRevealed(true)}
        className="mt-1 px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/40"
      >
        <Eye className="w-3.5 h-3.5" /> Mostrar contenido
      </button>
    </div>
  );
}
