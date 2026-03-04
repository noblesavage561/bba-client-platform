"""Document schemas."""
from typing import Optional

from pydantic import BaseModel


class CreateDocumentSchema(BaseModel):
    """Schema for creating a document."""

    client_id: str
    name: str
    document_type: str
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


class DocumentResponseSchema(BaseModel):
    """Schema for document response."""

    id: str
    client_id: str
    name: str
    document_type: str
    status: str
    file_url: Optional[str] = None
    analysis_result: Optional[dict] = None
    created_at: str
    updated_at: str
