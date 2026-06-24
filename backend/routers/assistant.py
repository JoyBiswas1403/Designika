"""
Designika AI Assistant - Jarvis Mode Backend.
Uses OpenAI GPT-4o with Function Calling to control the entire app via voice/vision/text.
29 function-calling tools — full UI control, zero limitations (except payments).
"""
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
import openai
import json
import logging
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# --- Function Definitions (What the AI can do) ---

ASSISTANT_FUNCTIONS = [
    # ──────── NAVIGATION ────────
    {
        "type": "function",
        "function": {
            "name": "navigate",
            "description": "Navigate to a page in the app. Use this when the user wants to go somewhere.",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {
                        "type": "string",
                        "enum": ["home", "gallery", "history", "profile", "transform", "login", "register", "pricing"],
                        "description": "The page to navigate to"
                    }
                },
                "required": ["page"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "go_back",
            "description": "Navigate back to the previous page in browser history.",
            "parameters": {"type": "object", "properties": {}}
        }
    },

    # ──────── DESIGN GENERATION ────────
    {
        "type": "function",
        "function": {
            "name": "generate_design",
            "description": "Generate an interior design. Use when user wants to create, redesign, or transform a room.",
            "parameters": {
                "type": "object",
                "properties": {
                    "room_type": {
                        "type": "string",
                        "enum": ["living-room", "bedroom", "kitchen", "bathroom", "office", "dining-room"],
                        "description": "Type of room"
                    },
                    "style": {
                        "type": "string",
                        "enum": ["modern", "minimalist", "industrial", "scandinavian", "bohemian", "japanese", "mid-century", "coastal", "art-deco", "rustic", "contemporary", "traditional"],
                        "description": "Design style"
                    },
                    "custom_prompt": {
                        "type": "string",
                        "description": "Additional details for the design"
                    }
                },
                "required": ["room_type", "style"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_room_type",
            "description": "Set the room type for design generation. Use when user says a room name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "room_type": {
                        "type": "string",
                        "enum": ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining Room", "Balcony", "Closet"],
                        "description": "The room type to set"
                    }
                },
                "required": ["room_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_style",
            "description": "Set the design style for generation. Use when the user wants to change to a specific style.",
            "parameters": {
                "type": "object",
                "properties": {
                    "style": {
                        "type": "string",
                        "enum": ["modern_minimalist", "scandinavian", "industrial", "mid_century", "bohemian", "japandi", "art_deco", "coastal", "biophilic", "traditional", "maximalist"],
                        "description": "Design style ID"
                    }
                },
                "required": ["style"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_prompt",
            "description": "Set or update the custom design prompt with additional details like colors, materials, or mood.",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The custom prompt text, e.g. 'warm tones with natural wood and green plants'"
                    }
                },
                "required": ["prompt"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_lighting",
            "description": "Set the lighting mode for design generation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "lighting": {
                        "type": "string",
                        "enum": ["golden", "dramatic", "natural_bright", "studio", "warm_bulb"],
                        "description": "Lighting mode ID"
                    }
                },
                "required": ["lighting"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_creativity",
            "description": "Set the creativity/intensity level for design generation (0 = subtle, 100 = wild).",
            "parameters": {
                "type": "object",
                "properties": {
                    "level": {
                        "type": "integer",
                        "description": "Creativity level from 0 to 100"
                    }
                },
                "required": ["level"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "start_transform",
            "description": "Start/trigger the design transformation. Use when an image is already uploaded and the user wants to generate.",
            "parameters": {"type": "object", "properties": {}}
        }
    },

    # ──────── FILE / IMAGE ────────
    {
        "type": "function",
        "function": {
            "name": "upload_image",
            "description": "Open the file upload dialog to upload a room photo for design transformation.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "download_image",
            "description": "Download the currently generated design image.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reset_design",
            "description": "Clear the current uploaded image and generated result, resetting the studio canvas.",
            "parameters": {"type": "object", "properties": {}}
        }
    },

    # ──────── STUDIO UI CONTROLS ────────
    {
        "type": "function",
        "function": {
            "name": "toggle_sidebar",
            "description": "Toggle a sidebar panel in the design studio.",
            "parameters": {
                "type": "object",
                "properties": {
                    "side": {
                        "type": "string",
                        "enum": ["left", "right"],
                        "description": "Which sidebar to toggle. Left = styles/rooms, Right = lighting/creativity."
                    }
                },
                "required": ["side"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "toggle_eraser",
            "description": "Toggle the magic eraser mode in the design studio.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "zoom",
            "description": "Zoom in or out on the design preview.",
            "parameters": {
                "type": "object",
                "properties": {
                    "direction": {
                        "type": "string",
                        "enum": ["in", "out", "reset"],
                        "description": "Zoom direction"
                    }
                },
                "required": ["direction"]
            }
        }
    },

    # ──────── INTELLIGENCE ────────

    {
        "type": "function",
        "function": {
            "name": "analyze_room",
            "description": "Analyze a room image from the camera. Use when user shares or captures a photo of their room.",
            "parameters": {
                "type": "object",
                "properties": {
                    "analysis_type": {
                        "type": "string",
                        "enum": ["full", "furniture", "color", "style", "improvement"],
                        "description": "What to focus the analysis on"
                    }
                },
                "required": ["analysis_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "remember_preference",
            "description": "Store a user preference for future reference. Use when user states what they like/dislike.",
            "parameters": {
                "type": "object",
                "properties": {
                    "preference": {
                        "type": "string",
                        "description": "The preference to remember, e.g. 'likes Japanese style'"
                    }
                },
                "required": ["preference"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recall_preferences",
            "description": "Recall stored user preferences. Use when user asks what you remember about them.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_designs",
            "description": "Search or filter the design gallery by style or query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query or style filter"
                    }
                },
                "required": ["query"]
            }
        }
    },

    # ──────── THEME & DISPLAY ────────
    {
        "type": "function",
        "function": {
            "name": "toggle_theme",
            "description": "Toggle between dark and light mode.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_dark_mode",
            "description": "Explicitly set dark mode or light mode.",
            "parameters": {
                "type": "object",
                "properties": {
                    "enabled": {
                        "type": "boolean",
                        "description": "true for dark mode, false for light mode"
                    }
                },
                "required": ["enabled"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "toggle_fullscreen",
            "description": "Toggle browser fullscreen mode.",
            "parameters": {"type": "object", "properties": {}}
        }
    },

    # ──────── PAGE CONTROLS ────────
    {
        "type": "function",
        "function": {
            "name": "scroll_page",
            "description": "Scroll the page up or down.",
            "parameters": {
                "type": "object",
                "properties": {
                    "direction": {
                        "type": "string",
                        "enum": ["up", "down", "top", "bottom"],
                        "description": "Scroll direction"
                    }
                },
                "required": ["direction"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "refresh_page",
            "description": "Refresh/reload the current page.",
            "parameters": {"type": "object", "properties": {}}
        }
    },

    # ──────── AUTH ────────
    {
        "type": "function",
        "function": {
            "name": "logout",
            "description": "Log the user out of their account.",
            "parameters": {"type": "object", "properties": {}}
        }
    },

    # ──────── MISC ────────
    {
        "type": "function",
        "function": {
            "name": "open_chat",
            "description": "Open or focus the chat/assistant panel if it is hidden.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_help",
            "description": "Show a list of all available voice commands. Use when user asks 'what can you do?' or 'help'.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
]

SYSTEM_PROMPT = """You are Designika, an advanced AI interior design assistant with FULL control of the app. You are powerful, unlimited, and can do EVERYTHING the user asks (except payments).

Your personality:
- Warm, sophisticated, and creative
- Speak concisely (1-2 sentences for actions, more for advice)
- Use design terminology naturally
- Be enthusiastic about design without being over-the-top
- When in doubt, take action — never say "I can't do that"

FULL LIST OF YOUR 29 CAPABILITIES — use functions aggressively:

🧭 NAVIGATION
- navigate: Go to any page (home, gallery, history, profile, transform, login, register, pricing)
- go_back: Go back to previous page

🎨 DESIGN CONTROLS
- set_room_type: Set room type (Living Room, Bedroom, Kitchen, Bathroom, Office, Dining Room, Balcony, Closet)
- set_style: Set style (modern_minimalist, scandinavian, industrial, mid_century, bohemian, japandi, art_deco, coastal, biophilic, traditional, maximalist)
- set_prompt: Set custom design prompt with materials, colors, mood
- set_lighting: Set lighting (golden, dramatic, natural_bright, studio, warm_bulb)
- set_creativity: Set creativity slider (0-100, higher = more dramatic changes)
- generate_design: Set room type + style and navigate to studio
- start_transform: Trigger the actual generation/transformation

📁 FILES
- upload_image: Open file dialog to upload a room photo
- download_image: Download the generated design image
- reset_design: Clear the current image and reset the studio

🎛️ STUDIO UI
- toggle_sidebar: Show/hide left or right sidebar panel
- toggle_eraser: Toggle magic eraser mode
- zoom: Zoom in, out, or reset the design preview
- toggle_fullscreen: Toggle fullscreen mode

🧠 INTELLIGENCE

- analyze_room: Analyze a room photo (full, furniture, color, style, improvement)
- remember_preference: Remember what the user likes/dislikes
- recall_preferences: Recall stored preferences
- search_designs: Search the gallery

🎨 THEME
- toggle_theme: Toggle dark/light mode
- set_dark_mode: Explicitly set dark or light mode

📜 PAGE CONTROLS
- scroll_page: Scroll up, down, to top, or to bottom
- refresh_page: Reload the current page

🔐 AUTH
- logout: Log the user out

💬 MISC
- open_chat: Focus the assistant panel
- show_help: List all available commands

Rules:
- NEVER handle payments, purchases, or financial transactions
- If asked about payments, say "For security, please use the Pricing page for purchases." and navigate there
- Always use function calls when the user wants an action performed
- For design advice questions, just reply with text (no function call needed)
- Keep spoken responses SHORT (they will be read aloud via TTS)
- If user shows a room image, describe what you see and suggest improvements
- When the user says just a style name or room type, use set_style or set_room_type
- When the user says "generate" or "transform" or "create" or "design it", use start_transform
- When the user says "clear" or "reset" or "start over", use reset_design
- When user says "zoom in", "zoom out", "zoom reset", use zoom
- When user asks "what can you do?" or "help", use show_help
- Be proactive: if user says "make me a modern living room", call BOTH set_style AND set_room_type, then start_transform
"""


class AssistantRequest(BaseModel):
    message: str
    image_base64: Optional[str] = None
    history: list = []
    user_id: Optional[str] = None


class AssistantAction(BaseModel):
    action: str
    params: dict = {}


class AssistantResponse(BaseModel):
    reply: str
    speech: str  # Shorter version for TTS
    actions: list = []


@router.post("/", response_model=AssistantResponse)
async def process_assistant(request: AssistantRequest):
    """Process a voice/text/vision input and return reply + actions."""
    try:
        # Build messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history
        for msg in request.history[-10:]:  # Last 10 messages
            role = "assistant" if msg.get("role") == "model" else "user"
            messages.append({"role": role, "content": msg.get("content", "")})

        # Build current user message
        user_content = []

        # Add text
        if request.message:
            user_content.append({"type": "text", "text": request.message})

        # Add image if present (vision)
        if request.image_base64:
            # Ensure proper data URI format
            img_data = request.image_base64
            if not img_data.startswith("data:"):
                img_data = f"data:image/jpeg;base64,{img_data}"

            user_content.append({
                "type": "image_url",
                "image_url": {"url": img_data, "detail": "low"}
            })

        messages.append({"role": "user", "content": user_content if request.image_base64 else request.message})

        # Call OpenAI with function calling
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=ASSISTANT_FUNCTIONS,
            tool_choice="auto",
            max_tokens=500,
            temperature=0.7
        )

        choice = response.choices[0]
        actions = []
        reply_parts = []

        # Process function calls
        if choice.message.tool_calls:
            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}

                action = {"action": fn_name, "params": fn_args}
                actions.append(action)

                # Build reply for each action

                if fn_name == "remember_preference":
                    pref = fn_args.get("preference", "")
                    reply_parts.append(f"I'll remember that: {pref}")

                elif fn_name == "navigate":
                    page = fn_args.get("page", "home")
                    page_names = {
                        "home": "the home page",
                        "gallery": "the design gallery",
                        "history": "your design history",
                        "profile": "your profile",
                        "transform": "the design studio",
                        "login": "the login page",
                        "register": "the registration page",
                        "pricing": "the pricing page"
                    }
                    reply_parts.append(f"Taking you to {page_names.get(page, page)}.")

                elif fn_name == "generate_design":
                    style = fn_args.get("style", "modern")
                    room = fn_args.get("room_type", "room")
                    reply_parts.append(f"Creating a {style} {room.replace('-', ' ')} design for you!")

                elif fn_name == "toggle_theme":
                    reply_parts.append("Switching the theme for you!")

                elif fn_name == "analyze_room":
                    reply_parts.append("Let me analyze this room for you...")

                elif fn_name == "search_designs":
                    query = fn_args.get("query", "")
                    reply_parts.append(f"Searching for {query} designs...")

                elif fn_name == "logout":
                    reply_parts.append("Logging you out. See you next time!")

                elif fn_name == "set_room_type":
                    rt = fn_args.get("room_type", "Living Room")
                    reply_parts.append(f"Room type set to {rt}.")

                elif fn_name == "set_style":
                    st = fn_args.get("style", "modern_minimalist").replace('_', ' ').title()
                    reply_parts.append(f"Style set to {st}.")

                elif fn_name == "set_prompt":
                    reply_parts.append("Custom prompt updated!")

                elif fn_name == "start_transform":
                    reply_parts.append("Starting the design transformation!")

                elif fn_name == "set_lighting":
                    lt = fn_args.get("lighting", "natural_bright").replace('_', ' ').title()
                    reply_parts.append(f"Lighting set to {lt}.")

                elif fn_name == "set_creativity":
                    lvl = fn_args.get("level", 50)
                    reply_parts.append(f"Creativity set to {lvl}%.")

                elif fn_name == "download_image":
                    reply_parts.append("Downloading your design!")

                elif fn_name == "go_back":
                    reply_parts.append("Going back.")

                elif fn_name == "scroll_page":
                    d = fn_args.get("direction", "down")
                    reply_parts.append(f"Scrolling {d}.")

                elif fn_name == "toggle_fullscreen":
                    reply_parts.append("Toggling fullscreen.")

                elif fn_name == "refresh_page":
                    reply_parts.append("Refreshing the page.")

                elif fn_name == "upload_image":
                    reply_parts.append("Tap the upload button on screen to select your room photo.")

                elif fn_name == "set_dark_mode":
                    enabled = fn_args.get("enabled", True)
                    reply_parts.append(f"Switching to {'dark' if enabled else 'light'} mode.")

                elif fn_name == "reset_design":
                    reply_parts.append("Resetting the studio. Upload a new photo to start fresh!")

                elif fn_name == "toggle_sidebar":
                    side = fn_args.get("side", "left")
                    reply_parts.append(f"Toggling the {side} sidebar.")

                elif fn_name == "toggle_eraser":
                    reply_parts.append("Toggling the magic eraser.")

                elif fn_name == "zoom":
                    d = fn_args.get("direction", "in")
                    reply_parts.append(f"Zooming {d}.")

                elif fn_name == "show_help":
                    reply_parts.append(
                        "I can do everything! Navigate pages, set room type, style, lighting, creativity, "
                        "generate designs, upload/download images, reset the studio, toggle sidebars, "
                        "eraser mode, zoom, scroll, fullscreen, dark/light mode, check credits, "
                        "analyze rooms, remember your preferences, search the gallery, and more. "
                        "Just tell me what you want!"
                    )

        # Get text reply if present
        if choice.message.content:
            reply_parts.append(choice.message.content)

        full_reply = " ".join(reply_parts) if reply_parts else "I'm here to help with your interior design needs!"

        # Create a shorter speech version (for TTS)
        speech = full_reply
        if len(speech) > 200:
            # Truncate for TTS to keep it natural
            sentences = speech.split(". ")
            speech = ". ".join(sentences[:2]) + "."

        return AssistantResponse(
            reply=full_reply,
            speech=speech,
            actions=actions
        )

    except openai.APIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable")
    except Exception as e:
        logger.error(f"Assistant error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
