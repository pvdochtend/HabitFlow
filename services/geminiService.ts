
import { GoogleGenAI, Type } from "@google/genai";
import { Habit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getHabitSuggestions = async (goal: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 specific, small, and actionable habits for someone with this goal: "${goal}". Return them as a JSON array of objects with 'name', 'description', 'category', and 'color' (hex).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            color: { type: Type.STRING },
          },
          required: ["name", "description", "category", "color"],
        },
      },
    },
  });
  
  return JSON.parse(response.text);
};

export const getWeeklyInsight = async (habits: Habit[]) => {
  const habitsSummary = habits.map(h => ({
    name: h.name,
    completionsCount: h.completedDates.length,
    streak: h.streak
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these user habits and their recent performance: ${JSON.stringify(habitsSummary)}. Provide a short, motivational coaching insight (2 sentences max).`,
  });

  return response.text;
};
