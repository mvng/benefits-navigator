# Deployment Guide

## Local Development

```bash
# Prerequisites: Docker, Node.js 20+, pnpm 9+
git clone https://github.com/mvng/benefits-navigator
cd benefits-navigator
pnpm install
docker-compose up -d          # start Postgres + Redis
cp .env.example .env.local    # fill in credentials
pnpm db:migrate               # run schema migrations
pnpm db:seed                  # seed programs + rules
pnpm dev                      # web :3000, api :3001
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role (server only) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for assistant |
| `AWS_REGION` | ✅ | AWS region (e.g. us-west-2) |
| `S3_DOCUMENTS_BUCKET` | ✅ | S3 bucket for document uploads |
| `JWT_SECRET` | ✅ | JWT signing secret |

## AWS Deployment

### Prerequisites
- AWS CLI configured
- Terraform 1.8+
- ECR repositories created: `bn-api`

### Steps

```bash
# 1. Build and push Docker images
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com

docker build -t bn-api ./apps/api
docker tag bn-api:latest <account>.dkr.ecr.us-west-2.amazonaws.com/bn-api:latest
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/bn-api:latest

# 2. Deploy infrastructure
cd infra/
terraform init
terraform plan
terraform apply

# 3. Run DB migrations
aws ecs run-task \
  --cluster bn-production \
  --task-definition bn-migrate \
  --launch-type FARGATE
```

## Vercel (Frontend)

```bash
cd apps/web
npx vercel deploy --prod
```

Set environment variables in Vercel dashboard under Project Settings → Environment Variables.

## CI/CD

GitHub Actions workflows run automatically:
- **On PR**: lint, type-check, unit tests
- **On merge to main**: deploy API to ECS, deploy web to Vercel

Required GitHub Secrets:
- `AWS_DEPLOY_ROLE_ARN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
