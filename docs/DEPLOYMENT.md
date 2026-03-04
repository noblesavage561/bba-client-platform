# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Cloud provider account (AWS/GCP/Azure)
- Domain name and SSL certificate
- PostgreSQL database (managed service recommended)
- Redis instance

## Environment Setup

Create production environment files with secure values:

```bash
# Generate secure secrets
python -c "import secrets; print(secrets.token_hex(32))"
```

Required production environment variables:
- `SECRET_KEY`: Flask secret key (strong random value)
- `JWT_SECRET_KEY`: JWT signing key (strong random value)
- `DATABASE_URL`: Production PostgreSQL URL
- `REDIS_URL`: Production Redis URL
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `FRONTEND_URL`: Your frontend domain

## Docker Deployment

### Build Images

```bash
docker build -f Dockerfile.frontend -t bba-frontend:latest .
docker build -f Dockerfile.backend -t bba-backend:latest .
```

### Run with Docker Compose

For production, use a separate `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Database Migrations

Always run migrations before deploying new code:

```bash
docker exec bba_backend flask db upgrade
```

## Health Checks

Monitor these endpoints:
- Backend: `GET /health`
- Frontend: `GET /` (returns 200)

## CI/CD

The GitHub Actions workflows in `.github/workflows/` handle:
- `frontend-ci.yml`: Build and test on every PR
- `backend-ci.yml`: Lint, test, and validate Python
- `deploy.yml`: Deploy to production on merge to main

## Security Checklist

- [ ] Strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS restricted to your frontend domain
- [ ] Database connection uses SSL
- [ ] No debug mode in production
- [ ] Secrets stored in environment variables (not code)
- [ ] Regular dependency updates
