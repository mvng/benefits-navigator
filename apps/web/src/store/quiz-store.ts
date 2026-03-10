import { create } from 'zustand';
import { DEMO_ANSWERS, DEMO_MODE } from '@/lib/demo-data';

type Answers = Record<string, string>;

interface QuizStore {
  answers: Answers;
  currentStep: number;
  setAnswer: (key: string, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  // Pre-seed with demo answers so /results works immediately in demo mode
  answers: DEMO_MODE ? DEMO_ANSWERS : {},
  currentStep: 0,
  setAnswer: (key, value) =>
    set((s) => ({ answers: { ...s.answers, [key]: value } })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ answers: DEMO_MODE ? DEMO_ANSWERS : {}, currentStep: 0 }),
}));
