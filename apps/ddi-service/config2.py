import os
from dotenv import load_dotenv

# Load environment variables from local .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
LLM_MODEL = os.getenv("LLM_MODEL")
CHAT_DB = os.getenv("CHAT_DB")
MEDS_DB = os.getenv("MEDS_DB")
USER_DB = os.getenv("USER_DB")