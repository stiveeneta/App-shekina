import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Fallback to empty string if not set, handled in UI

export const getGeminiChatResponse = async (history: string[], message: string): Promise<string> => {
  if (!apiKey) return "Désolé, je ne peux pas me connecter pour le moment (Clé API manquante).";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const systemInstruction = `Tu es l'assistant virtuel de la société Shekina, une entreprise de collecte d'ordures ménagères au Congo Brazzaville (villes : Brazzaville et Pointe-Noire). 
    Tu es poli, professionnel et concis. Tu aides les clients à comprendre les abonnements, les horaires de passage, et les paiements par Mobile Money (MTN, Airtel).
    Réponds toujours en français. Garde les réponses courtes (max 3 phrases).`;

    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `Historique de la conversation: ${history.join('\n')}` }] },
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      }
    });

    return response.text || "Désolé, je n'ai pas compris votre demande.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Une erreur est survenue lors de la communication avec le serveur.";
  }
};

export const getRouteOptimizationAdvice = async (missions: any[]): Promise<string> => {
    if (!apiKey) return "Optimisation non disponible.";

    try {
        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-2.5-flash';
        
        const missionList = missions.map(m => `- ${m.clientName} (${m.address})`).join('\n');
        
        const response = await ai.models.generateContent({
            model,
            contents: `Voici une liste de points de collecte à Brazzaville : \n${missionList}\n. Suggère un itinéraire logique optimisé en une phrase simple.`,
        });
        
        return response.text || "Suivez l'ordre géographique du nord au sud.";
    } catch (e) {
        return "Impossible d'optimiser l'itinéraire pour le moment.";
    }
}