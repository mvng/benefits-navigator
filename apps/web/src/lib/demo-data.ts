// Set to true to run the app without a backend (uses mock data)
export const DEMO_MODE = true;

export const DEMO_PROGRAMS = [
  {
    slug: 'calfresh',
    name: 'CalFresh (SNAP)',
    name_es: 'CalFresh (Cupones de alimentos)',
    category: 'food',
    icon: '🛒',
    description: 'Monthly food benefits loaded onto an EBT card. Works at most grocery stores.',
    official_url: 'https://www.cdss.ca.gov/calfresh',
    application_url: 'https://www.benefitscal.com',
    agency: 'California Dept. of Social Services',
  },
  {
    slug: 'medi-cal',
    name: 'Medi-Cal',
    name_es: 'Medi-Cal',
    category: 'health',
    icon: '🏥',
    description: 'Free or low-cost health coverage including doctor visits, prescriptions, and hospital care.',
    official_url: 'https://www.dhcs.ca.gov/services/medi-cal',
    application_url: 'https://www.coveredca.com',
    agency: 'CA Dept. of Health Care Services',
  },
  {
    slug: 'wic',
    name: 'WIC',
    name_es: 'WIC (Mujeres, Bebés y Niños)',
    category: 'food',
    icon: '👶',
    description: 'Food, nutrition education, and health referrals for pregnant women and children under 5.',
    official_url: 'https://www.cdph.ca.gov/Programs/CFH/DWICSN',
    application_url: 'https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/HowtoApply.aspx',
    agency: 'CA Dept. of Public Health',
  },
  {
    slug: 'calworks',
    name: 'CalWORKs',
    name_es: 'CalWORKs',
    category: 'cash',
    icon: '💵',
    description: 'Cash aid and support services for families with children while working toward self-sufficiency.',
    official_url: 'https://www.cdss.ca.gov/calworks',
    application_url: 'https://www.benefitscal.com',
    agency: 'California Dept. of Social Services',
  },
  {
    slug: 'liheap',
    name: 'LIHEAP (Utility Assistance)',
    name_es: 'LIHEAP (Asistencia de Servicios Públicos)',
    category: 'utility',
    icon: '⚡',
    description: 'Help paying heating and cooling energy costs for low-income households.',
    official_url: 'https://www.csd.ca.gov/pages/liheap.aspx',
    application_url: 'https://www.csd.ca.gov/pages/liheap.aspx',
    agency: 'CA Dept. of Community Services',
  },
  {
    slug: 'section-8',
    name: 'Section 8 Housing Voucher',
    name_es: 'Sección 8 Cupón de Vivienda',
    category: 'housing',
    icon: '🏠',
    description: 'Housing vouchers to help very low-income families afford safe housing in the private market.',
    official_url: 'https://www.sdhc.org/rental-assistance/housing-choice-voucher-section-8/',
    application_url: 'https://www.sdhc.org/rental-assistance/housing-choice-voucher-section-8/',
    agency: 'San Diego Housing Commission',
  },
];

export type DemoProgram = typeof DEMO_PROGRAMS[number];

export const INCOME_THRESHOLDS: Record<string, Record<number, { min: number; max: number }>> = {
  calfresh: {
    1: { min: 23,  max: 291  },
    2: { min: 42,  max: 535  },
    3: { min: 60,  max: 766  },
    4: { min: 76,  max: 973  },
    5: { min: 90,  max: 1155 },
    6: { min: 108, max: 1386 },
    7: { min: 119, max: 1532 },
    8: { min: 136, max: 1751 },
  },
};

// 130% FPL monthly gross limits (2026)
const CALFRESH_LIMITS: Record<number, number> = {
  1: 1760, 2: 2385, 3: 3011, 4: 3637,
  5: 4263, 6: 4889, 7: 5515, 8: 6141,
};

// 138% FPL for Medi-Cal
const MEDICAL_LIMITS: Record<number, number> = {
  1: 1868, 2: 2530, 3: 3193, 4: 3856,
  5: 4519, 6: 5182, 7: 5845, 8: 6508,
};

export function calcEligibility(answers: Record<string, unknown>) {
  const income      = Number(answers.monthly_income ?? 0);
  const size        = Math.min(Number(answers.household_size ?? 1), 8);
  const hasCitizen  = answers.has_us_citizen === 'yes';
  const isPregnant  = answers.is_pregnant === 'yes';
  const hasChildren = answers.has_children === 'yes';

  return DEMO_PROGRAMS.map((p) => {
    let isEligible = false;
    let estimatedMin: number | undefined;
    let estimatedMax: number | undefined;
    const requiredDocs: string[] = [];
    const disqualifiers: Array<{ factor: string; detail: string }> = [];

    if (p.slug === 'calfresh') {
      isEligible = income <= (CALFRESH_LIMITS[size] ?? 6141) && hasCitizen;
      if (!hasCitizen)
        disqualifiers.push({ factor: 'Citizenship', detail: 'Must have at least one US citizen or legal resident in household.' });
      const est = INCOME_THRESHOLDS.calfresh[size];
      if (est) { estimatedMin = est.min; estimatedMax = est.max; }
      requiredDocs.push('Government-issued ID', 'Proof of income', 'Proof of address');
    }

    if (p.slug === 'medi-cal') {
      isEligible = income <= (MEDICAL_LIMITS[size] ?? 6508);
      requiredDocs.push('Government-issued ID', 'Proof of income');
    }

    if (p.slug === 'wic') {
      isEligible = (isPregnant || hasChildren) && income <= (CALFRESH_LIMITS[size] ?? 6141);
      if (!isPregnant && !hasChildren)
        disqualifiers.push({ factor: 'Eligibility', detail: 'WIC is for pregnant women and households with children under 5.' });
      estimatedMin = 50; estimatedMax = 150;
      requiredDocs.push('Proof of pregnancy or child age', 'Income verification', 'Proof of residency');
    }

    if (p.slug === 'calworks') {
      isEligible = hasChildren && income <= 1500 * size;
      if (!hasChildren)
        disqualifiers.push({ factor: 'Children', detail: 'CalWORKs requires a child under 18 in the household.' });
      if (income > 1500 * size)
        disqualifiers.push({ factor: 'Income', detail: 'Household income exceeds the CalWORKs threshold.' });
      estimatedMin = 300; estimatedMax = 900;
      requiredDocs.push('Birth certificates for children', 'Proof of income', 'Government-issued ID');
    }

    if (p.slug === 'liheap') {
      isEligible = income <= (CALFRESH_LIMITS[size] ?? 6141);
      estimatedMin = 100; estimatedMax = 400;
      requiredDocs.push('Most recent utility bill', 'Proof of income', 'Government-issued ID');
    }

    if (p.slug === 'section-8') {
      isEligible = income <= 2500 * size * 0.5;
      disqualifiers.push({ factor: 'Waitlist', detail: 'San Diego waitlist is currently closed to new applicants.' });
      isEligible = false; // waitlist closed
      requiredDocs.push('ID for all household members', 'Proof of income', 'Rental history');
    }

    return {
      slug: p.slug,
      name: p.name,
      isEligible,
      confidence: isEligible ? 0.88 : 0.2,
      estimatedMin,
      estimatedMax,
      requiredDocs,
      disqualifiers,
    };
  });
}

// Static demo results for when no quiz answers exist (e.g. direct page visit)
export const DEMO_RESULTS = calcEligibility({
  household_size: '2',
  monthly_income: '1800',
  has_us_citizen: 'yes',
  is_pregnant: 'no',
  has_children: 'no',
  employment_status: 'employed_part',
});
