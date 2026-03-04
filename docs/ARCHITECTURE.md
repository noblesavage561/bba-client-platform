# Architecture Overview

## System Design

The BBA Client Platform follows a monorepo architecture with clear separation between frontend and backend services.

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js 14+   │───▶│   Flask API     │
│   (Frontend)    │    │   (Backend)     │
└─────────────────┘    └────────┬────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
             ┌──────────┐ ┌────────┐ ┌──────────┐
             │PostgreSQL│ │ Redis  │ │Anthropic │
             │    15    │ │   7    │ │  Claude  │
             └──────────┘ └────────┘ └──────────┘
```

## Frontend Architecture

- **Framework**: Next.js 14+ with App Router
- **State**: React Query for server state, Zustand for UI state
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + CSS Modules
- **API Client**: Fetch-based with auth interceptors

### Directory Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # API clients, utilities
├── styles/        # Global styles
└── types/         # TypeScript interfaces
```

## Backend Architecture

- **Framework**: Flask 3.0+ with application factory pattern
- **Database**: SQLAlchemy 2.0+ with PostgreSQL 15
- **Migrations**: Alembic for schema versioning
- **Auth**: JWT tokens (Flask-JWT-Extended)
- **Validation**: Pydantic v2 schemas
- **AI**: Anthropic Claude Opus for document analysis

### Directory Structure
```
app/
├── api/           # Route blueprints
├── models/        # SQLAlchemy models
├── schemas/       # Pydantic schemas
├── services/      # Business logic
├── middleware/    # Error handling, logging
└── utils/         # Helper functions
```

## Data Flow

1. Client browser → Next.js frontend
2. Next.js → Flask API (JWT authenticated)
3. Flask → PostgreSQL (SQLAlchemy ORM)
4. Flask → Redis (caching, sessions)
5. Flask → Anthropic API (document analysis)

## Security

- JWT tokens for API authentication
- CORS configured for frontend origin only
- Password hashing with Werkzeug
- Input validation with Pydantic
- Environment-based secrets management
