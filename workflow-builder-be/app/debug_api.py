import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
print(f"Key Found: {key[:5]}...{key[-5:]}" if key else "Key NOT FOUND")

genai.configure(api_key=key)

print("\n--- Available Models ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")