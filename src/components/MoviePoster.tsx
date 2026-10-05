"use client";

import React, { useState, useEffect } from "react";
import { Film } from "lucide-react";

interface MoviePosterProps {
  src?: string | null;
  title: string;
  year?: number | string;
  className?: string;
  aspectClass?: string;
}

export default function MoviePoster({
  src,
  title,
  year,
  className = "",
  aspectClass = "aspect-[2/3]",
}: MoviePosterProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (src && !hasError) {
    return (
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-slate-900 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${aspectClass} w-full overflow-hidden bg-gradient-to-tr from-slate-950 via-indigo-950/60 to-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
    >
      <Film className="w-10 h-10 text-indigo-400/70 mb-2" />
      <p className="text-xs font-bold text-white line-clamp-2 px-1">{title}</p>
      {year && <span className="text-[10px] text-indigo-300/80 mt-1">{year}</span>}
    </div>
  );
}
