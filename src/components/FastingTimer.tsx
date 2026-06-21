"use client";
import { useState, useEffect } from "react";
import { FastingSession } from "@/lib/types";
const FASTING_GOALS = [12, 14, 16, 18, 20, 24];
export default function FastingTimer({ session, onStart, onStop }: { session: FastingSession | null; onStart: (h: number) => void; onStop: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [targetHours, setTargetHours] = useState(16);
  useEffect(() => {
    if (!session) { setElapsed(0); return; }
    const update = () => setElapsed(Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000));
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, [session]);
  const fmt = (s: number) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = session ? Math.min((elapsed / (session.targetHours * 3600)) * 100, 100) : 0;
  const circ = 2 * Math.PI * 54;
  return (
    <div className="bg-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-center relative">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#334155" strokeWidth="10" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={pct >= 100 ? "#10b981" : "#8b5cf6"} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute text-center"><p className="text-2xl font-mono font-bold">{session ? fmt(elapsed) : "00:00:00"}</p><p className="text-slate-500 text-xs">{session ? `/ ${session.targetHours}h goal` : "ready"}</p></div>
      </div>
      {!session ? (
        <div className="space-y-3">
          <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Target Fast</p><div className="flex gap-2 flex-wrap">{FASTING_GOALS.map((h) => (<button key={h} onClick={() => setTargetHours(h)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${targetHours === h ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>{h}h</button>))}</div></div>
          <button onClick={() => onStart(targetHours)} className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-all">🚀 Start Fasting</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-700/50 rounded-xl p-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Started</span><span>{new Date(session.startTime).toLocaleTimeString()}</span></div>
            <div className="flex justify-between mt-1"><span className="text-slate-400">Goal end</span><span>{new Date(new Date(session.startTime).getTime() + session.targetHours*3600000).toLocaleTimeString()}</span></div>
            <div className="flex justify-between mt-1"><span className="text-slate-400">Progress</span><span className={pct >= 100 ? "text-emerald-400 font-semibold" : ""}>{pct >= 100 ? "✓ Complete!" : `${Math.floor(pct)}%`}</span></div>
          </div>
          <button onClick={onStop} className="w-full py-3 rounded-xl bg-red-600/80 hover:bg-red-600 font-semibold transition-all">Stop Fast</button>
        </div>
      )}
    </div>
  );
}
