import { GoogleGenAI, Type } from "@google/genai";

export interface AIResponse {
  english: string;
  sentence: string;
}

export class AIService {
  static async generateTranslation(slovakWord: string): Promise<AIResponse> {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API kľúč nie je nastavený. Skontrolujte .env súbor.");
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the Slovak word "${slovakWord}" to English and provide a simple, short example sentence in English using that word. The sentence should help understand the context.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              english: {
                type: Type.STRING,
                description: 'The English translation of the word.',
              },
              sentence: {
                type: Type.STRING,
                description: 'A simple example sentence in English containing the translated word.',
              },
            },
            required: ["english", "sentence"],
          },
        },
      });

      let text = response.text;
      if (!text) throw new Error("No response from AI");

      // CLEANING: Remove markdown code blocks if present (common issue with LLMs)
      text = text.replace(/```json\n?|```/g, '').trim();
      
      return JSON.parse(text) as AIResponse;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  }
}