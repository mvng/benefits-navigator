import Link from 'next/link';

const PROGRAM_URLS: Record<string, string> = {
  calfresh: 'https://www.benefitscal.com',
  'medi-cal': 'https://www.coveredca.com',
  wic: 'https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/HowtoApply.aspx',
  calworks: 'https://www.benefitscal.com',
  liheap: 'https://www.csd.ca.gov/pages/liheap.aspx',
  'section-8': 'https://www.sdhc.org/rental-assistance/housing-choice-voucher-section-8/',
};

export default function ApplyPage({ params }: { params: { programSlug: string } }) {
  const { programSlug } = params;
  const officialUrl = PROGRAM_URLS[programSlug] ?? 'https://www.benefitscal.com';
  const programName = programSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <Link href="/results" className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to Results
      </Link>

      <h1 className="text-2xl font-bold">Apply for {programName}</h1>
      <p className="mt-2 text-gray-500">
        We'll guide you through the application process step by step.
      </p>

      <div className="mt-8 space-y-4">
        <div className="card">
          <h2 className="font-semibold">Option 1: Apply Online</h2>
          <p className="mt-1 text-sm text-gray-500">Apply directly on the official government website.</p>
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-3 block text-center text-sm"
          >
            Apply on Official Website →
          </a>
        </div>

        <div className="card">
          <h2 className="font-semibold">Option 2: Pre-filled PDF</h2>
          <p className="mt-1 text-sm text-gray-500">We'll generate a pre-filled form you can print and submit.</p>
          <button className="btn-secondary mt-3 w-full text-sm">
            Download Pre-filled Form (PDF)
          </button>
        </div>

        <div className="card">
          <h2 className="font-semibold">Option 3: Find an Office Near You</h2>
          <p className="mt-1 text-sm text-gray-500">Get help applying in person at a local office.</p>
          <Link href="/resources" className="btn-secondary mt-3 block text-center text-sm">
            Find Nearby Offices →
          </Link>
        </div>
      </div>
    </main>
  );
}
