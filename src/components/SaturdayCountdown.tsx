"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SaturdayCountdownProps {
  deadline: string | Date;
  onFinish?: () => void;
}

export default function SaturdayCountdown({ deadline, onFinish }: SaturdayCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

  useEffect(() => {
    const targetDate = new Date(deadline).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
        if (onFinish) onFinish();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isFinished: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, onFinish]);

  if (timeLeft.isFinished) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
        <Clock className="w-4 h-4" /> Votación finalizada
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 min-w-[50px]">
        <span className="text-lg font-black text-indigo-400 leading-none">{timeLeft.days}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Días</span>
      </div>
      <span className="text-slate-600 font-bold">:</span>
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 min-w-[50px]">
        <span className="text-lg font-black text-white leading-none">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Horas</span>
      </div>
      <span className="text-slate-600 font-bold">:</span>
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 min-w-[50px]">
        <span className="text-lg font-black text-white leading-none">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Min</span>
      </div>
      <span className="text-slate-600 font-bold">:</span>
      <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 min-w-[50px]">
        <span className="text-lg font-black text-rose-400 leading-none">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Seg</span>
      </div>
    </div>
  );
}
