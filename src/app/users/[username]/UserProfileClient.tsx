"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Eye,
  Bookmark,
  Star,
  Film,
  MessageSquare,
  Calendar,
  Settings,
} from "lucide-react";
import MovieCard from "@/components/MovieCard";
import ReviewCard from "@/components/ReviewCard";
import UserAvatar from "@/components/UserAvatar";
import { MovieItem, ReviewItem, SafeUser } from "@/types";
import { formatDate } from "@/lib/utils";

interface UserProfileClientProps {
  profileUser: SafeUser & {
    averageGiven: string;
    ratingsCount: number;
    watchedCount: number;
    reviewsCount: number;
  };
  currentUser: SafeUser | null;
  favorites: MovieItem[];
  watched: MovieItem[];
  pending: MovieItem[];
  topRated: MovieItem[];
  reviews: ReviewItem[];
}

export default function UserProfileClient({
  profileUser,
  currentUser,
  favorites,
  watched,
  pending,
  topRated,
  reviews: initialReviews,
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"FAVORITES" | "WATCHED" | "PENDING" | "TOP_RATED" | "REVIEWS">("FAVORITES");
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Profile Header Card */}
      <div className="bg-psiko-card rounded-3xl p-6 sm:p-8 border border-psiko-border shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
          {/* Avatar */}
          <UserAvatar
            src={profileUser.avatar}
            name={profileUser.name}
            size="2xl"
            className="border-4 border-indigo-500/40 shadow-xl"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {profileUser.name}
                  </h1>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">@{profileUser.username}</p>
              </div>

              {isOwnProfile && (
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 self-center sm:self-auto"
                >
                  <Settings className="w-3.5 h-3.5" /> Editar Perfil
                </Link>
              )}
            </div>

            {profileUser.bio && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {profileUser.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Miembro desde {formatDate(profileUser.createdAt)}
              </span>
            </div>

            {/* Quick Metrics (Section 11 Example) */}
            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl font-black text-white flex items-center justify-center gap-1">
                  <Film className="w-4 h-4 text-slate-400" />
                  {profileUser.ratingsCount}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                  Películas calificadas
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {profileUser.averageGiven}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                  Promedio de votos
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl font-black text-white flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  {profileUser.watchedCount}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                  Películas vistas
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xl font-black text-white flex items-center justify-center gap-1">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  {profileUser.reviewsCount}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                  Opiniones dejadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Section 12: Favoritas, Vistas, Pendientes, Mejor calificadas, Opiniones) */}
      <div className="space-y-6">
        <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("FAVORITES")}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "FAVORITES"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favoritas ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("WATCHED")}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "WATCHED"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Vistas ({watched.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "PENDING"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Pendientes ({pending.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("TOP_RATED")}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "TOP_RATED"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Mejor Calificadas ({topRated.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("REVIEWS")}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "REVIEWS"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Opiniones ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === "FAVORITES" && (
          <div>
            {favorites.length === 0 ? (
              <div className="bg-psiko-card rounded-2xl p-10 text-center border border-psiko-border text-slate-400 text-xs">
                {profileUser.name} no ha añadido películas a sus favoritas todavía.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {favorites.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "WATCHED" && (
          <div>
            {watched.length === 0 ? (
              <div className="bg-psiko-card rounded-2xl p-10 text-center border border-psiko-border text-slate-400 text-xs">
                No hay películas marcadas como vistas.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watched.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "PENDING" && (
          <div>
            {pending.length === 0 ? (
              <div className="bg-psiko-card rounded-2xl p-10 text-center border border-psiko-border text-slate-400 text-xs">
                No hay películas en lista de pendientes.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pending.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "TOP_RATED" && (
          <div>
            {topRated.length === 0 ? (
              <div className="bg-psiko-card rounded-2xl p-10 text-center border border-psiko-border text-slate-400 text-xs">
                Aún no ha calificado películas.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {topRated.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "REVIEWS" && (
          <div className="space-y-4 max-w-3xl">
            {reviews.length === 0 ? (
              <div className="bg-psiko-card rounded-2xl p-10 text-center border border-psiko-border text-slate-400 text-xs">
                No hay opiniones publicadas todavía.
              </div>
            ) : (
              reviews.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  currentUser={currentUser}
                  onReviewDeleted={(id) => setReviews((prev) => prev.filter((r) => r.id !== id))}
                  onReviewUpdated={(up) => setReviews((prev) => prev.map((r) => r.id === up.id ? up : r))}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
