"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Lock, Sparkles, AtSign } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      toast("Por favor completa todos los campos", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al registrar la cuenta", "error");
        return;
      }

      toast(`¡Bienvenido a Psikos, ${data.user.name}!`, "success");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/";
      }
    } catch {
      toast("Error de conexión al registrar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-1 group">
            <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Psikos Club
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Únete a Psikos
          </h1>
          <p className="text-xs text-slate-400">
            Regístrate con tu nickname y usuario para votar en el Sábado de Películas.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-psiko-card rounded-3xl p-6 sm:p-8 border border-psiko-border shadow-2xl space-y-4"
        >
          {/* Nickname */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Nickname</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="¿Cómo te dicen? (ej. Diego, Sofi, ElCinéfilo)"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">Es el nombre visible que aparecerá en tus opiniones.</p>
          </div>

          {/* Usuario (@) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Usuario (@)</label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="diego_cine (sin espacios ni símbolos raros)"
                required
                pattern="^[a-zA-Z0-9_]+$"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">Tu identificador único para iniciar sesión.</p>
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creando cuenta..." : "Crear mi cuenta"}</span>
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
