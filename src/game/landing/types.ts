import type { ReactNode } from "react";

export type LandingStep = "form" | "agreement" | "quiz" | "complete";
export type QuizKey = "A" | "B" | "C" | "D";

export interface QuizOption {
  key: QuizKey;
  text: string;
  icon: ReactNode;
}

export interface QuizQuestion {
  title: string;
  options: QuizOption[];
  correct: QuizKey;
  correctFeedback: string;
  wrongFeedback: string;
}

export interface QuizAnswer {
  questionIndex: number;
  selected: QuizKey;
  correct: boolean;
}

export interface QuizFeedback {
  correct: boolean;
  message: string;
  selected: QuizKey;
}
