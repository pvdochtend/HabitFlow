
import { GoogleGenAI, Type } from "@google/genai";
import { Habit } from "../types";

// Always use the injected process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHabitSuggestions = async (goal: string, language: string = 'nl') => {
  const langPrompt = language === 'nl' ? 'Nederlands' : 'English';
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 specific, small, and actionable habits for someone with this goal: "${goal}". 
               IMPORTANT: Provide all text (name, description, category) in ${langPrompt}. 
               Return them as a JSON array of objects with 'name', 'description', 'category', and 'color' (hex).`,
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
  
  return JSON.parse(response.text || "[]");
};

export const getWeeklyInsight = async (habits: Habit[], language: string = 'nl') => {
  if (habits.length === 0) {
    return language === 'nl' ? "Voeg je eerste gewoonte toe om aan de slag te gaan!" : "Add your first habit to get started!";
  }
  
  const langPrompt = language === 'nl' ? 'Nederlands' : 'English';
  const habitsSummary = habits.map(h => ({
    name: h.name,
    completionsCount: h.completedDates.length,
    streak: h.streak
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these user habits and their recent performance: ${JSON.stringify(habitsSummary)}. 
               Provide a short, motivational coaching insight (2 sentences max) in ${langPrompt}.`,
  });

  return response.text;
};
