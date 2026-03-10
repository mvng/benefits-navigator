/**
 * DEMO MODE — all sample data lives here.
 * When NEXT_PUBLIC_DEMO_MODE=true (or no API is reachable) the app uses
 * these values instead of hitting the backend.
 */

export const DEMO_MODE = true;

/** Pre-seeded quiz answers so /results works without going through the quiz */
export const DEMO_ANSWERS: Record<string, string> = {
  household_size: '3',
  monthly_income: '2200',
  employment_status: 'employed_part',
  has_children: 'yes',
  is_pregnant: 'no',
  has_us_citizen: 'yes',
  state: 'CA',
};

/** Fully-populated results for all 6 programs */
export const DEMO_RESULTS = [
  {
    slug: 'calfresh',
    name: 'CalFresh (SNAP)',
    isEligible: true,
    confidence: 0.92,
    estimatedMin: 291,
    estimatedMax: 766,
    requiredDocs: ['Government ID', 'Proof of income', 'Proof of address'],
    disqualifiers: [],
  },
  {
    slug: 'medi-cal',
    name: 'Medi-Cal',
    isEligible: true,
    confidence: 0.88,
    estimatedMin: undefined,
    estimatedMax: undefined,
    requiredDocs: ['Government ID', 'Proof of income'],
    disqualifiers: [],
  },
  {
    slug: 'wic',
    name: 'WIC',
    isEligible: true,
    confidence: 0.85,
    estimatedMin: 50,
    estimatedMax: 150,
    requiredDocs: ['Proof of child age', 'Income verification'],
    disqualifiers: [],
  },
  {
    slug: 'calworks',
    name: 'CalWORKs',
    isEligible: false,
    confidence: 0.6,
    estimatedMin: undefined,
    estimatedMax: undefined,
    requiredDocs: [],
    disqualifiers: [{ factor: 'Income', detail: 'Household income slightly exceeds the threshold.' }],
  },
  {
    slug: 'liheap',
    name: 'Utility Help (LIHEAP)',
    isEligible: true,
    confidence: 0.78,
    estimatedMin: 100,
    estimatedMax: 400,
    requiredDocs: ['Utility bill', 'Proof of income', 'Government ID'],
    disqualifiers: [],
  },
  {
    slug: 'section-8',
    name: 'Section 8 / Housing Voucher',
    isEligible: false,
    confidence: 0.5,
    estimatedMin: undefined,
    estimatedMax: undefined,
    requiredDocs: [],
    disqualifiers: [{ factor: 'Waitlist', detail: 'San Diego waitlist is currently closed.' }],
  },
];

/** Sample chat responses keyed by rough topic */
export const DEMO_CHAT_RESPONSES: string[] = [
  "Great question! **CalFresh** (California's SNAP program) provides monthly food benefits loaded onto an EBT card. A household of 3 with income around $2,200/month is likely eligible for approximately $291–$766/month depending on exact deductions. The fastest way to apply is at **BenefitsCal.com**.",
  "**Medi-Cal** provides free or low-cost health coverage. With your household size and income, you almost certainly qualify. Coverage can start the same month you apply — there's no waiting period for most applicants.",
  "For **WIC**, you'll need to bring proof of your child's age (birth certificate), your income verification (pay stubs), and a government-issued ID to your local WIC office. You can find the nearest San Diego WIC site at cdph.ca.gov.",
  "Undocumented parents can apply for benefits **on behalf of their US-born children**. The children's eligibility is based solely on the child's status, not the parents'. Parents do not need to provide their own immigration documents.",
  "A Medi-Cal application typically takes **up to 45 days** to process, but in many cases you'll receive a determination within 1–2 weeks. You can check your status at BenefitsCal.com or call (800) 952-5253.",
];

let _demoResponseIndex = 0;
export function getNextDemoResponse(): string {
  const resp = DEMO_CHAT_RESPONSES[_demoResponseIndex % DEMO_CHAT_RESPONSES.length];
  _demoResponseIndex++;
  return resp;
}
