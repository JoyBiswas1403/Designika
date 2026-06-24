from pymilvus import connections, Collection, utility
from config import settings

class MilvusClient:
    def __init__(self):
        self.alias = "default"
        try:
            # Parse Host/Port from URI (Simple connection)
            # URI format: http://localhost:19530
            host = settings.MILVUS_URI.split(":")[1].replace("//","")
            port = settings.MILVUS_URI.split(":")[2]
            
            connections.connect(alias=self.alias, host=host, port=port)
            print("✅ Connected to Milvus")
        except Exception as e:
            print(f"❌ Milvus Connection Error: {e}")
            
    def create_collection(self, name: str, schema):
        if not utility.has_collection(name):
            Collection(name=name, schema=schema)

# Global connection (Lazy load recommended in Prod)
# milvus_client = MilvusClient()
