
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMentorFeedback = async (result: AssessmentResult): Promise<string> => {
  const prompt = `
    En tant que Responsable Comptable chez IZYSHOW (une marketplace de location de salles), évalue ce candidat stagiaire (${result.email}).
    
    Règles métier IZYSHOW :
    1. Pas de TVA sur les locations.
    2. Prix final Artiste = Prix Salle + 5%.
    3. Commission IZYSHOW = 10% du prix de la salle.
    4. Stripe : Payouts à 7 jours, unitaires ou groupés.
    
    Résultats du candidat :
    Score: ${result.score}/20
    Détails par catégorie: ${JSON.stringify(result.categoryBreakdown)}
    
    Fournis un feedback constructif en français (environ 100 mots). Analyse s'il a compris la logique spécifique de non-TVA et la gestion des flux Stripe à 7 jours.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Erreur lors de la génération du feedback.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Test terminé. Vos connaissances sur le modèle IZYSHOW (10% commission, pas de TVA) sont en cours d'évaluation.";
  }
};
