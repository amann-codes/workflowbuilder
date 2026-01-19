# GenAI Workflow Builder

A platform that enables users to visually construct, manage, and interact with Intelligent RAG (Retrieval-Augmented Generation) workflows. 

This application allows you to build custom AI "Stacks" by dragging and dropping components to connect Google's Gemini LLM with personal document knowledge bases, all through a seamless visual interface.

## Key Features
- **Visual Workflow Canvas:** Built with `React Flow` for a high-performance, node-based experience.
- **RAG-as-a-Service:** Upload PDFs and extract knowledge using Google Cloud Embeddings (`text-embedding-004`).
- **Graph-Based Engine:** A FastAPI backend that parses visual connections and executes workflows as Directed Acyclic Graphs (DAGs).
- **Intelligent LLM Integration:** Uses the latest `google-genai` SDK with built-in retry logic for handling API Quota (429) errors and strict `v1` API versioning to avoid 404 model errors.
- **Full Persistence:** Metadata stored in PostgreSQL; Vector embeddings stored in a persistent ChromaDB instance.

---

## Tech Stack
- **Frontend:** React.js, Vite, React Flow, Tailwind CSS.
- **Backend:** FastAPI, SQLAlchemy, PyMuPDF (Text Extraction).
- **AI/ML:** Google Gemini (1.5 Flash), Google Cloud Embeddings.
- **Vector Store:** ChromaDB (Cloud-backed).
- **Infrastructure:** Docker, Docker Compose, Node-Serve.

---

## Prerequisites
- **Docker & Docker Compose** installed on your machine.
- **Google AI Studio API Key:** Obtain one for free at [aistudio.google.com](https://aistudio.google.com/app/apikey).

---

## Quick Start

The entire stack (Frontend, Backend, PostgreSQL, and ChromaDB) is containerized for a one-command setup.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amann-codes/workflowbuilder.git
   cd workflowbuilder
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the **root directory** (where `docker-compose.yml` is):
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Launch the Stack:**
   ```bash
   docker compose up --build
   ```

4. **Access the Application:**
   - **Frontend UI:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Manual Local Setup (Development)

If you wish to run the components without Docker:

### Backend
1. `cd workflow-builder-be`
2. Create and activate a venv: `python -m venv venv` -> `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Set `.env` with `GEMINI_API_KEY` and `DATABASE_URL=sqlite:///./test.db`.
5. Run: `uvicorn main:app --reload --port 8000`

### Frontend
1. `cd workflow-builder`
2. Install: `npm install`
3. Set `.env` with `VITE_API_URL=http://localhost:8000`.
4. Run: `npm run dev`

---

## How to Use the Builder
1. **Dashboard:** Click **"New Stack"** and give your workflow a name.
2. **The Canvas:** Drag components from the left sidebar onto the workspace.
   - **User Query:** The entry point for your questions.
   - **Knowledge Base:** Upload a PDF.
   - **LLM (Gemini):** Configure your system prompt.
   - **Output:** The final chat destination.
3. **Connections:** Connect `User Query` -> `LLM` and `Knowledge Base` -> `LLM`. Finally, connect `LLM` -> `Output`.
4. **Execution:** Click the **Save** icon, then click the **Play (Chat)** button. Ask questions based on your uploaded document!
