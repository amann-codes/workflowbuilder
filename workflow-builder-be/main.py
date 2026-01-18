import uvicorn
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.core.database import engine, Base

os.environ["ANONYMIZED_TELEMETRY"] = "False"
class TelemetryFilter(logging.Filter):
    def filter(self, record):
        return "telemetry" not in record.getMessage().lower() and "posthog" not in record.getMessage().lower()

logging.getLogger().addFilter(TelemetryFilter())
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://workflowbuilder-rho.vercel.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
