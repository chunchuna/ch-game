import { GoogleGenAI, Type } from "@google/genai";
import { TriviaQuestion } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize, but allow app to run even if key is missing (fallback mode)
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateChristmasTrivia = async (): Promise<TriviaQuestion> => {
  if (!ai) {
    // Fallback if no API key
    return {
      question: "Which reindeer has a red nose? (Gemini API Key missing)",
      options: ["Dasher", "Rudolph", "Vixen", "Comet"],
      correctAnswerIndex: 1
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a fun, slightly difficult Christmas trivia question.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 possible answers"
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: "Index of the correct answer (0-3)"
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data as TriviaQuestion;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      question: "What traditional Christmas plant is known for its red berries?",
      options: ["Mistletoe", "Holly", "Ivy", "Poinsettia"],
      correctAnswerIndex: 1
    };
  }
};

export const judgeMiniGame = async (context: string): Promise<string> => {
   if (!ai) return "Nice work!";
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Give a short, 1-sentence festive congratulation for: ${context}`,
     });
     return response.text || "Merry Christmas!";
   } catch (e) {
     return "Merry Christmas!";
   }
}