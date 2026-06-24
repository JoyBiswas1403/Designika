"""
Researcher Agent - Gathers context, trends, and user preferences.
"""
from crewai import Agent
from services.memory_service import memory_service

def create_researcher_agent() -> Agent:
    """Create the Researcher Agent."""
    return Agent(
        role="Interior Design Researcher",
        goal="Gather comprehensive context about the user's design needs, preferences, and current trends.",
        backstory="""You are a world-class interior design research analyst with 15 years 
        of experience studying design psychology, color theory, and spatial planning. 
        You have a keen eye for understanding what people truly want in their living spaces, 
        often before they can articulate it themselves. You specialize in translating vague 
        desires into concrete design briefs.""",
        verbose=True,
        allow_delegation=False,
        # Tools can be added here (e.g., web search, memory retrieval)
    )

def get_user_context(user_id: str) -> str:
    """Retrieve stored user preferences from Memory."""
    memories = memory_service.get_memories(user_id)
    if not memories:
        return "No previous preferences stored for this user."
    
    context = "User's known preferences:\n"
    for mem in memories:
        context += f"- {mem.get('memory', mem)}\n"
    return context
