"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  MessageCircle,
  Star,
  Trash2,
  Edit2,
  CornerDownRight,
  Send,
  X,
  Check,
} from "lucide-react";
import SpoilerBlock from "./SpoilerBlock";
import UserAvatar from "./UserAvatar";
import { ReviewItem, SafeUser } from "@/types";
import { timeAgo } from "@/lib/utils";
import { useToast } from "./Toast";

interface ReviewCardProps {
  review: ReviewItem;
  currentUser: SafeUser | null;
  onReviewDeleted?: (id: string) => void;
  onReviewUpdated?: (updatedReview: ReviewItem) => void;
}

export default function ReviewCard({
  review,
  currentUser,
  onReviewDeleted,
  onReviewUpdated,
}: ReviewCardProps) {
  const { toast } = useToast();
  const [likesCount, setLikesCount] = useState(review.likesCount);
  const [hasLiked, setHasLiked] = useState(review.hasLiked || false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState(review.replies || []);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Edit review state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [editSpoiler, setEditSpoiler] = useState(review.hasSpoiler);
  const [savingEdit, setSavingEdit] = useState(false);

  const isOwner = currentUser?.id === review.userId;

  const handleLike = async () => {
    if (!currentUser) {
      toast("Inicia sesión para dar like", "error");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${review.id}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setHasLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch {
      toast("Error al dar like", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar esta opinión?")) return;

    try {
      const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Opinión eliminada", "info");
        if (onReviewDeleted) onReviewDeleted(review.id);
      } else {
        const data = await res.json();
        toast(data.error || "Error al eliminar", "error");
      }
    } catch {
      toast("Error al eliminar opinión", "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent, hasSpoiler: editSpoiler }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Opinión actualizada", "success");
        setIsEditing(false);
        if (onReviewUpdated) onReviewUpdated(data.review);
      } else {
        toast(data.error || "Error al actualizar", "error");
      }
    } catch {
      toast("Error al guardar cambios", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast("Inicia sesión para responder", "error");
      return;
    }
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplies((prev) => [...prev, data.reply]);
        setReplyContent("");
        setIsReplying(false);
        toast("Respuesta publicada", "success");
      } else {
        toast(data.error || "Error al responder", "error");
      }
    } catch {
      toast("Error al publicar respuesta", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="bg-psiko-card rounded-2xl p-5 border border-psiko-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link href={`/users/${review.user.username}`} className="flex items-center gap-3 group">
          <UserAvatar
            src={review.user.avatar}
            name={review.user.name}
            className="w-10 h-10 text-sm border border-slate-700 group-hover:border-indigo-400 transition-colors"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                {review.user.name}
              </span>
            </div>
            <span className="text-xs text-slate-500">@{review.user.username} · {timeAgo(review.createdAt)}</span>
          </div>
        </Link>

        {/* Rating given by this user */}
        {review.userRating && (
          <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{review.userRating}</span>
          </div>
        )}
      </div>

      {/* Review Content / Edit mode */}
      <div className="mt-3.5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSpoiler}
                  onChange={(e) => setEditSpoiler(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                Contiene spoilers
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-500 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <SpoilerBlock content={review.content} hasSpoiler={review.hasSpoiler} />
        )}
      </div>

      {/* Actions Toolbar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-semibold transition-colors ${
              hasLiked ? "text-rose-500" : "hover:text-white"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}</span>
          </button>
        </div>

        {/* Edit / Delete actions for author */}
        {isOwner && (
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 hover:text-indigo-400 transition-colors"
                title="Editar opinión"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1 hover:text-rose-400 transition-colors"
              title="Eliminar opinión"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Reply input form */}
      {isReplying && (
        <form onSubmit={handleAddReply} className="mt-3 flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escribe una respuesta a esta opinión..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={submittingReply || !replyContent.trim()}
            className="px-3 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Replies list */}
      {replies.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-slate-800 space-y-2.5 pt-1">
          {replies.map((reply) => (
            <div key={reply.id} className="text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 mb-1">
                <CornerDownRight className="w-3 h-3 text-slate-500" />
                <span className="font-semibold text-white">{reply.user.name}</span>
                <span className="text-[10px] text-slate-500">@{reply.user.username} · {timeAgo(reply.createdAt)}</span>
              </div>
              <p className="text-slate-300 pl-5 leading-relaxed">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
