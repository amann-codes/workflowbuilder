from app.services.vector_store import VectorService
from app.services.llm_service import LLMService
import logging

class WorkflowEngine:
    @staticmethod
    def run_workflow(workflow: dict, user_query: str) -> str:
        nodes = workflow.get("nodes", [])
        edges = workflow.get("edges", [])
        
        # 1. Find the LLM node (Action)
        llm_node = next((n for n in nodes if n["type"] == "action"), None)
        if not llm_node: 
            return "Error: No LLM node found. Please connect an LLM node in your workflow."

        # 2. Look for Knowledge Base (Condition) nodes connected to this LLM node
        context = ""
        # Find edges where the target is our LLM node
        incoming_to_llm = [e["source"] for e in edges if e["target"] == llm_node["id"]]
        
        # Check if any of those sources are Knowledge Base nodes
        for source_id in incoming_to_llm:
            source_node = next((n for n in nodes if n["id"] == source_id), None)
            if source_node and source_node["type"] == "condition":
                kb_data = source_node.get("data", {})
                doc_id = kb_data.get("documentId")
                
                if doc_id:
                    logging.info(f"Retrieving context for doc_id: {doc_id}")
                    context = VectorService.retrieve_context(
                        user_query, 
                        document_id=doc_id, 
                        top_k=kb_data.get("topK", 4)
                    )

        # 3. Get system prompt from the node data
        node_data = llm_node.get("data", {})
        system_prompt = node_data.get("systemPrompt", "You are a helpful AI assistant.")
        
        # 4. Run the LLM
        return LLMService.generate_response(user_query, system_prompt, context, node_data)