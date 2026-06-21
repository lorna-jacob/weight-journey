"use client";
import { useState, useEffect } from "react";
import MealLogger from "@/components/MealLogger";
import DailySummary from "@/components/DailySummary";
import FastingTimer from "@/components/FastingTimer";
import WeightTracker from "@/components/WeightTracker";
import { MealEntry, WeightEntry, FastingSession } from "@/lib/types";
type Tab = "meals" | "fasting" | "weight";
const DAILY_CALORIE_GOAL = 1800;
export default function Home() {
  const [tab, setTab] = useState<Tab>("meals");
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [fasting, setFasting] = useState<FastingSession | null>(null);
  useEffect(() => {
    try {
      const m = localStorage.getItem("wj_meals");
      const w = localStorage.getItem("wj_weights");
      const f = localStorage.getItem("wj_fasting");
      if (m) setMeals(JSON.parse(m));
      if (w) setWeights(JSON.parse(w));
      if (f) setFasting(JSON.parse(f));
    } catch {}
  }, []);
  const addMeal = (entry: MealEntry) => { const u = [entry, ...meals]; setMeals(u); localStorage.setItem("wj_meals", JSON.stringify(u)); };
  const addWeight = (entry: WeightEntry) => { const u = [entry, ...weights]; setWeights(u); localStorage.setItem("wj_weights", JSON.stringify(u)); };
  const startFast = (targetHours: number) => { const s: FastingSession = { id: Date.now().toString(), startTime: new Date().toISOString(), targetHours }; setFasting(s); localStorage.setItem("wj_fasting", JSON.stringify(s)); };
  const stopFast = () => { setFasting(null); localStorage.removeItem("wj_fasting"); };
  const todayMeals = meals.filter((m) => new Date(m.date).toDateString() === new Date().toDateString());
  const todayCalories = todayMeals.reduce((a, m) => a + m.analysis.calories, 0);
  const tabs = [{ id: "meals" as Tab, label: "Meals", icon: "🍽️" }, { id: "fasting" as Tab, label: "Fasting", icon: "⏱️" }, { id: "weight" as Tab, label: "Weight", icon: "⚖️" }];
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-md mx-auto px-4 pb-24">
        <div className="pt-12 pb-6">
          <h1 className="text-2xl font-bold">Weight Journey</h1>
          <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-3 text-center"><p className="text-orange-400 font-bold text-lg">{todayCalories}</p><p className="text-slate-500 text-xs">kcal today</p></div>
          <div className="bg-slate-800 rounded-xl p-3 text-center"><p className="text-violet-400 font-bold text-lg">{todayMeals.length}</p><p className="text-slate-500 text-xs">meals</p></div>
          <div className="bg-slate-800 rounded-xl p-3 text-center"><p className={`font-bold text-lg ${fasting ? "text-emerald-400" : "text-slate-500"}`}>{fasting ? "ON" : "OFF"}</p><p className="text-slate-500 text-xs">fasting</p></div>
        </div>
        {tab === "meals" && (<div className="space-y-4"><DailySummary meals={meals} dailyCalorieGoal={DAILY_CALORIE_GOAL} /><div className="bg-slate-800 rounded-2xl p-5"><h2 className="font-semibold mb-4">Log a Meal</h2><MealLogger onMealLogged={addMeal} /></div></div>)}
        {tab === "fasting" && (<div className="space-y-4"><FastingTimer session={fasting} onStart={startFast} onStop={stopFast} /><div className="bg-slate-800/50 rounded-2xl p-4 text-sm text-slate-400 space-y-1.5"><p className="font-medium text-slate-300">💡 Fasting tips</p><p>• Stay hydrated — water, black coffee, and tea are fine</p><p>• 16:8 (16h fast, 8h eating) is a great starting point</p><p>• Break your fast with a protein-rich meal</p></div></div>)}
        {tab === "weight" && (<WeightTracker entries={weights} onAdd={addWeight} />)}
      </div>
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800">
        <div className="max-w-md mx-auto flex">
          {tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-4 flex flex-col items-center gap-1 text-xs font-medium transition-all ${tab === t.id ? "text-violet-400" : "text-slate-500 hover:text-slate-300"}`}><span className="text-xl">{t.icon}</span>{t.label}</button>))}
        </div>
      </nav>
    </div>
  );
}
