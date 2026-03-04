"""Client management routes."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db
from app.models.client import Client
from app.schemas.client import CreateClientSchema

clients_bp = Blueprint("clients", __name__)


@clients_bp.route("/", methods=["GET"])
@jwt_required()
def list_clients():
    """List all clients."""
    clients = Client.query.all()
    return jsonify({"clients": [c.to_dict() for c in clients], "total": len(clients)}), 200


@clients_bp.route("/<string:client_id>", methods=["GET"])
@jwt_required()
def get_client(client_id: str):
    """Get a specific client."""
    client = Client.query.get_or_404(client_id)
    return jsonify(client.to_dict()), 200


@clients_bp.route("/", methods=["POST"])
@jwt_required()
def create_client():
    """Create a new client."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    schema = CreateClientSchema(**data)
    client = Client(
        first_name=schema.first_name,
        last_name=schema.last_name,
        email=schema.email,
        phone=schema.phone,
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@clients_bp.route("/<string:client_id>", methods=["PUT"])
@jwt_required()
def update_client(client_id: str):
    """Update a client."""
    client = Client.query.get_or_404(client_id)
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    for field in ["first_name", "last_name", "email", "phone", "status"]:
        if field in data:
            setattr(client, field, data[field])

    db.session.commit()
    return jsonify(client.to_dict()), 200


@clients_bp.route("/<string:client_id>", methods=["DELETE"])
@jwt_required()
def delete_client(client_id: str):
    """Delete a client (soft delete)."""
    client = Client.query.get_or_404(client_id)
    client.status = "archived"
    db.session.commit()
    return jsonify({"message": "Client archived"}), 200
