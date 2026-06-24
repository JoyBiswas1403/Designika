"""
Design Crew - Orchestrates the Researcher and Designer agents.
"""
from crewai import Crew, Task
from agents.researcher import create_researcher_agent, get_user_context
from agents.designer import create_designer_agent
import logging

logger = logging.getLogger(__name__)

class DesignCrew:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.researcher = create_researcher_agent()
        self.designer = create_designer_agent()
    
    def create_design_brief(self, user_prompt: str, room_type: str = "living room") -> dict:
        """
        Execute the multi-agent workflow to create a design brief.
        """
        # Inject user context from Memory
        user_context = get_user_context(self.user_id)
        
        # Define Tasks
        research_task = Task(
            description=f"""
            Analyze the user's request and gather context for designing a {room_type}.
            
            User Request: {user_prompt}
            
            Known User Preferences:
            {user_context}
            
            Your job is to:
            1. Identify the core design style the user wants.
            2. Note any specific requirements (colors, furniture, etc.).
            3. Consider current design trends that match.
            4. Output a structured "Design Brief" document.
            """,
            agent=self.researcher,
            expected_output="A structured design brief with style, colors, furniture, and mood."
        )
        
        design_task = Task(
            description="""
            Based on the Research Brief, craft a highly detailed prompt for an AI image 
            generation model (Replicate Flux). The prompt should describe:
            - Room layout and perspective
            - Lighting conditions
            - Materials and textures
            - Color palette
            - Key furniture pieces
            - Atmosphere and mood
            
            Output should be a single, highly optimized text prompt.
            """,
            agent=self.designer,
            expected_output="A single optimized image generation prompt string.",
            context=[research_task]
        )
        
        # Execute Crew
        crew = Crew(
            agents=[self.researcher, self.designer],
            tasks=[research_task, design_task],
            verbose=True
        )
        
        try:
            result = crew.kickoff()
            logger.info(f"Crew execution complete for user {self.user_id}")
            return {
                "success": True,
                "design_brief": research_task.output if hasattr(research_task, 'output') else None,
                "generated_prompt": str(result)
            }
        except Exception as e:
            logger.error(f"Crew execution failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
