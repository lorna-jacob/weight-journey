"use client";
import { MealEntry } from "@/lib/types";
export default function DailySummary({ meals, dailyCalorieGoal }: { meals: MealEntry[]; dailyCalorieGoal: number }) {
  const todayMeals = meals.filter((m) => new Date(m.date).toDateString() === new Date().toDateString());
  const totals = todayMeals.reduce((acc, m) => ({ calories: acc.calories + m.analysis.calories, protein: acc.protein + m.analysis.protein, carbs: acc.carbs + m.analysis.carbs, fat: acc.fat + m.analysis.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const pct = Math.min((totals.calories / dailyCalorieGoal) * 100, 100);
  const remaining = dailyCalorieGoal - totals.calories;
  if (todayMeals.length === 0) return (<div className="bg-slate-800/50 rounded-2xl p-5 text-center text-slate-500"><p className="text-2xl mb-2">🍽️</p><p>No meals logged today. Upload your first meal!</p></div>);
  return (
    <div className="bg-slate-800 rounded-2xl p-5 space-y-5">
      <div>
        <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Daily Calories</span><span className="text-slate-300">{totals.calories} / {dailyCalorieGoal} kcal</span></div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} /></div>
        <p className={`text-xs mt-1.5 ${remaining < 0 ? "text-red-400" : "text-slate-500"}`}>{remaining < 0 ? `${Math.abs(remaining)} kcal over goal` : `${remaining} kcal remaining`}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">{[{label:"Protein",value:totals.protein,unit:"g",color:"text-blue-400"},{label:"Carbs",value:totals.carbs,unit:"g",color:"text-amber-400"},{label:"Fat",value:totals.fat,unit:"g",color:"text-red-400"}].map((m) => (<div key={m.label} className="bg-slate-700/50 rounded-xl p-3"><p className={`text-lg font-bold ${m.color}`}>{m.value}{m.unit}</p><p className="text-slate-500 text-xs">{m.label}</p></div>))}</div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Today&apos;s Meals</p>
        <div className="space-y-2">{todayMeals.map((meal) => (<div key={meal.id} className="flex items-center gap-3 bg-slate-700/40 rounded-xl p-2.5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={meal.imageUrl} alt="meal" className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="text-sm font-medium capitalize">{meal.mealType}</p><p className="text-slate-500 text-xs truncate">{meal.analysis.description}</p></div><div className="text-right"><p className="text-sm font-semibold text-orange-400">{meal.analysis.calories}</p><p className="text-slate-500 text-xs">kcal</p></div></div>))}</div>
      </div>
    </div>
  );
}
