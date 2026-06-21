import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 1024,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } },
        { type: "text", text: 'Analyze this meal photo and provide a nutritional breakdown. Respond ONLY with a valid JSON object:\n{\n  "calories": <number>,\n  "protein": <number>,\n  "carbs": <number>,\n  "fat": <number>,\n  "fiber": <number>,\n  "description": "<1-2 sentences>",\n  "foods": [{ "name": "<food>", "portion": "<portion>", "calories": <number> }],\n  "confidence": "<high|medium|low>"\n}' }
      ]}]
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse response");
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Meal analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze meal" }, { status: 500 });
  }
}
