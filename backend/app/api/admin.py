"""Admin routes."""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    """Get platform statistics."""
    # TODO: Implement actual stats from database
    return jsonify(
        {
            "total_clients": 0,
            "total_documents": 0,
            "active_users": 0,
        }
    ), 200


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    """List all users (admin only)."""
    # TODO: Implement with role-based access control
    return jsonify({"users": [], "total": 0}), 200
