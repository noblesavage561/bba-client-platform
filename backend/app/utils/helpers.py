"""Helper utility functions."""
import re
from typing import Optional


def sanitize_string(value: str) -> str:
    """Remove potentially dangerous characters from strings."""
    return re.sub(r"[<>\"'&]", "", value).strip()


def paginate_query(query, page: int = 1, per_page: int = 20) -> dict:
    """Paginate a SQLAlchemy query."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": [item.to_dict() for item in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
    }


def build_error_response(message: str, code: int = 400, errors: Optional[list] = None) -> dict:
    """Build a standardized error response."""
    response = {"message": message, "code": code}
    if errors:
        response["errors"] = errors
    return response
