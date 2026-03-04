"""Document model."""
from app import db
from app.models.base import BaseModel


class Document(BaseModel):
    """Document model for client document management."""

    __tablename__ = "documents"

    client_id = db.Column(db.String(36), db.ForeignKey("clients.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(100), nullable=False)
    status = db.Column(
        db.String(50),
        nullable=False,
        default="pending",
    )
    file_url = db.Column(db.String(500))
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    analysis_result = db.Column(db.JSON)

    # Relationships
    client = db.relationship("Client", back_populates="documents")
