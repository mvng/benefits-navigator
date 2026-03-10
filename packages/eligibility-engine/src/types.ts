export type Operator = 'AND' | 'OR';

export type CompareOp =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not_in';

export interface LeafCondition {
  field: string;
  op: CompareOp;
  value?: unknown;
  ref?: string; // e.g. "income_thresholds.calfresh.monthly_gross_max"
}

export interface GroupCondition {
  operator: Operator;
  conditions: Condition[];
}

export type Condition = LeafCondition | GroupCondition;

export interface Disqualifier {
  field: string;
  op: CompareOp;
  value: unknown;
  message: string;
}

export interface BenefitEstimateConfig {
  formula: 'lookup_table' | 'formula';
  table?: string;
  expression?: string;
  inputs?: string[];
}

export interface ProgramRule {
  program: string;
  version: number;
  logic: Condition;
  disqualifiers?: Disqualifier[];
  benefit_estimate?: BenefitEstimateConfig;
  required_documents?: string[];
  confidence_fields?: string[];
}

export interface HouseholdMember {
  relationship: string;
  age?: number;
  is_pregnant: boolean;
  is_disabled: boolean;
  is_veteran: boolean;
  citizenship:
    | 'us_citizen'
    | 'legal_resident'
    | 'undocumented'
    | 'daca';
}

export interface EligibilityContext {
  household: {
    size: number;
    state: string;
    county: string;
    has_us_citizen_member: boolean;
    has_legal_resident_member: boolean;
    has_children_under_5: boolean;
    has_pregnant_member: boolean;
    has_disabled_member: boolean;
    has_veteran: boolean;
  };
  members: {
    self: HouseholdMember;
    [key: string]: HouseholdMember;
  };
  computed: {
    monthly_gross_income: number;
    monthly_net_income: number;
    annual_gross_income: number;
  };
  answers: Record<string, unknown>;
}

export interface DisqualifyingFactor {
  factor: string;
  detail: string;
}

export interface EligibilityResult {
  programSlug: string;
  isLikelyEligible: boolean;
  confidenceScore: number;
  estimatedMonthlyMin: number | null;
  estimatedMonthlyMax: number | null;
  disqualifyingFactors: DisqualifyingFactor[];
  requiredDocuments: string[];
}
