"""Tests for authentication endpoints."""
import pytest


def test_login_missing_data(client):
    """Test login with missing data returns 400."""
    response = client.post("/api/v1/auth/login", json={})
    assert response.status_code in (400, 422)


def test_login_invalid_email(client):
    """Test login with invalid email."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "not-an-email", "password": "password123"},
    )
    assert response.status_code in (400, 422)
