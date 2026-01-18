from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GenAI Stack Workflow Engine"
    GEMINI_API_KEY: str = ""
    # This will use SQLite locally, but Postgres on your cloud provider
    DATABASE_URL: str = "sqlite:///./test.db"
    
    class Config:
        env_file = ".env"

settings = Settings()