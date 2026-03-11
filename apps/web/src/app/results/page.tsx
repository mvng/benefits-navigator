'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/store/quiz-store';
import { calcEligibility, DEMO_RESULTS } from '@/lib/demo-data';

type ResultCard = {
  slug: string;
  name: string;
  isEligible: boolean;
  confidence: number;
  estimatedMin?: number;
  estimatedMax?: number;
  requiredDocs: string[];
  disqualifiers: Array<{ factor: string; detail: string }>;
};

export default function ResultsPage() {
  const { answers } = useQuizStore();
  const [results, setResults] = useState<ResultCard[]>([]);

  useEffect(() => {
    // Use real answers if quiz was completed, otherwise show demo
    const hasAnswers = Object.keys(answers).length > 0;
    setResults(hasAnswers ? calcEligibility(answers) : DEMO_RESULTS);
  }, [answers]);

  const eligible    = results.filter((r) => r.isEligible);
  const notEligible = results.filter((r) => !r.isEligible);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Results</h1>
        <p className="mt-1 text-gray-500">
          {Object.keys(answers).length > 0
            ? `Based on your answers, we found ${eligible.length} program${eligible.length !== 1 ? 's' : ''} you likely qualify for.`
            : 'Sample results — take the quiz to see your personalized eligibility.'}
        </p>
        {Object.keys(answers).length === 0 && (
          <Link href="/quiz" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
            Take the quiz →
          </Link>
        )}
      </div>

      {eligible.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-green-700">✓ Likely Eligible ({eligible.length})</h2>
          {eligible.map((r) => (
            <EligibilityCard key={r.slug} result={r} variant="eligible" />
          ))}
        </section>
      )}

      {notEligible.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-400">Other Programs</h2>
          {notEligible.map((r) => (
            <EligibilityCard key={r.slug} result={r} variant="ineligible" />
          ))}
        </section>
      )}

      <div className="mt-10 rounded-2xl bg-brand-50 p-5 text-center">
        <p className="font-semibold text-brand-700">Have questions about your results?</p>
        <Link href="/chat" className="btn-primary mt-3 inline-block">
          Ask Our AI Assistant
        </Link>
      </div>
    </main>
  );
}

function EligibilityCard({
  result,
  variant,
}: {
  result: ResultCard;
  variant: 'eligible' | 'ineligible';
}) {
  const isEligible = variant === 'eligible';

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isEligible ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{result.name}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isEligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isEligible ? 'Likely Eligible' : 'Not Eligible'}
        </span>
      </div>

      {isEligible && result.estimatedMax && (
        <p className="mt-2 text-2xl font-bold text-green-700">
          ${result.estimatedMin}–${result.estimatedMax}
          <span className="text-sm font-normal text-gray-500">/month</span>
        </p>
      )}
      {isEligible && !result.estimatedMax && (
        <p className="mt-2 text-lg font-semibold text-green-700">Free coverage</p>
      )}

      {isEligible && result.requiredDocs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Documents needed
          </p>
          <ul className="mt-1 space-y-1">
            {result.requiredDocs.map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-sm text-gray-600">
                <span aria-hidden>📄</span> {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isEligible && result.disqualifiers.length > 0 && (
        <div className="mt-2 space-y-1">
          {result.disqualifiers.map((d) => (
            <p key={d.factor} className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{d.factor}:</span> {d.detail}
            </p>
          ))}
        </div>
      )}

      {isEligible && (
        <Link
          href={`/apply/${result.slug}`}
          className="btn-primary mt-4 block text-center text-sm"
        >
          Start Application →
        </Link>
      )}
    </div>
  );
}
