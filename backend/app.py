from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from agent_engine import AgentEngine
from models import Agent

app = FastAPI()
engine = AgentEngine()


@app.post("/agent")
def create_agent(agent: Agent):
    agent_dict = agent.dict()
    agent_id = engine.create_agent(agent_dict)
    return {"agent_id": agent_id}


@app.post("/connect")
def connect(body: dict):
    engine.connect(body["from"], body["to"])
    return {"connected": True}


@app.post("/send")
def send_msg(body: dict):
    out = engine.send(body["sender"], body["message"])
    return {"messages": out}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            sender = data["sender"]
            msg = data["message"]

            for message in engine.send(sender, msg):
                await ws.send_json({
                    "from": sender,
                    "to": message["target"],
                    "message": message["reply"]
                })
    except WebSocketDisconnect:
        # Client disconnected, clean up gracefully
        pass
