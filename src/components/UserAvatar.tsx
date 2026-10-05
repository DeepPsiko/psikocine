"use client";

import React, { useState, useEffect } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
  "2xl": "w-28 sm:w-32 h-28 sm:h-32 text-4xl sm:text-5xl",
};

export default function UserAvatar({
  src,
  name,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // If the src changes, reset error state
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = (name || "P").trim().charAt(0).toUpperCase() || "P";
  const defaultSizeClass = sizeClasses[size] || sizeClasses.md;

  // Check if src is a stock unsplash image from old versions, or if it is empty/null
  const isStockUnsplash =
    src && src.includes("images.unsplash.com/photo-1535713875002");
  const isValidSrc = src && src.trim().length > 0 && !isStockUnsplash && !hasError;

  if (isValidSrc) {
    return (
      <div
        className={`relative inline-block rounded-full overflow-hidden shrink-0 select-none ${defaultSizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name || "Avatar"}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none font-black text-white bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 shadow-md ${defaultSizeClass} ${className}`}
      title={name || "Usuario"}
      aria-label={name || "Usuario"}
    >
      <span className="leading-none drop-shadow-sm">{initial}</span>
    </div>
  );
}
