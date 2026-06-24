"""
RAG Service - Retrieval Augmented Generation for Design Knowledge.
Uses Haystack for pipelines and Unstructured for document parsing.
"""
from haystack import Pipeline
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.converters import TextFileToDocument
from haystack.components.preprocessors import DocumentSplitter
from config import settings
import logging

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.document_store = None
        self.query_pipeline = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the document store and pipelines."""
        try:
            # In-memory store for now (can switch to Milvus in production)
            self.document_store = InMemoryDocumentStore()
            
            # Query Pipeline
            self.query_pipeline = Pipeline()
            self.query_pipeline.add_component(
                "embedder", 
                SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
            )
            self.query_pipeline.add_component(
                "retriever",
                InMemoryEmbeddingRetriever(document_store=self.document_store)
            )
            self.query_pipeline.connect("embedder.embedding", "retriever.query_embedding")
            
            logger.info("✅ RAG Service Initialized")
        except Exception as e:
            logger.error(f"❌ RAG Service Init Failed: {e}")
    
    def index_text(self, text: str, metadata: dict = None):
        """Index a piece of text into the document store."""
        if not self.document_store:
            return False
        
        try:
            from haystack import Document
            doc = Document(content=text, meta=metadata or {})
            
            # Embed and store
            embedder = SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
            embedding_result = embedder.run([doc.content])
            doc.embedding = embedding_result["embedding"]
            
            self.document_store.write_documents([doc])
            logger.info(f"Indexed document: {text[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Indexing failed: {e}")
            return False
    
    def query(self, question: str, top_k: int = 5) -> list:
        """Query the knowledge base for relevant documents."""
        if not self.query_pipeline:
            return []
        
        try:
            result = self.query_pipeline.run({
                "embedder": {"text": question}
            })
            documents = result.get("retriever", {}).get("documents", [])
            return [
                {
                    "content": doc.content,
                    "score": doc.score,
                    "metadata": doc.meta
                }
                for doc in documents[:top_k]
            ]
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return []
    
    def parse_and_index_file(self, file_path: str):
        """Parse a file (PDF, TXT, etc.) and index its contents."""
        try:
            # Use Unstructured for robust parsing
            from unstructured.partition.auto import partition
            elements = partition(filename=file_path)
            
            full_text = "\n".join([str(el) for el in elements])
            
            # Split into chunks
            splitter = DocumentSplitter(split_by="sentence", split_length=3)
            from haystack import Document
            doc = Document(content=full_text, meta={"source": file_path})
            chunks = splitter.run([doc])
            
            # Index each chunk
            for chunk in chunks.get("documents", []):
                self.index_text(chunk.content, {"source": file_path})
            
            logger.info(f"Parsed and indexed: {file_path}")
            return True
        except ImportError:
            logger.warning("Unstructured library not available for file parsing")
            return False
        except Exception as e:
            logger.error(f"File parsing failed: {e}")
            return False

# Global Instance
rag_service = RAGService()
