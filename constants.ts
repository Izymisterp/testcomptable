
import { Question, Difficulty } from './types';

// REMPLACEZ CETTE URL PAR VOTRE URL GOOGLE APPS SCRIPT RÉELLE
export const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwLi4Ly833wiK0ql5zTBD1YHrjxl0hVQzujOF6BSskxoBjrphJ4-zXNHVKXBFVnXUtA/exec"; 

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Marketplace',
    difficulty: Difficulty.EASY,
    text: "Chez IZYSHOW, quel taux de TVA s'applique généralement sur les locations de salles nues ?",
    options: [
      "Taux normal de 20%",
      "Taux réduit de 5.5%",
      "Exonération de TVA (0%)",
      "Taux de 10% (restauration)"
    ],
    correctAnswer: 2,
    explanation: "Les locations de salles nues sont exonérées de TVA."
  },
  {
    id: 2,
    category: 'Marketplace',
    difficulty: Difficulty.MEDIUM,
    text: "Une salle est affichée à 1000€. L'artiste paie 5% de frais de service en plus. Quel est le montant TTC payé par l'artiste ?",
    options: ["1000€", "1005€", "1050€", "1100€"],
    correctAnswer: 2,
    explanation: "1000€ + 5% = 1050€."
  },
  {
    id: 3,
    category: 'Clôture',
    difficulty: Difficulty.EASY,
    text: "Un artiste paie en ligne le 28 décembre pour une location qui aura lieu le 10 janvier. Au 31 décembre, cet encaissement est :",
    options: [
      "Un produit de l'exercice (CA)",
      "Un produit constaté d'avance (PCA)",
      "Une charge à payer",
      "Une facture à établir"
    ],
    correctAnswer: 1,
    explanation: "La prestation n'ayant pas eu lieu, c'est un PCA."
  },
  {
    id: 4,
    category: 'Marketplace',
    difficulty: Difficulty.MEDIUM,
    text: "IZYSHOW prend 10% de commission sur le prix de la salle (1000€). Quel est le Chiffre d'Affaires net pour IZYSHOW ?",
    options: ["1000€", "100€", "10€", "900€"],
    correctAnswer: 1,
    explanation: "Le CA est uniquement la commission de mise en relation : 1000 * 10% = 100€."
  },
  {
    id: 5,
    category: 'Stripe',
    difficulty: Difficulty.EASY,
    text: "En comptabilité, le compte de trésorerie 'Stripe' (en attente de virement vers la banque) se rapproche de quel type de compte ?",
    options: [
      "Un compte client (411)",
      "Un compte de banque ou fonds en transit (517/580)",
      "Un compte de charge (627)",
      "Un compte de capital (101)"
    ],
    correctAnswer: 1,
    explanation: "Stripe est un compte de disponibilité monétaire."
  },
  {
    id: 6,
    category: 'Fiscalité',
    difficulty: Difficulty.MEDIUM,
    text: "IZYSHOW facture 100€ de commission. Quel est le montant de la TVA collectée par IZYSHOW sur cette commission ?",
    options: ["0€ (Exonéré)", "20€ (Taux 20%)", "5.50€", "10€"],
    correctAnswer: 1,
    explanation: "La commission de service est soumise au taux normal de 20%."
  },
  {
    id: 7,
    category: 'Clôture',
    difficulty: Difficulty.MEDIUM,
    text: "Que signifie le lettrage en comptabilité pour un stagiaire chez IZYSHOW ?",
    options: [
      "Écrire des lettres aux clients",
      "Relier un encaissement (Stripe) à une facture client précise",
      "Calculer la TVA",
      "Supprimer les factures impayées"
    ],
    correctAnswer: 1,
    explanation: "Le lettrage permet de pointer les factures payées."
  },
  {
    id: 8,
    category: 'Marketplace',
    difficulty: Difficulty.EASY,
    text: "Dans une marketplace, les fonds destinés au propriétaire de la salle sont appelés :",
    options: [
      "Chiffre d'affaires propre",
      "Fonds pour compte de tiers",
      "Bénéfice net",
      "Dividendes"
    ],
    correctAnswer: 1,
    explanation: "IZYSHOW encaisse pour le loueur, c'est une dynamique de dette envers lui."
  },
  {
    id: 9,
    category: 'Clôture',
    difficulty: Difficulty.MEDIUM,
    text: "Une facture d'assurance de 1200€ est payée en juin pour 12 mois. À la clôture au 31 décembre, quel est le montant du PCA ?",
    options: ["0€", "1200€", "600€", "100€"],
    correctAnswer: 2,
    explanation: "6 mois sur 12 concernent l'exercice suivant (600€)."
  },
  {
    id: 10,
    category: 'Stripe',
    difficulty: Difficulty.MEDIUM,
    text: "Pourquoi le solde affiché sur le tableau de bord Stripe au 31/12 peut différer du virement bancaire reçu le 03/01 ?",
    options: [
      "Stripe a volé l'argent",
      "Il y a un délai de virement (payout delay)",
      "C'est une erreur de calcul",
      "Le taux de change a changé"
    ],
    correctAnswer: 1,
    explanation: "Le transfert vers la banque prend généralement quelques jours."
  },
  {
    id: 11,
    category: 'Fiscalité',
    difficulty: Difficulty.EASY,
    text: "Quel est le document légal qui permet de déduire la TVA sur un achat ?",
    options: [
      "Un ticket de carte bleue",
      "Une facture en bonne et due forme",
      "Un devis",
      "Un bon de commande"
    ],
    correctAnswer: 1,
    explanation: "Seule la facture originale permet la déduction de TVA."
  },
  {
    id: 12,
    category: 'Marketplace',
    difficulty: Difficulty.MEDIUM,
    text: "Si un artiste annule et est remboursé à 50%, comment IZYSHOW doit traiter sa commission ?",
    options: [
      "L'annuler totalement",
      "La conserver sur la base des 50% restants",
      "La doubler",
      "La passer en perte et profit"
    ],
    correctAnswer: 1,
    explanation: "La commission est généralement calculée sur le montant final retenu."
  },
  {
    id: 13,
    category: 'Clôture',
    difficulty: Difficulty.HARD,
    text: "Qu'est-ce qu'une Facture Non Parvenue (FNP) ?",
    options: [
      "Une facture perdue par la poste",
      "Une charge de l'exercice dont la facture n'est pas encore reçue",
      "Une facture que le client refuse de payer",
      "Une facture sans TVA"
    ],
    correctAnswer: 1,
    explanation: "On doit provisionner les charges connues même sans la facture physique."
  },
  {
    id: 14,
    category: 'Marketplace',
    difficulty: Difficulty.MEDIUM,
    text: "L'artiste paie un supplément de 5% pour le 'Service plateforme'. Ces 5% sont :",
    options: [
      "Un pourboire pour le loueur",
      "Un complément de revenus pour IZYSHOW",
      "Une taxe gouvernementale",
      "Un dépôt de garantie"
    ],
    correctAnswer: 1,
    explanation: "Ce sont des frais de service qui s'ajoutent au CA d'IZYSHOW."
  },
  {
    id: 15,
    category: 'Stripe',
    difficulty: Difficulty.EASY,
    text: "Les commissions que Stripe prélève sur chaque transaction sont pour IZYSHOW :",
    options: [
      "Des produits financiers",
      "Des charges (frais bancaires)",
      "Des impôts",
      "Des immobilisations"
    ],
    correctAnswer: 1,
    explanation: "Les frais de transaction sont des charges d'exploitation."
  },
  {
    id: 16,
    category: 'Clôture',
    difficulty: Difficulty.MEDIUM,
    text: "Quel compte est utilisé pour enregistrer la TVA collectée sur les ventes ?",
    options: ["44571", "44566", "401", "512"],
    correctAnswer: 0,
    explanation: "44571 est le compte classique de TVA collectée."
  },
  {
    id: 17,
    category: 'Marketplace',
    difficulty: Difficulty.EASY,
    text: "Chez IZYSHOW, le loueur de la salle reçoit quel montant si la salle est à 1000€ et la commission IZY est de 10% ?",
    options: ["1000€", "1100€", "900€", "950€"],
    correctAnswer: 2,
    explanation: "1000€ - 10% de commission = 900€ pour le loueur."
  },
  {
    id: 18,
    category: 'Fiscalité',
    difficulty: Difficulty.HARD,
    text: "Une entreprise peut-elle récupérer la TVA sur les frais de réception (repas) ?",
    options: [
      "Non, jamais",
      "Oui, si c'est pour l'intérêt de l'entreprise",
      "Uniquement le dimanche",
      "Seulement si le montant est < 10€"
    ],
    correctAnswer: 1,
    explanation: "La TVA sur les repas d'affaires est déductible sous conditions."
  },
  {
    id: 19,
    category: 'Clôture',
    difficulty: Difficulty.MEDIUM,
    text: "Que signifie 'équilibrer un bilan' ?",
    options: [
      "Avoir autant d'argent en banque qu'en caisse",
      "Avoir un Actif égal au Passif",
      "Ne pas avoir de dettes",
      "Avoir 0€ de bénéfice"
    ],
    correctAnswer: 1,
    explanation: "Le total de l'Actif doit toujours être égal au total du Passif."
  },
  {
    id: 20,
    category: 'Clôture',
    difficulty: Difficulty.EASY,
    text: "Le Grand Livre comptable regroupe :",
    options: [
      "Les photos des employés",
      "L'historique de tous les comptes utilisés",
      "Uniquement les factures d'achat",
      "L'adresse des clients"
    ],
    correctAnswer: 1,
    explanation: "Le Grand Livre détaille les mouvements de chaque compte."
  }
];

export const TIME_PER_QUESTION = 45; // seconds
