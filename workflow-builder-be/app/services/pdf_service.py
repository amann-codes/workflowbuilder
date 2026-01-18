import fitz  # PyMuPDF
from typing import List

class PDFService:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extracts all text from a PDF file."""
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
        return text

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 100) -> List[str]:
        """Splits text into fixed-size chunks with overlap."""
        chunks = []
        if not text:
            return chunks
            
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - chunk_overlap
            
        return chunks