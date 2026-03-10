# Benefits Navigator 🧭

> **TurboTax for Public Benefits** — helping San Diego County residents (and eventually all Americans) discover and apply for public assistance programs.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What It Does

Benefits Navigator guides residents through a plain-language questionnaire, instantly calculates eligibility for programs like CalFresh, Medi-Cal, WIC, CalWORKs, and more — then pre-fills and tracks their applications.

## Programs Supported (v1 — California)

| Program | Category | Admin |
|---|---|---|
| CalFresh (SNAP) | Food | CDSS |
| Medi-Cal | Health | DHCS |
| WIC | Food/Health | CDPH |
| CalWORKs | Cash | CDSS |
| HEAP / LIHEAP | Utility | CSD |
| Section 8 / HCV | Housing | HUD/Local |
| CalWORKs Childcare | Childcare | CDSS |

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Zustand
- **Backend**: NestJS, TypeORM, PostgreSQL (PostGIS)
- **Auth**: Supabase Auth
- **Cache**: Redis (ElastiCache)
- **Storage**: AWS S3 (encrypted documents)
- **AI**: OpenAI GPT-4o (benefits assistant)
- **Infra**: AWS ECS Fargate, RDS, CloudFront, GitHub Actions

## Monorepo Structure

```
benefits-navigator/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── eligibility-engine/   # Rule evaluator
│   ├── db/                   # Schema + migrations
│   └── shared/               # Shared types
├── infra/            # Terraform (AWS)
├── docker-compose.yml
└── .github/workflows/
```

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start local services (Postgres + Redis)
docker-compose up -d

# 3. Set up environment
cp .env.example .env.local
# Fill in SUPABASE_URL, OPENAI_API_KEY, etc.

# 4. Run migrations & seed data
pnpm db:migrate
pnpm db:seed

# 5. Start dev servers
pnpm dev
# → Web: http://localhost:3000
# → API: http://localhost:3001
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for full AWS + Vercel deployment guide.

## Roadmap

- [x] San Diego County (CA) — v1
- [ ] All 58 California counties — v2
- [ ] Nationwide expansion — v3
- [ ] Agency API direct submission
- [ ] Document OCR (AWS Textract)
- [ ] Mobile app (React Native)

## License

MIT — see [LICENSE](LICENSE)
