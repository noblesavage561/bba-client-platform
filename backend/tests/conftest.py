"""Pytest configuration and fixtures."""
import pytest

from app import create_app, db as _db


@pytest.fixture(scope="session")
def app():
    """Create application for testing."""
    app = create_app("testing")
    return app


@pytest.fixture(scope="session")
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope="session")
def db(app):
    """Create database for testing."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.drop_all()


@pytest.fixture(autouse=True)
def db_transaction(db):
    """Wrap each test in a transaction."""
    connection = db.engine.connect()
    transaction = connection.begin()
    yield
    transaction.rollback()
    connection.close()
