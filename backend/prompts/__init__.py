"""
VocaLive Skill Prompt Registry
Maps skill IDs to their expert coaching prompts.
"""

from prompts.solar import (
    SOLAR_INSTALLATION_PROMPT,
    WELDING_PROMPT,
    ELECTRICAL_WIRING_PROMPT,
    AUTO_MECHANICS_PROMPT,
    CARPENTRY_PROMPT,
    FARMING_PROMPT,
)

# Skill metadata for frontend rendering
SKILLS = {
    "solar": {
        "name": "Solar Installation",
        "name_ha": "Girka Hasken Rana",
        "icon": "sun",
        "color": "#F59E0B",
        "default_task": "Installing solar panel mount",
        "prompt": SOLAR_INSTALLATION_PROMPT,
    },
    "welding": {
        "name": "Welding",
        "name_ha": "Walda",
        "icon": "flame",
        "color": "#EF4444",
        "default_task": "Practicing flat position bead",
        "prompt": WELDING_PROMPT,
    },
    "electrical": {
        "name": "Electrical Wiring",
        "name_ha": "Haɗa Waya",
        "icon": "zap",
        "color": "#3B82F6",
        "default_task": "Wiring a socket outlet",
        "prompt": ELECTRICAL_WIRING_PROMPT,
    },
    "mechanics": {
        "name": "Auto Mechanics",
        "name_ha": "Injiniya Mota",
        "icon": "wrench",
        "color": "#8B5CF6",
        "default_task": "Performing oil change",
        "prompt": AUTO_MECHANICS_PROMPT,
    },
    "carpentry": {
        "name": "Carpentry",
        "name_ha": "Sassaƙa",
        "icon": "hammer",
        "color": "#D97706",
        "default_task": "Making a straight crosscut",
        "prompt": CARPENTRY_PROMPT,
    },
    "farming": {
        "name": "Farming",
        "name_ha": "Noma",
        "icon": "sprout",
        "color": "#10B981",
        "default_task": "Planting maize seeds",
        "prompt": FARMING_PROMPT,
    },
}

LANGUAGE_INSTRUCTIONS = {
    "en": "English. Use simple, clear English suitable for vocational learners.",
    "ha": "Hausa (Harshen Hausa). Respond fully in Hausa language. Use everyday Hausa that a young person in Kano or Kaduna would understand naturally. For technical terms with no Hausa equivalent, say the English term then briefly explain in Hausa.",
}


def get_prompt(skill_id: str, language: str, skill_level: str, history_summary: str, current_task: str, user_question: str = None) -> str:
    """Build the complete prompt for a given skill and language."""
    skill = SKILLS.get(skill_id, SKILLS["solar"])
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    
    if not current_task:
        current_task = skill["default_task"]
    
    user_question_section = ""
    if user_question:
        user_question_section = f"\nUSER QUESTION (answer this in your feedback alongside your visual observation):\n\"{user_question}\"\n"
    
    return skill["prompt"].format(
        language_instruction=lang_instruction,
        skill_level=skill_level,
        history_summary=history_summary,
        current_task=current_task,
        user_question_section=user_question_section,
    )
