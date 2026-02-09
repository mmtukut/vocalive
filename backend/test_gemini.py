import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    # Use the one provided by user if env not loaded
    api_key = "AIzaSyB5iBS1M1Zcr3PkESTegOCEyp7plouFA7Q" 
    print("Using hardcoded key for test")

genai.configure(api_key=api_key)

# Test 1: List Models
print("\n--- Listing Available Models ---")
try:
    for m in genai.list_models():
        if 'gemini' in m.name:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")

# Test 2: Generate Content
print("\n--- Testing Content Generation ---")
try:
    model = genai.GenerativeModel('gemini-3-flash-preview')
    response = model.generate_content("Hello, can you hear me?")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error generating content: {e}")

