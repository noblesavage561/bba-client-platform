"""Tests for health check endpoint."""


def test_health_check(client):
    """Test health check returns OK."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
