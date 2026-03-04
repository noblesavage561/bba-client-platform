"""Authentication routes."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from app.schemas.auth import LoginSchema

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT tokens."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    schema = LoginSchema(**data)
    # TODO: Validate credentials against database
    # For now, return a placeholder response
    access_token = create_access_token(identity=schema.email)
    refresh_token = create_refresh_token(identity=schema.email)

    return jsonify(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "message": "Login successful",
        }
    ), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout user (client-side token removal)."""
    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    identity = get_jwt_identity()
    return jsonify({"email": identity}), 200
