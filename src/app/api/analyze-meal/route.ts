import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PROMPT = `Analyze this meal photo and provide a nutritional breakdown. Respond ONLY with a valid JSON object in this exact format:
{
  "calories": <total calories as number>,
  "protein": <grams of protein as number>,
  "carbs": <grams of carbohydrates as number>,
  "fat": <grams of fat as number>,
  "fiber": <grams of fiber as number>,
  "description": "<brief 1-2 sentence description of the meal>",
  "foods": [
    { "name": "<food item>", "portion": "<estimated portion>", "calories": <calories as number> }
  ],
  "confidence": "<high|medium|low>"
}

Be as accurate as possible based on the visual. If the image is not of food, return all numbers as 0 and explain in the description.`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType: mediaType || "image/jpeg" } },
      PROMPT,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse response");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Meal analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze meal" }, { status: 500 });
  }
}
EOF