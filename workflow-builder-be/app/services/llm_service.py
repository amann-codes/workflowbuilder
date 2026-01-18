from google import genai
from google.genai import types
import time
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    @staticmethod
    def generate_response(query: str, system_prompt: str, context: str = "", config: dict = {}) -> str:
        api_key = config.get("apiKey") or settings.GEMINI_API_KEY
        if not api_key: return "Error: No API Key."

        # Initialize Client without forcing 'v1' to see if auto-discovery works better
        client = genai.Client(api_key=api_key)

        # --- DIAGNOSTIC STEP ---
        # Let's see what this key is allowed to use
        try:
            available_models = [m.name for m in client.models.list()]
            logger.info(f"MODELS VISIBLE TO YOUR KEY: {available_models}")
        except Exception as e:
            logger.error(f"Could not list models: {str(e)}")

        # Force use of a model found in the list, or default to standard ID
        # If the 404 persists, we try 'gemini-1.5-flash-latest' which is a common fix
        model_name = "models/gemini-flash-latest"

        
        contents = f"{system_prompt}\n\nCONTEXT:\n{context}\n\nUSER: {query}"

        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model="models/gemini-flash-latest",
                    contents=contents,
                    config=types.GenerateContentConfig(temperature=0.7)
                )

                if response.text: return response.text
                return "Empty response from AI."
            except Exception as e:
                err = str(e)
                logger.error(f"LLM Error on {model_name}: {err}")
                
                return f"LLM Error: {err}"
        
        return "Failed to get response."