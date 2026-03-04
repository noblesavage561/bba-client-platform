"""Authentication service."""
import logging
from typing import Optional

from app import db
from app.models.user import User

logger = logging.getLogger(__name__)


class AuthService:
    """Service for user authentication."""

    def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = User.query.filter_by(email=email, is_active=True).first()
        if user and user.check_password(password):
            return user
        return None

    def create_user(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: str = "advisor",
    ) -> User:
        """Create a new user."""
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        logger.info(f"Created user: {email}")
        return user
