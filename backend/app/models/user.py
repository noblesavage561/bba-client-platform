"""User model."""
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models.base import BaseModel


class User(BaseModel):
    """User model for authentication."""

    __tablename__ = "users"

    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(
        db.String(50),
        nullable=False,
        default="advisor",
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def set_password(self, password: str) -> None:
        """Hash and store password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify password against hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        """Convert to dict, excluding sensitive fields."""
        data = super().to_dict()
        data.pop("password_hash", None)
        return data
