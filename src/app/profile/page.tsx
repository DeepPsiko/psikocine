"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, ArrowLeft, Upload, Trash2, Crop, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { SafeUser } from "@/types";
import UserAvatar from "@/components/UserAvatar";
import ImageCropModal from "@/components/ImageCropModal";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");

  // Crop modal states
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setName(data.user.name || "");
          setUsername(data.user.username || "");
          setAvatar(data.user.avatar || "");
          setBio(data.user.bio || "");
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate that it is an image
    if (!file.type.startsWith("image/")) {
      toast("Por favor selecciona un archivo de imagen válido", "error");
      return;
    }

    // Limit maximum raw file size to 15MB before cropping
    if (file.size > 15 * 1024 * 1024) {
      toast("La imagen es demasiado pesada (máximo 15MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawImageForCrop(reader.result);
        setIsCropOpen(true);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input value so selecting the same file again triggers change
    e.target.value = "";
  };

  const handleCropComplete = (croppedBase64: string) => {
    setAvatar(croppedBase64);
    toast("Foto encuadrada correctamente. Guarda los cambios para confirmar.", "info");
  };

  const handleRemovePhoto = () => {
    setAvatar("");
    toast("Foto eliminada. Se usará la letra inicial de tu nombre.", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      toast("El nombre y usuario son obligatorios", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, avatar, bio }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al actualizar perfil", "error");
        return;
      }

      toast("¡Perfil y foto guardados con éxito!", "success");

      // Notify Navbar and components to reload user
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }

      router.push(`/users/${data.user.username}`);
      router.refresh();
    } catch {
      toast("Error de conexión al guardar cambios", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link
          href={`/users/${user?.username}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mi perfil
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Editar Perfil</h1>
        <p className="text-xs text-slate-400 mt-1">
          Personaliza tu identidad en la plataforma de Psikos Cine.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-psiko-card rounded-3xl p-6 sm:p-8 border border-psiko-border shadow-xl space-y-6"
      >
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          {/* Avatar Preview */}
          <div className="relative group">
            <UserAvatar
              src={avatar}
              name={name || user?.name || "Psiko"}
              className="w-24 h-24 text-3xl border-2 border-indigo-500/50 shadow-xl"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-full border border-slate-900 text-white shadow-lg transition-transform hover:scale-110"
              title="Cargar foto desde tus archivos"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Avatar Actions */}
          <div className="flex-1 w-full space-y-3 text-center sm:text-left">
            <div>
              <label className="text-xs font-bold text-slate-200">Foto de Perfil</label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {avatar
                  ? "Tienes una foto personalizada cargada. Puedes reajustarla o cambiarla."
                  : "Actualmente se muestra la letra inicial de tu nombre con el estilo Índigo."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cargar desde mis archivos</span>
              </button>

              {avatar && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRawImageForCrop(avatar);
                      setIsCropOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Crop className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Acomodar círculo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Usar inicial</span>
                  </button>
                </>
              )}
            </div>

            {/* Optional URL Input if user prefers a direct link */}
            <div className="pt-2">
              <input
                type="text"
                value={avatar.startsWith("data:") ? "" : avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="O pega una URL de imagen externa..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Name and Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Nombre completo / Nickname</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Nombre de usuario (@)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              pattern="^[a-zA-Z0-9_]+$"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Biografía cinéfila</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Tus directores favoritos, géneros predilectos o frases célebres..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[10px] text-slate-500 text-right">{bio.length} / 300 caracteres</p>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando en base de datos..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </form>

      {/* Circle Image Cropper Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setIsCropOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
