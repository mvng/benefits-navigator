'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quiz-store';

const questions = [
  {
    key: 'household_size',
    label: 'How many people are in your household?',
    hint: 'Include yourself, your partner, and all children who live with you.',
    type: 'number',
    min: 1,
    max: 20,
  },
  {
    key: 'monthly_income',
    label: "What is your household's total monthly income before taxes?",
    hint: 'Include wages, benefits, child support, and any other income.',
    type: 'number',
    prefix: '$',
    min: 0,
  },
  {
    key: 'employment_status',
    label: 'What is your current employment status?',
    type: 'choice',
    options: [
      { value: 'employed_full', label: 'Employed full-time' },
      { value: 'employed_part', label: 'Employed part-time' },
      { value: 'self_employed', label: 'Self-employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' },
      { value: 'disabled', label: 'Unable to work / Disabled' },
    ],
  },
  {
    key: 'has_children',
    label: 'Do you have children under 18 living with you?',
    type: 'yesno',
  },
  {
    key: 'is_pregnant',
    label: 'Is anyone in your household currently pregnant?',
    type: 'yesno',
  },
  {
    key: 'has_us_citizen',
    label: 'Is at least one person in your household a US citizen or legal resident?',
    type: 'yesno',
  },
];

export default function QuizPage() {
  const router = useRouter();
  const { answers = {}, setAnswer, currentStep, nextStep, prevStep } = useQuizStore();
  const [localValue, setLocalValue] = useState<string>('');

  const safeAnswers = answers ?? {};
  const question = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const progress = Math.round(((currentStep + 1) / questions.length) * 100);

  const currentAnswer = safeAnswers[question?.key ?? ''];
  const canContinue = localValue !== '' || currentAnswer !== undefined;

  const handleNext = () => {
    if (localValue !== '') setAnswer(question.key, localValue);
    if (isLastStep) {
      router.push('/results');
    } else {
      nextStep();
      setLocalValue('');
    }
  };

  if (!question) return null;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        <h2 className="mb-1 text-xl font-bold">{question.label}</h2>
        {question.hint && (
          <p className="mb-5 text-sm text-gray-500">{question.hint}</p>
        )}

        {question.type === 'number' && (
          <div className="relative">
            {question.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {question.prefix}
              </span>
            )}
            <input
              type="number"
              min={question.min}
              max={question.max}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className={`w-full rounded-xl border border-gray-200 py-3 pr-4 text-lg focus:border-brand-600 focus:outline-none ${
                question.prefix ? 'pl-7' : 'pl-4'
              }`}
              aria-label={question.label}
            />
          </div>
        )}

        {question.type === 'choice' && (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalValue(opt.value)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  localValue === opt.value
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={localValue === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {question.type === 'yesno' && (
          <div className="flex gap-3">
            {['Yes', 'No'].map((val) => (
              <button
                key={val}
                onClick={() => setLocalValue(val.toLowerCase())}
                className={`flex-1 rounded-xl border py-3 font-semibold transition ${
                  localValue === val.toLowerCase()
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-pressed={localValue === val.toLowerCase()}
              >
                {val}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {currentStep > 0 && (
          <button onClick={prevStep} className="btn-secondary flex-none">
            ← Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="btn-primary flex-1"
        >
          {isLastStep ? 'See My Results →' : 'Continue →'}
        </button>
      </div>
    </main>
  );
}
