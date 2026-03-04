# Local Development Setup

## Prerequisites

- **Node.js** 20+ with npm
- **Python** 3.11+
- **Docker** & **Docker Compose**
- **Git**

## Quick Start (Docker)

The fastest way to get started is using Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/noblesavage561/bba-client-platform.git
cd bba-client-platform

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (especially ANTHROPIC_API_KEY)

# 3. Start all services
docker-compose up -d

# 4. Check services are running
docker-compose ps
```

Services available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/health

## Manual Setup

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed
npm run dev
```

Frontend available at http://localhost:3000

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database URL, JWT secret, etc.

# Start PostgreSQL and Redis (via Docker or local install)
docker-compose up -d postgres redis

# Run database migrations
flask db upgrade

# Start development server
python run.py
```

Backend available at http://localhost:5000

## Running Tests

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests

```bash
cd backend
source .venv/bin/activate
pytest
pytest --cov=app tests/
```

## Linting

### Frontend
```bash
cd frontend
npm run lint
npm run format
```

### Backend
```bash
cd backend
flake8 app/
black app/
isort app/
mypy app/
```

## Environment Variables

See `.env.example` files for all required environment variables:
- Root: `.env.example`
- Frontend: `frontend/.env.example`
- Backend: `backend/.env.example`
