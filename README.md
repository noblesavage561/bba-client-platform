# BBA Client Platform

BBA Services client intake platform with financials capabilities, automation workflows, and admin dashboard infrastructure.

## Architecture

This is a monorepo containing:
- **Frontend**: Next.js 15+ with TypeScript
- **Backend**: Python Flask API
- **Shared**: Common types, constants, and schemas

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Local Development with Docker

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Frontend available at http://localhost:3000
# Backend API at http://localhost:5000/api/v1
```

### Manual Setup

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

#### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
flask db upgrade
python run.py
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Local Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Development

### Running Tests

```bash
# Frontend tests
npm run test:frontend

# Backend tests
cd backend && pytest
```

### Linting

```bash
# Frontend
npm run lint:frontend

# Backend
cd backend && flake8 app/
```
