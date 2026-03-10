import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuizStore {
  sessionId: string | null;
  currentStep: number;
  answers: Record<string, unknown>;
  setSessionId: (id: string) => void;
  setAnswer: (key: string, value: unknown) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      sessionId: null,
      currentStep: 0,
      answers: {},
      setSessionId: (id) => set({ sessionId: id }),
      setAnswer: (key, value) =>
        set((s) => ({ answers: { ...s.answers, [key]: value } })),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      reset: () => set({ sessionId: null, currentStep: 0, answers: {} }),
    }),
    { name: 'bn-quiz-session' },
  ),
);
