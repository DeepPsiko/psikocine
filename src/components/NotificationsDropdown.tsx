"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Film, Heart, MessageSquare, Award } from "lucide-react";
import Link from "next/link";
import { NotificationItem } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {
      // Ignored
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "VOTE":
        return <Film className="w-4 h-4 text-indigo-400" />;
      case "WINNER":
        return <Award className="w-4 h-4 text-emerald-400" />;
      case "SUCCESS":
        return <Heart className="w-4 h-4 text-rose-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Notificaciones
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400/90 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 py-2">
            {loading && notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>No tienes notificaciones pendientes 🍿</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-3 px-2 rounded-xl transition-colors ${
                    !n.isRead ? "bg-indigo-500/10 hover:bg-indigo-500/15" : "hover:bg-slate-800/40"
                  }`}
                >
                  <Link
                    href={n.link || "#"}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3 items-start"
                  >
                    <div className="mt-0.5 p-2 bg-slate-800/80 rounded-lg shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
