"""Document management routes."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db
from app.models.document import Document
from app.schemas.document import CreateDocumentSchema

documents_bp = Blueprint("documents", __name__)


@documents_bp.route("/", methods=["GET"])
@jwt_required()
def list_documents():
    """List all documents."""
    client_id = request.args.get("client_id")
    query = Document.query
    if client_id:
        query = query.filter_by(client_id=client_id)
    documents = query.all()
    return jsonify(
        {"documents": [d.to_dict() for d in documents], "total": len(documents)}
    ), 200


@documents_bp.route("/<string:document_id>", methods=["GET"])
@jwt_required()
def get_document(document_id: str):
    """Get a specific document."""
    document = Document.query.get_or_404(document_id)
    return jsonify(document.to_dict()), 200


@documents_bp.route("/", methods=["POST"])
@jwt_required()
def create_document():
    """Create a new document record."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    schema = CreateDocumentSchema(**data)
    document = Document(
        client_id=schema.client_id,
        name=schema.name,
        document_type=schema.document_type,
    )
    db.session.add(document)
    db.session.commit()
    return jsonify(document.to_dict()), 201


@documents_bp.route("/<string:document_id>/analyze", methods=["POST"])
@jwt_required()
def analyze_document(document_id: str):
    """Trigger AI analysis of a document."""
    document = Document.query.get_or_404(document_id)
    # TODO: Trigger Claude Opus analysis via service
    document.status = "processing"
    db.session.commit()
    return jsonify({"message": "Analysis started", "document_id": document_id}), 202
