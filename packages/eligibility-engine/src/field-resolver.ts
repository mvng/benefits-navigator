import type { EligibilityContext } from './types';

/**
 * Resolves a dot-notation path against the eligibility context.
 * e.g. "household.size" → context.household.size
 * e.g. "computed.monthly_gross_income" → context.computed.monthly_gross_income
 */
export function resolveField(
  context: EligibilityContext,
  path: string,
): unknown {
  const parts = path.split('.');
  let current: unknown = context;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}
