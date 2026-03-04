"""Document analysis service using Claude Opus."""
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for document processing and AI analysis."""

    def __init__(self):
        self.anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
        self._client = None

    def _get_client(self):
        """Lazily initialize Anthropic client."""
        if self._client is None and self.anthropic_api_key:
            try:
                import anthropic
                self._client = anthropic.Anthropic(api_key=self.anthropic_api_key)
            except ImportError:
                logger.warning("anthropic package not installed")
        return self._client

    def analyze_document(self, document_content: str, document_type: str) -> Optional[dict]:
        """Analyze document content using Claude Opus."""
        client = self._get_client()
        if not client:
            logger.warning("Anthropic client not available")
            return None

        prompt = f"""Analyze this {document_type} document and provide:
1. A concise summary
2. Key financial data points
3. Important dates or deadlines
4. Any red flags or items requiring attention

Document content:
{document_content}"""

        try:
            message = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            return {
                "summary": message.content[0].text,
                "model": message.model,
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens,
            }
        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return None
