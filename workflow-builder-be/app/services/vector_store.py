import chromadb
from chromadb.config import Settings
from typing import List, Optional
import logging
import os

# 1. Aggressive Telemetry Disable
os.environ["ANONYMIZED_TELEMETRY"] = "False"

# 2. Filter out the specific Telemetry error from the logs
class NoTelemetryFilter(logging.Filter):
    def filter(self, record):
        return "telemetry" not in record.getMessage().lower()

logging.getLogger("chromadb.telemetry").addFilter(NoTelemetryFilter())

logger = logging.getLogger(__name__)

client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(anonymized_telemetry=False)
)
collection = client.get_or_create_collection(name="workflow_kb")

class VectorService:
    @staticmethod
    def add_documents(document_id: str, chunks: List[str]):
        try:
            ids = [f"{document_id}_{i}" for i in range(len(chunks))]
            metadatas = [{"document_id": document_id} for _ in range(len(chunks))]
            collection.add(documents=chunks, ids=ids, metadatas=metadatas)
        except Exception as e:
            logger.error(f"Vector Store Error: {str(e)}")

    @staticmethod
    def retrieve_context(query: str, document_id: Optional[str] = None, top_k: int = 4) -> str:
        try:
            if collection.count() == 0: return ""
            params = {"query_texts": [query], "n_results": int(top_k)}
            if document_id: params["where"] = {"document_id": document_id}
            results = collection.query(**params)
            return "\n\n".join(results['documents'][0]) if results['documents'] else ""
        except Exception as e:
            return ""