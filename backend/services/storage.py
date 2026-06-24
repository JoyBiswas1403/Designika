# Simple In-Memory Storage
# Keys: design_id (str)
# Values: dict { "id", "local_path", "room_type", "style", ... }

MOCK_DB = {}

def get_design(design_id: str):
    return MOCK_DB.get(design_id)

def save_design(design_id: str, data: dict):
    MOCK_DB[design_id] = data
    return data
