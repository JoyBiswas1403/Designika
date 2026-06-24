# Simple in-memory value to hold the current session user for the demo
# This allows the Login -> Profile flow to feel dynamic even without a real DB

class MockState:
    active_user = {
        "id": "user_default",
        "email": "demo@designika.ai",
        "username": "Guest User",
        "profile_picture": None,
        "bio": "Interior Design Enthusiast"
    }

    @classmethod
    def set_user(cls, email: str, username: str = None):
        # Auto-generate username from email if not provided
        if not username:
            username = email.split("@")[0].capitalize()
        
        # Generate dynamic avatar
        avatar_url = f"https://ui-avatars.com/api/?name={username}&background=random&color=fff"

        cls.active_user = {
            "id": "user_" + email.replace("@", "_").replace(".", "_"),
            "email": email,
            "username": username,
            "profile_picture": avatar_url,
            "bio": "Designika Member"
        }

    @classmethod
    def get_user(cls):
        return cls.active_user
