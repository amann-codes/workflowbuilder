from app.services.vector_store import VectorService
from app.services.llm_service import LLMService
import logging

logger = logging.getLogger(__name__)

class WorkflowEngine:
    @staticmethod
    def run_workflow(workflow: dict, user_query: str) -> str:
        nodes = workflow.get("nodes", [])
        edges = workflow.get("edges", [])
        
        llm_node = next((n for n in nodes if n["type"] == "action"), None)
        if not llm_node: return "Error: No LLM node found."

        # Find Knowledge Base node connected to LLM
        incoming_sources = [e["source"] for e in edges if e["target"] == llm_node["id"]]
        context = ""
        
        for source_id in incoming_sources:
            source_node = next((n for n in nodes if n["id"] == source_id), None)
            if source_node and source_node["type"] == "condition":
                kb_data = source_node.get("data", {})
                doc_id = kb_data.get("documentId")
                
                if doc_id:
                    logger.info(f"--- RUNNING RETRIEVAL for doc_id: {doc_id} ---")
                    context = VectorService.retrieve_context(
                        user_query, 
                        document_id=doc_id, 
                        top_k=kb_data.get("topK", 5)
                    )
                    logger.info(f"--- CONTEXT RETRIEVED (Length: {len(context)}) ---")

        system_prompt = llm_node.get("data", {}).get("systemPrompt", "You are a helpful assistant.")
        
        # ENFORCE RAG: Tell the AI to prioritize the context
        if context:
            system_prompt += (
                "\n\nCRITICAL INSTRUCTION: Use ONLY the provided context from documents "
                "to answer. If the answer is not in the context, say you don't know."
            )
        else:
            logger.warning("No context found! AI will use general knowledge.")

        return LLMService.generate_response(user_query, system_prompt, context, llm_node.get("data", {}))