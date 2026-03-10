import Link from 'next/link';

export default function LandingPage() {
  const programs = [
    { name: 'CalFresh', desc: 'Monthly food benefits', icon: '🛒', color: 'bg-green-50 text-green-700' },
    { name: 'Medi-Cal', desc: 'Free health coverage', icon: '🏥', color: 'bg-blue-50 text-blue-700' },
    { name: 'WIC', desc: 'Food for moms & babies', icon: '👶', color: 'bg-purple-50 text-purple-700' },
    { name: 'CalWORKs', desc: 'Cash assistance', icon: '💵', color: 'bg-yellow-50 text-yellow-700' },
    { name: 'Utility Help', desc: 'Energy bill assistance', icon: '⚡', color: 'bg-orange-50 text-orange-700' },
    { name: 'Housing', desc: 'Section 8 & vouchers', icon: '🏠', color: 'bg-red-50 text-red-700' },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-brand-900 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-block rounded-full bg-brand-600 px-4 py-1 text-sm font-medium">
            Free · Private · Takes 3 minutes
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Find benefits you<br />
            <span className="text-blue-300">actually qualify for</span>
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Millions of Californians miss benefits they're entitled to.
            Answer a few simple questions — we'll show you what you qualify for
            and help you apply.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/quiz" className="btn-primary text-base">
              Check My Eligibility →
            </Link>
            <Link href="/chat" className="btn-secondary text-base">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold">Programs We Cover</h2>
        <p className="mb-8 text-center text-gray-500">Starting with San Diego County, California</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {programs.map((p) => (
            <div key={p.name} className={`card flex flex-col items-center gap-2 text-center ${p.color.split(' ')[0]}`}>
              <span className="text-3xl" aria-hidden="true">{p.icon}</span>
              <p className={`font-semibold ${p.color.split(' ')[1]}`}>{p.name}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-2xl font-bold">How It Works</h2>
          <ol className="space-y-6">
            {[
              { step: '1', title: 'Answer a few questions', desc: 'Household size, income, and situation — takes about 3 minutes.' },
              { step: '2', title: 'See your results instantly', desc: 'We calculate which programs you likely qualify for and estimate benefit amounts.' },
              { step: '3', title: 'Apply with guidance', desc: 'We pre-fill your application and walk you through each step.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href="/quiz" className="btn-primary">
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
