"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move } from "lucide-react";

export type CropShape = "circle" | "poster" | "backdrop";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  shape?: CropShape;
  title?: string;
  description?: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  shape = "circle",
  title,
  description,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions configuration by shape
  const config = {
    circle: {
      viewportW: 320,
      viewportH: 320,
      cropW: 250,
      cropH: 250,
      outputW: 360,
      outputH: 360,
      defaultTitle: "Ajustar foto de perfil",
      defaultDesc: "Acomoda y encuadra tu foto dentro del círculo",
    },
    poster: {
      viewportW: 320,
      viewportH: 440,
      cropW: 240,
      cropH: 360, // 2:3 ratio
      outputW: 400,
      outputH: 600,
      defaultTitle: "Ajustar Póster (Vertical 2:3)",
      defaultDesc: "Acomoda y encuadra el póster de la película",
    },
    backdrop: {
      viewportW: 360,
      viewportH: 260,
      cropW: 336,
      cropH: 189, // 16:9 ratio (336 / 189 = 1.777)
      outputW: 800,
      outputH: 450,
      defaultTitle: "Ajustar Fondo / Banner (Horizontal 16:9)",
      defaultDesc: "Acomoda y encuadra la imagen de fondo para la película",
    },
  }[shape];

  const { viewportW, viewportH, cropW, cropH, outputW, outputH } = config;
  const centerX = viewportW / 2;
  const centerY = viewportH / 2;

  // Reset state when new image opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgRef.current = img;
        setImageLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Handle Dragging / Panning (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Dragging (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.8), 3.5));
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset positioning
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Crop and Generate Base64 Image
  const handleCrop = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const isRotated90or270 = rotation === 90 || rotation === 270;
    const currentW = isRotated90or270 ? nh : nw;
    const currentH = isRotated90or270 ? nw : nh;

    // Base scale to cover the cutout
    const baseScale = Math.max(cropW / currentW, cropH / currentH);
    const totalScale = baseScale * zoom;

    const canvas = document.createElement("canvas");
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const scaleFactor = outputW / cropW;

    // Center of canvas
    ctx.translate(outputW / 2, outputH / 2);

    // Apply offset scaled to canvas
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw image centered
    const drawW = nw * totalScale * scaleFactor;
    const drawH = nh * totalScale * scaleFactor;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    // Export compressed JPEG base64
    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  // Compute transform styles for viewport
  const nw = imgRef.current?.naturalWidth || 300;
  const nh = imgRef.current?.naturalHeight || 300;
  const isRotated = rotation === 90 || rotation === 270;
  const currentW = isRotated ? nh : nw;
  const currentH = isRotated ? nw : nh;
  const baseScale = Math.max(cropW / currentW, cropH / currentH);
  const totalScale = baseScale * zoom;

  const modalTitle = title || config.defaultTitle;
  const modalDesc = description || config.defaultDesc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">{modalTitle}</h3>
            <p className="text-xs text-slate-400">{modalDesc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-4 sm:p-5 flex flex-col items-center justify-center bg-slate-950/60 select-none overflow-y-auto">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ width: viewportW, height: viewportH }}
            className={`relative overflow-hidden rounded-2xl bg-black border border-slate-800 touch-none shadow-inner ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* The Image */}
            {imageLoaded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Para recortar"
                draggable={false}
                style={{
                  position: "absolute",
                  left: centerX,
                  top: centerY,
                  width: nw,
                  height: nh,
                  maxWidth: "none",
                  transformOrigin: "center center",
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${totalScale}) rotate(${rotation}deg)`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Mask & Framing Border Overlay */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              viewBox={`0 0 ${viewportW} ${viewportH}`}
            >
              <defs>
                <mask id="crop-mask-unified">
                  <rect width="100%" height="100%" fill="white" />
                  {shape === "circle" ? (
                    <circle cx={centerX} cy={centerY} r={cropW / 2} fill="black" />
                  ) : (
                    <rect
                      x={centerX - cropW / 2}
                      y={centerY - cropH / 2}
                      width={cropW}
                      height={cropH}
                      rx={10}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>

              {/* Shaded backdrop outside cutout */}
              <rect
                width="100%"
                height="100%"
                fill="rgba(10, 15, 30, 0.78)"
                mask="url(#crop-mask-unified)"
              />

              {/* Glowing Indigo Framing Border */}
              {shape === "circle" ? (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={cropW / 2}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="opacity-90"
                />
              ) : (
                <rect
                  x={centerX - cropW / 2}
                  y={centerY - cropH / 2}
                  width={cropW}
                  height={cropH}
                  rx={10}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="opacity-90"
                />
              )}
            </svg>

            {/* Helper Hint Badge */}
            <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-sm border border-slate-700/60 text-[10px] text-slate-300 shadow">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>Arrastra para encuadrar</span>
            </div>
          </div>

          {/* Zoom Slider & Controls */}
          <div className="w-full max-w-[340px] mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.8"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.0, z + 0.15))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Quick helper buttons */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Girar 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                Centrar
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-950/40 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar encuadre</span>
          </button>
        </div>
      </div>
    </div>
  );
}
