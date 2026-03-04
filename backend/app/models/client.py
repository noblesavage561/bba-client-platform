"""Client model."""
from app import db
from app.models.base import BaseModel


class Client(BaseModel):
    """Client model for storing client information."""

    __tablename__ = "clients"

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(50))
    status = db.Column(
        db.String(50),
        nullable=False,
        default="active",
    )
    advisor_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)

    # Relationships
    documents = db.relationship("Document", back_populates="client", lazy="dynamic")

    @property
    def full_name(self) -> str:
        """Return full name."""
        return f"{self.first_name} {self.last_name}"
