from pymongo import MongoClient
from config import settings
import datetime

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None
        try:
            self.client = MongoClient(settings.MONGO_URL)
            self.db = self.client.get_database("designika_logs")
            print("✅ Connected to MongoDB")
        except Exception as e:
            print(f"❌ MongoDB Connection Error: {e}")

    def get_collection(self, name: str):
        if self.db is not None:
            return self.db[name]
        return None

    def log_agent_thought(self, agent_name: str, thought: str, task_id: str):
        collection = self.get_collection("agent_logs")
        if collection:
            collection.insert_one({
                "agent": agent_name,
                "thought": thought,
                "task_id": task_id,
                "timestamp": datetime.datetime.utcnow()
            })

# Global Instance
mongo_client = MongoDBClient()
