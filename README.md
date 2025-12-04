# 🧠 AI Agent Network Builder  
A visual multi-agent system like AutoGPT, created with:

- Frontend: React + ReactFlow + Vite  
- Backend: FastAPI + OpenAI  
- Real-time communication: WebSockets  

---

## 🚀 Features
- Create agents with roles & goals  
- Drag-and-drop agent graph  
- Connect agents visually  
- Agents talk to each other automatically  
- Real-time logs viewer  
- OpenAI-driven reasoning  

---

## 📁 Project Structure
See full structure in repo.

---

## 🔧 Setup Instructions

### 1. Install Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Add your OpenAI API key inside .env.

### 2. Install Frontend
```bash
cd frontend
npm install
npm run dev
```

💡 Future Additions

Persistent storage

Agent tools (web search, APIs)

Auto-generate workflow from text

Prompt templates

Export graph JSON

📜 License

MIT
