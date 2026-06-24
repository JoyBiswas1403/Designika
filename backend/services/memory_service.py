"""
Memory Service using Mem0 for User Preference Storage.
"""
from mem0 import Memory
from config import settings
import logging

logger = logging.getLogger(__name__)

class MemoryService:
    def __init__(self):
        self.memory = None
        try:
            # Configure Mem0 to use local SQLite/default memory storage
            self.memory = Memory()
            logger.info("✅ Mem0 Memory Service Initialized with default local storage")
        except Exception as e:
            logger.error(f"❌ Mem0 Initialization Failed: {e}")
    
    def add_memory(self, user_id: str, fact: str, metadata: dict = None):
        """Store a user preference or fact."""
        if not self.memory:
            return None
        try:
            result = self.memory.add(
                messages=fact,
                user_id=user_id,
                metadata=metadata or {}
            )
            logger.info(f"Memory added for user {user_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to add memory: {e}")
            return None
    
    def get_memories(self, user_id: str, query: str = None, limit: int = 10):
        """Retrieve user memories, optionally filtered by a query."""
        if not self.memory:
            return []
        try:
            if query:
                # Semantic search for relevant memories
                memories = self.memory.search(query=query, user_id=user_id, limit=limit)
            else:
                # Get all memories for user
                memories = self.memory.get_all(user_id=user_id)
            return memories
        except Exception as e:
            logger.error(f"Failed to retrieve memories: {e}")
            return []

# Global Instance
memory_service = MemoryService()
