"use client";
import { useState, useRef, useCallback } from "react";
import { MacroAnalysis, MealEntry } from "@/lib/types";
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export default function MealLogger({ onMealLogged }: { onMealLogged: (e: MealEntry) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>("lunch");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MacroAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setMediaType(file.type); setAnalysis(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, [handleFile]);
  const analyze = async () => {
    if (!preview) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/analyze-meal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: preview.split(",")[1], mediaType }) });
      if (!res.ok) throw new Error();
      const data: MacroAnalysis = await res.json();
      setAnalysis(data);
      onMealLogged({ id: Date.now().toString(), date: new Date().toISOString(), imageUrl: preview, analysis: data, mealType });
    } catch { setError("Failed to analyze the meal. Please try again."); }
    finally { setLoading(false); }
  };
  const reset = () => { setPreview(null); setAnalysis(null); setError(null); };
  const cc: Record<string, string> = { high: "text-emerald-400", medium: "text-yellow-400", low: "text-red-400" };
  const mc: Record<string, string> = { orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400", blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400", amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400", red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400" };
  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">{MEAL_TYPES.map((t) => (<button key={t} onClick={() => setMealType(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${mealType === t ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>{t}</button>))}</div>
      {!preview ? (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-violet-500 bg-violet-500/10" : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"}`}>
          <div className="text-5xl mb-4">📸</div><p className="text-slate-300 font-medium">Drop your meal photo here</p><p className="text-slate-500 text-sm mt-1">or click to browse</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Meal" className="w-full max-h-64 object-cover" />
            <button onClick={reset} className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80">✕</button>
          </div>
          {!analysis && (<button onClick={analyze} disabled={loading} className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-semibold transition-all">{loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⟳</span> Analyzing...</span> : "✨ Analyze Macros"}</button>)}
          {error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">{error}</div>}
          {analysis && (
            <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between"><h3 className="font-semibold text-lg">Nutritional Analysis</h3><span className={`text-xs font-medium ${cc[analysis.confidence]}`}>{analysis.confidence} confidence</span></div>
              <p className="text-slate-400 text-sm">{analysis.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[{l:"Calories",v:`${analysis.calories}`,u:"kcal",c:"orange"},{l:"Protein",v:`${analysis.protein}g`,u:"",c:"blue"},{l:"Carbs",v:`${analysis.carbs}g`,u:"",c:"amber"},{l:"Fat",v:`${analysis.fat}g`,u:"",c:"red"}].map((m) => (
                  <div key={m.l} className={`bg-gradient-to-br ${mc[m.c]} border rounded-xl p-3`}><p className="text-slate-400 text-xs">{m.l}</p><p className="text-xl font-bold mt-0.5">{m.v} <span className="text-sm font-normal text-slate-400">{m.u}</span></p></div>
                ))}
              </div>
              {analysis.foods.length > 0 && (<div><p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Food Items</p><div className="space-y-1.5">{analysis.foods.map((f, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-slate-300">{f.name} <span className="text-slate-500">({f.portion})</span></span><span className="text-slate-400">{f.calories} kcal</span></div>))}</div></div>)}
              <button onClick={reset} className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-all">Log Another Meal</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
