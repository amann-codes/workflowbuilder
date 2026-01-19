import chromadb
from chromadb.config import Settings
from google import genai
from app.core.config import settings
from typing import List, Optional
import logging
import os

os.environ["ANONYMIZED_TELEMETRY"] = "False"
logger = logging.getLogger(__name__)

class GeminiCloudEmbeddingFunction:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)
        self.model = "text-embedding-004"

    def __call__(self, input: List[str]) -> List[List[float]]:
        # FIX: Google limits batch size to 100. We must process in chunks.
        all_embeddings = []
        batch_size = 100
        
        for i in range(0, len(input), batch_size):
            batch = input[i : i + batch_size]
            try:
                response = self.client.models.embed_content(
                    model=self.model,
                    contents=batch
                )
                all_embeddings.extend([item.values for item in response.embeddings])
            except Exception as e:
                logger.error(f"Batch Embedding Error at index {i}: {str(e)}")
                # Fill failed batch with zeros to maintain index alignment
                all_embeddings.extend([[0.0] * 768 for _ in batch])
        
        return all_embeddings

gemini_ef = GeminiCloudEmbeddingFunction(api_key=settings.GEMINI_API_KEY)

client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(anonymized_telemetry=False)
)

collection = client.get_or_create_collection(
    name="workflow_kb",
    embedding_function=gemini_ef
)

class VectorService:
    @staticmethod
    def add_documents(document_id: str, chunks: List[str]):
        try:
            ids = [f"{document_id}_{i}" for i in range(len(chunks))]
            metadatas = [{"document_id": document_id} for _ in range(len(chunks))]
            
            # ChromaDB will call our __call__ which now handles batching correctly
            collection.add(documents=chunks, ids=ids, metadatas=metadatas)
            logger.info(f"Successfully indexed {len(chunks)} chunks.")
        except Exception as e:
            logger.error(f"Failed to add documents: {str(e)}")

    @staticmethod
    def retrieve_context(query: str, document_id: Optional[str] = None, top_k: int = 4) -> str:
        try:
            if collection.count() == 0: return ""
            query_params = {"query_texts": [query], "n_results": int(top_k)}
            if document_id: query_params["where"] = {"document_id": document_id}
            results = collection.query(**query_params)
            if not results or not results.get('documents') or not results['documents'][0]: return ""
            return "\n\n".join(results['documents'][0])
        except Exception as e:
            logger.error(f"Retrieval Error: {str(e)}")
            return ""