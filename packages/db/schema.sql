-- Benefits Navigator — PostgreSQL Schema
-- Run against a PostGIS-enabled database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            VARCHAR(255) UNIQUE,
  phone            VARCHAR(20),
  preferred_lang   VARCHAR(10) NOT NULL DEFAULT 'en',
  auth_provider    VARCHAR(50) NOT NULL DEFAULT 'email',
  auth_provider_id VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ============================================================
-- HOUSEHOLDS
-- ============================================================

CREATE TABLE IF NOT EXISTS households (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  size             INT NOT NULL CHECK (size >= 1),
  county           VARCHAR(100) NOT NULL DEFAULT 'San Diego',
  state            CHAR(2) NOT NULL DEFAULT 'CA',
  zip_code         VARCHAR(10),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_members (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id     UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  relationship     VARCHAR(50) NOT NULL,
  age              INT,
  is_pregnant      BOOLEAN NOT NULL DEFAULT FALSE,
  is_disabled      BOOLEAN NOT NULL DEFAULT FALSE,
  is_veteran       BOOLEAN NOT NULL DEFAULT FALSE,
  citizenship      VARCHAR(30) NOT NULL DEFAULT 'us_citizen',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ELIGIBILITY SESSIONS & ANSWERS
-- ============================================================

CREATE TABLE IF NOT EXISTS eligibility_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  session_token    VARCHAR(255) UNIQUE NOT NULL,
  state            CHAR(2) NOT NULL DEFAULT 'CA',
  county           VARCHAR(100),
  status           VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

CREATE TABLE IF NOT EXISTS eligibility_answers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id       UUID NOT NULL REFERENCES eligibility_sessions(id) ON DELETE CASCADE,
  question_key     VARCHAR(100) NOT NULL,
  answer_value     JSONB NOT NULL,
  answered_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BENEFIT PROGRAMS & RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS benefit_programs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             VARCHAR(100) UNIQUE NOT NULL,
  name             VARCHAR(200) NOT NULL,
  name_es          VARCHAR(200),
  agency           VARCHAR(200) NOT NULL,
  state            CHAR(2) NOT NULL,
  county           VARCHAR(100),
  category         VARCHAR(50) NOT NULL,
  description      TEXT,
  description_es   TEXT,
  official_url     VARCHAR(500),
  application_url  VARCHAR(500),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS program_rules (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id       UUID NOT NULL REFERENCES benefit_programs(id) ON DELETE CASCADE,
  rule_version     INT NOT NULL DEFAULT 1,
  effective_date   DATE NOT NULL,
  expiry_date      DATE,
  rules_json       JSONB NOT NULL,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, rule_version)
);

CREATE TABLE IF NOT EXISTS income_thresholds (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id          UUID NOT NULL REFERENCES benefit_programs(id) ON DELETE CASCADE,
  household_size      INT NOT NULL CHECK (household_size >= 1),
  annual_gross_max    NUMERIC(12,2) NOT NULL,
  monthly_gross_max   NUMERIC(12,2) GENERATED ALWAYS AS (annual_gross_max / 12) STORED,
  fpl_percentage      NUMERIC(5,2),
  effective_year      INT NOT NULL,
  state               CHAR(2) NOT NULL DEFAULT 'CA',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, household_size, effective_year, state)
);

-- ============================================================
-- ELIGIBILITY RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS eligibility_results (
  id                           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id                   UUID NOT NULL REFERENCES eligibility_sessions(id) ON DELETE CASCADE,
  program_id                   UUID NOT NULL REFERENCES benefit_programs(id),
  is_likely_eligible           BOOLEAN NOT NULL,
  confidence_score             NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  estimated_monthly_value_min  NUMERIC(10,2),
  estimated_monthly_value_max  NUMERIC(10,2),
  disqualifying_factors        JSONB,
  required_documents           JSONB,
  calculated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS applications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id       UUID NOT NULL REFERENCES benefit_programs(id),
  session_id       UUID REFERENCES eligibility_sessions(id),
  status           VARCHAR(30) NOT NULL DEFAULT 'draft',
  external_case_id VARCHAR(200),
  submitted_at     TIMESTAMPTZ,
  approved_at      TIMESTAMPTZ,
  renewal_due_date DATE,
  form_data        JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id   UUID REFERENCES applications(id) ON DELETE SET NULL,
  doc_type         VARCHAR(100) NOT NULL,
  file_name        VARCHAR(500) NOT NULL,
  s3_key           VARCHAR(1000) NOT NULL,
  mime_type        VARCHAR(100),
  file_size_bytes  INT,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ
);

-- ============================================================
-- RESOURCE LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS resource_locations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id       UUID REFERENCES benefit_programs(id),
  name             VARCHAR(300) NOT NULL,
  address          TEXT NOT NULL,
  city             VARCHAR(100),
  state            CHAR(2),
  zip_code         VARCHAR(10),
  phone            VARCHAR(20),
  hours            JSONB,
  services         TEXT[],
  accepts_walkins  BOOLEAN,
  latitude         NUMERIC(10,7),
  longitude        NUMERIC(10,7),
  geom             GEOGRAPHY(Point, 4326),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             VARCHAR(50) NOT NULL,
  title            VARCHAR(300) NOT NULL,
  body             TEXT NOT NULL,
  channel          VARCHAR(20) NOT NULL DEFAULT 'email',
  sent_at          TIMESTAMPTZ,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_eligibility_answers_session ON eligibility_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_results_session ON eligibility_results(session_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_income_thresholds_program ON income_thresholds(program_id, household_size, effective_year);
CREATE INDEX IF NOT EXISTS idx_resource_locations_geom ON resource_locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_program_rules_program_effective ON program_rules(program_id, effective_date DESC);
