export interface MacroAnalysis {
  calories: number; protein: number; carbs: number; fat: number; fiber: number;
  description: string;
  foods: { name: string; portion: string; calories: number }[];
  confidence: "high" | "medium" | "low";
}
export interface MealEntry {
  id: string; date: string; imageUrl: string; analysis: MacroAnalysis;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}
export interface WeightEntry { id: string; date: string; weight: number; unit: "kg" | "lbs"; }
export interface FastingSession { id: string; startTime: string; endTime?: string; targetHours: number; }
