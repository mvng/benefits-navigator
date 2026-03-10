import type {
  Condition,
  ProgramRule,
  EligibilityContext,
  EligibilityResult,
  DisqualifyingFactor,
} from './types';
import { resolveField } from './field-resolver';

export class EligibilityEngine {
  async evaluate(
    context: EligibilityContext,
    rule: ProgramRule,
  ): Promise<EligibilityResult> {
    const baseEligible = await this.evaluateCondition(rule.logic, context);

    const disqualifyingFactors: DisqualifyingFactor[] = [];
    if (rule.disqualifiers) {
      for (const dq of rule.disqualifiers) {
        const val = resolveField(context, dq.field);
        if (this.compare(val, dq.op, dq.value)) {
          disqualifyingFactors.push({
            factor: dq.field,
            detail: dq.message,
          });
        }
      }
    }

    const isLikelyEligible = baseEligible && disqualifyingFactors.length === 0;
    const estimate = isLikelyEligible
      ? await this.estimateBenefit(context, rule)
      : null;

    return {
      programSlug: rule.program,
      isLikelyEligible,
      confidenceScore: this.calculateConfidence(context, rule),
      estimatedMonthlyMin: estimate?.min ?? null,
      estimatedMonthlyMax: estimate?.max ?? null,
      disqualifyingFactors,
      requiredDocuments: rule.required_documents ?? [],
    };
  }

  private async evaluateCondition(
    condition: Condition,
    context: EligibilityContext,
  ): Promise<boolean> {
    if ('operator' in condition) {
      const results = await Promise.all(
        condition.conditions.map((c) => this.evaluateCondition(c, context)),
      );
      return condition.operator === 'AND'
        ? results.every(Boolean)
        : results.some(Boolean);
    }

    let compareValue: unknown = condition.value;

    if (condition.ref) {
      compareValue = resolveField(
        context,
        condition.ref.replace('income_thresholds.', 'computed.'),
      );
    }

    const fieldValue = resolveField(context, condition.field);
    return this.compare(fieldValue, condition.op, compareValue);
  }

  private compare(actual: unknown, op: string, expected: unknown): boolean {
    switch (op) {
      case 'eq':     return actual === expected;
      case 'neq':    return actual !== expected;
      case 'gt':     return (actual as number) > (expected as number);
      case 'gte':    return (actual as number) >= (expected as number);
      case 'lt':     return (actual as number) < (expected as number);
      case 'lte':    return (actual as number) <= (expected as number);
      case 'in':     return (expected as unknown[]).includes(actual);
      case 'not_in': return !(expected as unknown[]).includes(actual);
      default:
        throw new Error(`Unknown comparison operator: ${op}`);
    }
  }

  private calculateConfidence(
    context: EligibilityContext,
    rule: ProgramRule,
  ): number {
    const required = rule.confidence_fields ?? [
      'computed.monthly_gross_income',
      'household.size',
    ];
    const missingCount = required.filter(
      (f) => resolveField(context, f) === undefined,
    ).length;
    return Math.max(0.5, 1 - missingCount * 0.15);
  }

  private async estimateBenefit(
    context: EligibilityContext,
    rule: ProgramRule,
  ): Promise<{ min: number; max: number } | null> {
    if (!rule.benefit_estimate) return null;

    if (rule.benefit_estimate.formula === 'lookup_table') {
      // CalFresh allotment table (2026 USDA figures)
      const calfreshTable: Record<number, { min: number; max: number }> = {
        1: { min: 23,  max: 291 },
        2: { min: 42,  max: 535 },
        3: { min: 60,  max: 766 },
        4: { min: 76,  max: 973 },
        5: { min: 90,  max: 1155 },
        6: { min: 108, max: 1386 },
        7: { min: 119, max: 1532 },
        8: { min: 136, max: 1751 },
      };
      const size = context.household.size;
      const entry = calfreshTable[Math.min(size, 8)];
      return entry ?? null;
    }

    return null;
  }
}
