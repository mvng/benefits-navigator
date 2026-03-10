import { describe, it, expect } from 'vitest';
import { EligibilityEngine } from './engine';
import type { EligibilityContext, ProgramRule } from './types';

const calfreshRule: ProgramRule = {
  program: 'calfresh',
  version: 1,
  logic: {
    operator: 'AND',
    conditions: [
      { field: 'household.state', op: 'eq', value: 'CA' },
      {
        field: 'computed.monthly_gross_income',
        op: 'lte',
        value: 2385, // 130% FPL for household of 3
      },
      {
        operator: 'OR',
        conditions: [
          { field: 'household.has_us_citizen_member', op: 'eq', value: true },
          { field: 'household.has_legal_resident_member', op: 'eq', value: true },
        ],
      },
    ],
  },
  disqualifiers: [
    {
      field: 'members.self.citizenship',
      op: 'eq',
      value: 'undocumented',
      message: 'Undocumented adults are not directly eligible for CalFresh.',
    },
  ],
  required_documents: ['government_id', 'proof_of_income'],
};

const makeContext = (overrides: Partial<EligibilityContext> = {}): EligibilityContext => ({
  household: {
    size: 3,
    state: 'CA',
    county: 'San Diego',
    has_us_citizen_member: true,
    has_legal_resident_member: false,
    has_children_under_5: false,
    has_pregnant_member: false,
    has_disabled_member: false,
    has_veteran: false,
    ...overrides.household,
  },
  members: {
    self: {
      relationship: 'self',
      age: 32,
      is_pregnant: false,
      is_disabled: false,
      is_veteran: false,
      citizenship: 'us_citizen',
    },
    ...overrides.members,
  },
  computed: {
    monthly_gross_income: 1800,
    monthly_net_income: 1440,
    annual_gross_income: 21600,
    ...overrides.computed,
  },
  answers: {},
});

const engine = new EligibilityEngine();

describe('EligibilityEngine', () => {
  it('returns eligible for qualifying household', async () => {
    const result = await engine.evaluate(makeContext(), calfreshRule);
    expect(result.isLikelyEligible).toBe(true);
    expect(result.confidenceScore).toBeGreaterThan(0.8);
    expect(result.estimatedMonthlyMin).toBeDefined();
  });

  it('returns ineligible when income exceeds threshold', async () => {
    const result = await engine.evaluate(
      makeContext({ computed: { monthly_gross_income: 5000, monthly_net_income: 4000, annual_gross_income: 60000 } }),
      calfreshRule,
    );
    expect(result.isLikelyEligible).toBe(false);
  });

  it('applies disqualifier for undocumented adult', async () => {
    const result = await engine.evaluate(
      makeContext({
        members: {
          self: {
            relationship: 'self',
            age: 28,
            is_pregnant: false,
            is_disabled: false,
            is_veteran: false,
            citizenship: 'undocumented',
          },
        },
      }),
      calfreshRule,
    );
    expect(result.isLikelyEligible).toBe(false);
    expect(result.disqualifyingFactors.length).toBeGreaterThan(0);
  });

  it('includes required documents in result', async () => {
    const result = await engine.evaluate(makeContext(), calfreshRule);
    expect(result.requiredDocuments).toContain('government_id');
  });
});
