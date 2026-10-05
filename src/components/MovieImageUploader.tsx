"use client";

import React, { useState, useRef } from "react";
import { Upload, Crop, Trash2, Film, Image as ImageIcon } from "lucide-react";
import ImageCropModal, { CropShape } from "./ImageCropModal";
import { useToast } from "./Toast";

interface MovieImageUploaderProps {
  label: string;
  shape: CropShape; // "poster" | "backdrop"
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}

export default function MovieImageUploader({
  label,
  shape,
  value,
  onChange,
  required = false,
  hint,
}: MovieImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string>("");

  const isPoster = shape === "poster";
  const defaultHint = isPoster
    ? "Formato vertical (2:3). Encuadra el póster oficial."
    : "Formato horizontal (16:9). Fondo o banner de la película.";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Por favor selecciona un archivo de imagen válido", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast("La imagen es demasiado pesada (máximo 20MB)", "error");
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

    e.target.value = "";
  };

  const handleCropComplete = (croppedBase64: string) => {
    onChange(croppedBase64);
    toast(`${isPoster ? "Póster" : "Fondo"} encuadrado y listo.`, "info");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {value && (
          <span className="text-[10px] text-emerald-400 font-medium">✓ Imagen lista</span>
        )}
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        {/* Preview Frame */}
        <div
          className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0 shadow-md ${
            isPoster ? "w-28 h-40" : "w-44 h-28"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1.5 p-2 text-center select-none">
              {isPoster ? (
                <Film className="w-6 h-6 text-slate-700" />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-700" />
              )}
              <span className="text-[10px] font-semibold text-slate-500">
                {isPoster ? "Sin póster" : "Sin fondo"}
              </span>
            </div>
          )}

          {/* Overlay quick buttons when image is present */}
          {value && (
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => {
                  setRawImageForCrop(value);
                  setIsCropOpen(true);
                }}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
                title="Acomodar encuadre"
              >
                <Crop className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow"
                title="Quitar imagen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Controls & Inputs */}
        <div className="flex-1 w-full space-y-2.5">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {hint || defaultHint}
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar de mis archivos</span>
            </button>

            {value && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setRawImageForCrop(value);
                    setIsCropOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Crop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Acomodar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              </>
            )}
          </div>

          {/* Optional web URL input */}
          <div className="pt-0.5">
            <input
              type="text"
              value={value.startsWith("data:") ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="O pega una URL de internet..."
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Interactive Aspect-Ratio Crop Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        imageSrc={rawImageForCrop}
        shape={shape}
        title={isPoster ? "Ajustar Póster (Vertical 2:3)" : "Ajustar Fondo (Horizontal 16:9)"}
        description={
          isPoster
            ? "Mueve y haz zoom para encuadrar la portada de la película"
            : "Mueve y haz zoom para encuadrar el banner panorámico"
        }
        onClose={() => setIsCropOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
