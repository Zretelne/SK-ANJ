import { GoogleGenAI, Type } from "@google/genai";

export interface AIResponse {
  english: string;
  sentence: string;
  sentenceFront: string;
}

const LANG_MAP: Record<string, string> = {
  'en': 'English',
  'de': 'German',
  'es': 'Spanish',
  'it': 'Italian',
  'fr': 'French',
  'ru': 'Russian'
};

export class AIService {
  private static getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API kľúč nie je nastavený. Skontrolujte .env súbor.");
    }
    return new GoogleGenAI({ apiKey });
  }

  static async generateTranslation(slovakWord: string, targetLangCode: string = 'en'): Promise<AIResponse> {
    const ai = this.getAI();
    const targetLanguage = LANG_MAP[targetLangCode] || 'English';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the Slovak word "${slovakWord}" to ${targetLanguage}. 
        1. Provide the translation in ${targetLanguage}.
        2. Create a simple, short example sentence in ${targetLanguage} using that word.
        3. Provide the Slovak translation of that example sentence.
        The sentence should help understand the context.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              english: {
                type: Type.STRING,
                description: `The ${targetLanguage} translation of the word.`,
              },
              sentence: {
                type: Type.STRING,
                description: `A simple example sentence in ${targetLanguage} containing the translated word.`,
              },
              sentenceFront: {
                type: Type.STRING,
                description: `The Slovak translation of the example sentence.`,
              },
            },
            required: ["english", "sentence", "sentenceFront"],
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