"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Lock, AtSign } from "lucide-react";
import { useToast } from "@/components/Toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast("Ingresa tu usuario y contraseña", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al iniciar sesión", "error");
        return;
      }

      toast(`¡Bienvenido de vuelta, ${data.user.name}!`, "success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = next;
      }
    } catch {
      toast("Error de conexión al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-psiko-card rounded-3xl p-6 sm:p-8 border border-psiko-border shadow-2xl space-y-5"
    >
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Usuario (@)
        </label>
        <div className="relative">
          <AtSign className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ej. tu_usuario"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Contraseña</label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <LogIn className="w-4 h-4" />
        <span>{loading ? "Iniciando sesión..." : "Ingresar"}</span>
      </button>

      <div className="text-center pt-1">
        <p className="text-xs text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Únete a Psikos
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-1 group">
            <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Psikos Club
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-400">
            Ingresa a tu cuenta con tu usuario para calificar, comentar y votar.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-slate-400 py-10">Cargando formulario...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
