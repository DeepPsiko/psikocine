"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Film,
  Calendar,
  Trophy,
  Users,
  Menu,
  X,
  Bookmark,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  LogIn,
  ChevronDown,
  Sparkles,
  Plus,
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import UserAvatar from "./UserAvatar";
import { SafeUser } from "@/types";

interface NavbarProps {
  initialUser?: SafeUser | null;
}

export default function Navbar({ initialUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(initialUser ?? null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize auth state with server
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handleAuthChange = () => fetchUser();
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("focus", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("focus", handleAuthChange);
    };
  }, [fetchUser, pathname]);

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
    }
  }, [initialUser]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignored
    } finally {
      setUser(null);
      setIsUserMenuOpen(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
      }
    }
  };

  const navLinks = [
    { href: "/", label: "Inicio", icon: Sparkles },
    { href: "/movies", label: "Películas", icon: Film },
    { href: "/saturday", label: "Sábado de Películas", icon: Calendar },
    { href: "/rankings", label: "Rankings", icon: Trophy },
    { href: "/users", label: "Usuarios", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-psiko-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                Psikos Club
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-indigo-400 bg-indigo-500/10 shadow-sm shadow-indigo-500/10 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: Notifications & User or Login */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/movies/new"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Película</span>
                </Link>

                <NotificationsDropdown />

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-800/70 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200"
                  >
                    <UserAvatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                      className="border border-indigo-500/50"
                    />
                    <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl p-2 z-50 border border-slate-800 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-800/80">
                        <p className="text-xs text-slate-400">Conectado como</p>
                        <p className="text-sm font-semibold text-white truncate">@{user.username}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`/users/${user.username}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-indigo-400" />
                          Mi Perfil
                        </Link>

                        <Link
                          href="/movies/new"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4 text-indigo-400" />
                          Agregar Película
                        </Link>

                        <Link
                          href="/watchlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-rose-400" />
                          Mi Watchlist
                        </Link>

                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 rounded-xl transition-colors font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-400" />
                          Panel de Control
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-800/80">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-950/40 transition-all duration-200"
                >
                  Unirse a Psikos
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationsDropdown />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-psiko-darker/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                    isActive
                      ? "text-indigo-400 bg-indigo-500/10 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-5 h-5 opacity-80" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    className="w-9 h-9 text-sm border border-indigo-500/50"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">@{user.username}</p>
                  </div>
                </div>

                <Link
                  href={`/users/${user.username}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  Mi Perfil
                </Link>

                <Link
                  href="/movies/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-indigo-400 font-semibold rounded-xl hover:bg-indigo-500/10"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Película
                </Link>

                <Link
                  href="/watchlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white rounded-xl"
                >
                  <Bookmark className="w-4 h-4 text-rose-400" />
                  Mi Watchlist
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-indigo-400 rounded-xl"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Panel de Control
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-slate-200 bg-slate-800/80 rounded-xl"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white rounded-xl"
                >
                  Unirse a Psikos
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
