"""Flask application factory."""
import logging
import os

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

from config import config

db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name: str = "default") -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=[app.config["FRONTEND_URL"]])

    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if app.config["DEBUG"] else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.clients import clients_bp
    from app.api.documents import documents_bp
    from app.api.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(clients_bp, url_prefix="/api/v1/clients")
    app.register_blueprint(documents_bp, url_prefix="/api/v1/documents")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")

    # Health check endpoint
    @app.route("/health")
    def health_check():
        return {"status": "healthy", "version": "1.0.0"}

    return app
