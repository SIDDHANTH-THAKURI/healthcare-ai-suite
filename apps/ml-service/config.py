import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from root .env file
root_env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(root_env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
LLM_MODEL = os.getenv("LLM_MODEL")
CHAT_DB = os.getenv("CHAT_DB")
MEDS_DB = os.getenv("MEDS_DB")
USER_DB = os.getenv("USER_DB")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
TESSERACT_CMD = os.getenv("TESSERACT_CMD")