import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root (2 levels up from src/) - optional for local development
try {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
} catch (err) {
    // Silent - will use environment variables
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

// 🔒 Validate critical environment variables (only log if missing)
const requiredEnvVars = [
    'MONGO_URI',
    'DB_NAME',
    'COLLECTION_NAME',
    'LLM_MODEL',
    'CHAT_DB',
    'MEDS_DB',
    'USER_DB',
    'OPENROUTER_API_KEY'
];

const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('⚠️ Server may not function correctly without these variables');
} else {
    console.log('✅ All environment variables loaded successfully');
}
