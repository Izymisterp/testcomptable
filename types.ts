
export enum Difficulty {
  EASY = 'Facile',
  MEDIUM = 'Intermédiaire',
  HARD = 'Expert'
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'Marketplace' | 'Fiscalité' | 'Stripe' | 'Clôture';
  difficulty: Difficulty;
}

export interface QuizState {
  userEmail: string;
  currentQuestionIndex: number;
  answers: number[];
  timeLeft: number;
  isFinished: boolean;
  startTime: number | null;
}

export interface AssessmentResult {
  email: string;
  score: number;
  totalQuestions: number;
  categoryBreakdown: Record<string, number>;
  feedback: string;
  date?: string;
}

export interface StoredResult extends AssessmentResult {
  id: string;
  timestamp: number;
}
