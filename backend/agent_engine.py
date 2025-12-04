import uuid
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AgentEngine:
    def __init__(self):
        self.agents = {}
        self.connections = {}   # a → [b, c, d]

    def create_agent(self, agent_info):
        agent_id = str(uuid.uuid4())
        self.agents[agent_id] = agent_info
        self.connections[agent_id] = []
        return agent_id

    def connect(self, src, dest):
        if src in self.agents and dest in self.agents:
            self.connections[src].append(dest)

    def send(self, sender_id, message, depth=0):
        results = []
        MAX_DEPTH = 10

        if depth > MAX_DEPTH:
            return results

        if sender_id not in self.connections:
            return results

        sender_data = self.agents[sender_id]

        for target_id in self.connections[sender_id]:
            target = self.agents[target_id]

            try:
                completion = client.chat.completions.create(
                    model=target["model"],
                    messages=[
                        {"role": "system", "content": target["role"]},
                        {"role": "user", "content": message}
                    ]
                )
                reply = completion.choices[0].message.content
            except Exception as e:
                reply = f"Error: {str(e)}"

            # Add the immediate result
            results.append({
                "target": target_id,
                "reply": reply
            })

            # Recursive call: The target becomes the sender, and their reply becomes the message
            # We pass the results from the recursive call up the chain
            sub_results = self.send(target_id, reply, depth + 1)
            results.extend(sub_results)

        return results
