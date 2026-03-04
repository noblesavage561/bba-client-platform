"""Authentication schemas."""
from pydantic import BaseModel, EmailStr


class LoginSchema(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str


class RefreshSchema(BaseModel):
    """Schema for token refresh."""

    refresh_token: str


class TokenResponseSchema(BaseModel):
    """Schema for token response."""

    access_token: str
    refresh_token: str
    message: str
