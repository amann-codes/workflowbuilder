import os, uuid, shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import DocumentMetadata, Workflow
from app.services.pdf_service import PDFService
from app.services.vector_store import VectorService
from app.engine.workflow_engine import WorkflowEngine

api_router = APIRouter()

@api_router.get("/health")
def health(): return {"status": "healthy"}

@api_router.post("/upload")
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_id = str(uuid.uuid4())
    os.makedirs("temp", exist_ok=True)
    path = f"temp/{file_id}_{file.filename}"
    with open(path, "wb") as b: shutil.copyfileobj(file.file, b)
    
    text = PDFService.extract_text(path)
    chunks = PDFService.chunk_text(text)
    VectorService.add_documents(file_id, chunks)
    
    db_doc = DocumentMetadata(filename=file.filename, file_id=file_id)
    db.add(db_doc); db.commit()
    os.remove(path)
    return {"document_id": file_id}

@api_router.get("/workflows")
def list_wf(db: Session = Depends(get_db)): return db.query(Workflow).all()

@api_router.post("/workflows")
def create_wf(data: dict, db: Session = Depends(get_db)):
    new_wf = Workflow(name=data["name"], description=data.get("description"), nodes=data["nodes"], edges=data["edges"])
    db.add(new_wf); db.commit(); db.refresh(new_wf); return new_wf

@api_router.put("/workflows/{id}")
def update_wf(id: int, data: dict, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    wf.name, wf.description, wf.nodes, wf.edges = data["name"], data["description"], data["nodes"], data["edges"]
    db.commit(); return {"status": "ok"}

@api_router.post("/run-workflow")
async def run(data: dict):
    return {"answer": WorkflowEngine.run_workflow(data["workflow"], data["query"])}