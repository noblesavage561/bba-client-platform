"""Client schemas."""
from typing import Optional

from pydantic import BaseModel, EmailStr


class CreateClientSchema(BaseModel):
    """Schema for creating a client."""

    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    advisor_id: Optional[str] = None


class UpdateClientSchema(BaseModel):
    """Schema for updating a client."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class ClientResponseSchema(BaseModel):
    """Schema for client response."""

    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    status: str
    created_at: str
    updated_at: str
