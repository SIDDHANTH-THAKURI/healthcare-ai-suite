import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root (2 levels up from src/) - optional for local development
try {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
    console.log('✅ Loaded .env file');
} catch (err) {
    console.log('ℹ️ No .env file found, using environment variables');
}

export const MONGO_URI = process.env.MONGO_URI as string;
export const DB_NAME = process.env.DB_NAME as string;
export const COLLECTION_NAME = process.env.COLLECTION_NAME as string;
export const LLM_MODEL = process.env.LLM_MODEL as string;
export const CHAT_DB = process.env.CHAT_DB as string;
export const MEDS_DB = process.env.MEDS_DB as string;
export const USER_DB = process.env.USER_DB as string;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY as string;
export const OPENROUTER_URL = process.env.OPENROUTER_URL as string;

// 🔒 Log missing environment variables instead of crashing
[
    ['MONGO_URI', MONGO_URI],
    ['DB_NAME', DB_NAME],
    ['COLLECTION_NAME', COLLECTION_NAME],
    ['LLM_MODEL', LLM_MODEL],
    ['CHAT_DB', CHAT_DB],
    ['MEDS_DB', MEDS_DB],
    ['USER_DB', USER_DB],
    ['OPENROUTER_API_KEY', OPENROUTER_API_KEY]
].forEach(([key, val]) => {
    if (!val) {
        console.warn(`⚠️ Missing env var: ${key}`);
    } else {
        console.log(`✅ ${key}: ${key === 'MONGO_URI' || key === 'OPENROUTER_API_KEY' ? '[REDACTED]' : val}`);
    }
});
