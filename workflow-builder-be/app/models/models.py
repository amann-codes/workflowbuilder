from sqlalchemy import JSON, Column, Integer, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class DocumentMetadata(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_id = Column(String, unique=True, index=True) # ID used in ChromaDB
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text)
    assistant_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    nodes = Column(JSON) # Stores the React Flow nodes
    edges = Column(JSON) # Stores the React Flow edges
    created_at = Column(DateTime, default=datetime.utcnow)