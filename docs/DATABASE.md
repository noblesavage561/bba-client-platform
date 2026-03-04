# Database Schema

## Technology

- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic

## Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| email | VARCHAR(255) | User email (unique) |
| password_hash | VARCHAR(255) | Bcrypt hash |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | VARCHAR(50) | User role (admin/advisor/client) |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### clients
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| email | VARCHAR(255) | Client email (unique) |
| phone | VARCHAR(50) | Phone number |
| status | VARCHAR(50) | Client status |
| advisor_id | UUID (FK→users) | Assigned advisor |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### documents
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| client_id | UUID (FK→clients) | Associated client |
| name | VARCHAR(255) | Document name |
| document_type | VARCHAR(100) | Document category |
| status | VARCHAR(50) | Processing status |
| file_url | VARCHAR(500) | Storage URL |
| file_size | INTEGER | File size in bytes |
| mime_type | VARCHAR(100) | MIME type |
| analysis_result | JSONB | Claude analysis output |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Running Migrations

```bash
# Initialize Alembic (first time)
flask db init

# Create a migration
flask db migrate -m "description"

# Apply migrations
flask db upgrade

# Rollback one version
flask db downgrade
```
