from prompts.solar import SOLAR_INSTALLATION_PROMPT

try:
    formatted = SOLAR_INSTALLATION_PROMPT.format(
        language="en",
        skill_level="beginner",
        history_summary="[]",
        current_task="test"
    )
    print("Formatting SUCCESS!")
    print(formatted[-200:]) # Print end of prompt to verify JSON structure
except Exception as e:
    print(f"Formatting FAILED : {e}")
