from neo4j import GraphDatabase
from config import settings

class Neo4jClient:
    def __init__(self):
        self.driver = None
        try:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI, 
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            print("✅ Connected to Neo4j")
        except Exception as e:
            print(f"❌ Neo4j Connection Error: {e}")

    def close(self):
        if self.driver:
            self.driver.close()

    def run_query(self, query: str, parameters=None):
        if not self.driver:
            return None
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]

# Global Instance
neo4j_client = Neo4jClient()
