from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from agent_engine import AgentEngine
from models import Agent
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = AgentEngine()


@app.post("/agent")
def create_agent(agent: Agent):
    agent_dict = agent.dict()
    agent_id = engine.create_agent(agent_dict)
    logger.info(f"Created agent: {agent_id} ({agent.name})")
    return {"agent_id": agent_id}


@app.post("/connect")
def connect(body: dict):
    engine.connect(body["from"], body["to"])
    logger.info(f"Connected {body['from']} -> {body['to']}")
    return {"connected": True}


@app.post("/send")
def send_msg(body: dict):
    logger.info(f"Sending message from {body['sender']}")
    out = engine.send(body["sender"], body["message"])
    return {"messages": out}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    logger.info("WebSocket connected")
    try:
        while True:
            data = await ws.receive_json()
            sender = data["sender"]
            msg = data["message"]
            logger.info(f"WS Message from {sender}: {msg}")

            for message in engine.send(sender, msg):
                await ws.send_json({
                    "from": sender,
                    "to": message["target"],
                    "message": message["reply"]
                })
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        pass
