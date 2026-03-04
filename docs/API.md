# API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints (except `/auth/login`) require a JWT Bearer token:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticate and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "message": "Login successful"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

#### POST /auth/logout
Invalidate current session.

#### GET /auth/me
Get current authenticated user details.

---

### Clients

#### GET /clients
List all clients.

**Response:**
```json
{
  "clients": [...],
  "total": 10
}
```

#### POST /clients
Create a new client.

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-555-5555"
}
```

#### GET /clients/{id}
Get a specific client.

#### PUT /clients/{id}
Update a client.

#### DELETE /clients/{id}
Archive a client (soft delete).

---

### Documents

#### GET /documents
List documents. Filter by `?client_id=<id>`.

#### POST /documents
Create a document record.

**Request:**
```json
{
  "client_id": "uuid",
  "name": "2023 Tax Return",
  "document_type": "tax_return"
}
```

#### GET /documents/{id}
Get a specific document.

#### POST /documents/{id}/analyze
Trigger Claude Opus AI analysis of a document.

---

### Admin

#### GET /admin/stats
Get platform statistics.

#### GET /admin/users
List all users (admin role required).

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "code": 400,
  "errors": []
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async operation) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |
