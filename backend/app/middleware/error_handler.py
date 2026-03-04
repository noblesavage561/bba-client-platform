"""Error handling middleware."""
import logging

from flask import Flask, jsonify
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


def register_error_handlers(app: Flask) -> None:
    """Register error handlers on the Flask app."""

    @app.errorhandler(HTTPException)
    def handle_http_exception(e: HTTPException):
        logger.warning(f"HTTP {e.code}: {e.description}")
        return jsonify({"message": e.description, "code": e.code}), e.code

    @app.errorhandler(ValidationError)
    def handle_validation_error(e: ValidationError):
        logger.warning(f"Validation error: {e.errors()}")
        return jsonify({"message": "Validation error", "errors": e.errors()}), 422

    @app.errorhandler(Exception)
    def handle_generic_exception(e: Exception):
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        return jsonify({"message": "Internal server error"}), 500
