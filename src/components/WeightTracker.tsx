"use client";
import { useState } from "react";
import { WeightEntry } from "@/lib/types";
export default function WeightTracker({ entries, onAdd }: { entries: WeightEntry[]; onAdd: (e: WeightEntry) => void }) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const handleAdd = () => { const val = parseFloat(weight); if (!val || val <= 0) return; onAdd({ id: Date.now().toString(), date: new Date().toISOString(), weight: val, unit }); setWeight(""); };
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0]; const prev = sorted[1];
  const diff = latest && prev ? latest.weight - prev.weight : null;
  const last7 = sorted.slice(0, 7).reverse();
  const minW = last7.length ? Math.min(...last7.map((e) => e.weight)) : 0;
  const maxW = last7.length ? Math.max(...last7.map((e) => e.weight)) : 1;
  const range = maxW - minW || 1;
  return (
    <div className="bg-slate-800 rounded-2xl p-5 space-y-5">
      {latest && (<div className="text-center"><p className="text-4xl font-bold">{latest.weight}<span className="text-lg text-slate-400 ml-1">{latest.unit}</span></p>{diff !== null && (<p className={`text-sm mt-1 ${diff < 0 ? "text-emerald-400" : diff > 0 ? "text-red-400" : "text-slate-400"}`}>{diff < 0 ? "▼" : diff > 0 ? "▲" : "="} {Math.abs(diff).toFixed(1)}{latest.unit} from last entry</p>)}</div>)}
      {last7.length >= 2 && (<div className="h-20 flex items-end gap-1">{last7.map((e, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-violet-500 rounded-t-sm" style={{ height: `${Math.max(((e.weight-minW)/range)*100, 8)}%` }} title={`${e.weight}${e.unit}`} /><span className="text-slate-600 text-[9px]">{new Date(e.date).getMonth()+1}/{new Date(e.date).getDate()}</span></div>))}</div>)}
      <div className="flex gap-2">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={`Weight in ${unit}`} className="flex-1 bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-500" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <button onClick={() => setUnit(unit === "kg" ? "lbs" : "kg")} className="px-3 py-2.5 bg-slate-700 rounded-xl text-sm font-medium hover:bg-slate-600 transition-all">{unit}</button>
        <button onClick={handleAdd} disabled={!weight} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">Log</button>
      </div>
      {sorted.length > 0 && (<div><p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">History</p><div className="space-y-1.5 max-h-40 overflow-y-auto">{sorted.slice(0,10).map((e) => (<div key={e.id} className="flex justify-between text-sm text-slate-300"><span className="text-slate-500">{new Date(e.date).toLocaleDateString()}</span><span>{e.weight} {e.unit}</span></div>))}</div></div>)}
    </div>
  );
}
