-- Seed: California Benefit Programs + Rules
-- Run after schema.sql

INSERT INTO benefit_programs (slug, name, name_es, agency, state, category, description, description_es, official_url, application_url)
VALUES
  (
    'calfresh',
    'CalFresh (SNAP)',
    'CalFresh (Cupones de alimentos)',
    'California Department of Social Services',
    'CA',
    'food',
    'CalFresh provides monthly food benefits to individuals and families with low income. Benefits are loaded onto an EBT card that works like a debit card at most grocery stores.',
    'CalFresh proporciona beneficios mensuales de alimentos a personas y familias con bajos ingresos.',
    'https://www.cdss.ca.gov/calfresh',
    'https://www.benefitscal.com'
  ),
  (
    'medi-cal',
    'Medi-Cal',
    'Medi-Cal',
    'California Department of Health Care Services',
    'CA',
    'health',
    'Medi-Cal is California''s Medicaid program providing free or low-cost health coverage to Californians who meet eligibility requirements.',
    'Medi-Cal es el programa Medicaid de California que proporciona cobertura médica gratuita o de bajo costo.',
    'https://www.dhcs.ca.gov/services/medi-cal',
    'https://www.coveredca.com'
  ),
  (
    'wic',
    'WIC (Women, Infants & Children)',
    'WIC (Mujeres, Bebés y Niños)',
    'California Department of Public Health',
    'CA',
    'food',
    'WIC provides healthy food, nutrition education, breastfeeding support, and health care referrals for pregnant women, new mothers, and children under 5.',
    'WIC proporciona alimentos saludables, educación nutricional y apoyo para mujeres embarazadas y niños menores de 5 años.',
    'https://www.cdph.ca.gov/Programs/CFH/DWICSN',
    'https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/HowtoApply.aspx'
  ),
  (
    'calworks',
    'CalWORKs',
    'CalWORKs',
    'California Department of Social Services',
    'CA',
    'cash',
    'CalWORKs is California''s welfare program that gives cash aid and services to eligible families with children. Families get help paying for housing, food, and other basic needs while they work toward self-sufficiency.',
    'CalWORKs es el programa de asistencia de California que brinda ayuda en efectivo a familias elegibles con hijos.',
    'https://www.cdss.ca.gov/calworks',
    'https://www.benefitscal.com'
  ),
  (
    'liheap',
    'LIHEAP / HEAP (Utility Assistance)',
    'LIHEAP / HEAP (Asistencia de Servicios Públicos)',
    'California Department of Community Services and Development',
    'CA',
    'utility',
    'The Low Income Home Energy Assistance Program helps low-income households pay for heating and cooling energy costs.',
    'El Programa de Asistencia de Energía para el Hogar de Bajos Ingresos ayuda a pagar los costos de energía del hogar.',
    'https://www.csd.ca.gov/pages/liheap.aspx',
    'https://www.csd.ca.gov/pages/liheap.aspx'
  ),
  (
    'section-8',
    'Section 8 Housing Choice Voucher',
    'Sección 8 Cupón de Elección de Vivienda',
    'U.S. Department of Housing and Urban Development / San Diego Housing Commission',
    'CA',
    'housing',
    'Section 8 helps very low-income families, elderly, and disabled people afford decent, safe, and sanitary housing in the private market.',
    'La Sección 8 ayuda a familias de muy bajos ingresos a pagar una vivienda digna y segura en el mercado privado.',
    'https://www.sdhc.org/rental-assistance/housing-choice-voucher-section-8/',
    'https://www.sdhc.org/rental-assistance/housing-choice-voucher-section-8/'
  );

-- CalFresh income thresholds 2025-2026 (130% FPL for gross income)
INSERT INTO income_thresholds (program_id, household_size, annual_gross_max, fpl_percentage, effective_year, state)
SELECT
  p.id,
  t.household_size,
  t.annual_gross_max,
  130.00,
  2026,
  'CA'
FROM benefit_programs p
CROSS JOIN (
  VALUES
    (1,  21112),
    (2,  28624),
    (3,  36136),
    (4,  43648),
    (5,  51160),
    (6,  58672),
    (7,  66184),
    (8,  73696)
) AS t(household_size, annual_gross_max)
WHERE p.slug = 'calfresh';

-- Medi-Cal income thresholds 2025-2026 (138% FPL)
INSERT INTO income_thresholds (program_id, household_size, annual_gross_max, fpl_percentage, effective_year, state)
SELECT
  p.id,
  t.household_size,
  t.annual_gross_max,
  138.00,
  2026,
  'CA'
FROM benefit_programs p
CROSS JOIN (
  VALUES
    (1,  22406),
    (2,  30362),
    (3,  38317),
    (4,  46272),
    (5,  54226),
    (6,  62181),
    (7,  70136),
    (8,  78091)
) AS t(household_size, annual_gross_max)
WHERE p.slug = 'medi-cal';

-- CalFresh eligibility rule v1
INSERT INTO program_rules (program_id, rule_version, effective_date, rules_json)
SELECT
  p.id,
  1,
  '2026-01-01',
  '{
    "program": "calfresh",
    "version": 1,
    "logic": {
      "operator": "AND",
      "conditions": [
        { "field": "household.state", "op": "eq", "value": "CA" },
        {
          "field": "computed.monthly_gross_income",
          "op": "lte",
          "ref": "income_thresholds.calfresh.monthly_gross_max"
        },
        {
          "operator": "OR",
          "conditions": [
            { "field": "household.has_us_citizen_member", "op": "eq", "value": true },
            { "field": "household.has_legal_resident_member", "op": "eq", "value": true }
          ]
        }
      ]
    },
    "disqualifiers": [
      {
        "field": "members.self.citizenship",
        "op": "eq",
        "value": "undocumented",
        "message": "Undocumented adults are not directly eligible for CalFresh, but US-citizen children in the household may qualify."
      }
    ],
    "benefit_estimate": {
      "formula": "lookup_table",
      "table": "calfresh_allotment_table"
    },
    "required_documents": [
      "government_id",
      "proof_of_income",
      "proof_of_residency"
    ]
  }'
FROM benefit_programs p
WHERE p.slug = 'calfresh';
