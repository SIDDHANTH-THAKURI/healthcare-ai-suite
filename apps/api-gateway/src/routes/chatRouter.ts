import express, { Request, Response } from 'express';
import ChatMessage from '../models/chatMessage';
import MedicationSchedule from '../models/medicationSchedule';
import Appointment from '../models/appointment';
import MedicalDocument from '../models/medicalDocument';
import Account from '../models/Account';
import axios from 'axios';
import { OPENROUTER_URL } from '../config';
import { trackUsage, getApiKey } from '../middleware/usageTracking';

// OpenRouter API response interface
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const router = express.Router();

// Free tier limit
const FREE_DAILY_LIMIT = 20;

// List of free models to try in order
const FREE_MODELS = [
  'deepseek/deepseek-chat-v3.1:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'meta-llama/llama-4-scout:free',
  'google/gemini-2.0-flash-exp:free',
  'openai/gpt-oss-20b:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.3-8b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3n-e2b-it:free'
];

// Helper function to call OpenRouter API with fallback models
async function callOpenRouterAPI(prompt: string, apiKey: string): Promise<string> {
  const systemPrompt = 'You are a helpful, friendly health assistant for a patient portal. Keep responses concise (2-3 sentences), warm, and supportive. Help with medications, appointments, and health questions.';
  
  // Try each model in order
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    
    try {
      
      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_URL,
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'DrugNexusAI Patient Portal'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices?.[0]?.message?.content?.trim();
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }
      
      return aiResponse;
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      
      // If this is the last model, throw the error
      if (i === FREE_MODELS.length - 1) {
        console.error('🚨 ALL MODELS FAILED! No AI models are available.');
        throw new Error(`All ${FREE_MODELS.length} models failed. Last error: ${errorMsg}`);
      }
      
    }
  }
  
  throw new Error('Failed to get AI response from any model');
}

// Helper function to check and update daily message count
async function checkMessageLimit(userId: string): Promise<{ allowed: boolean; remaining: number; needsApiKey: boolean }> {
  const user = await Account.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // If user has their own API key, unlimited messages
  if (user.openrouterApiKey) {
    return { allowed: true, remaining: -1, needsApiKey: false }; // -1 means unlimited
  }
  
  // Check if we need to reset daily counter
  const today = new Date().toDateString();
  if (user.lastMessageDate !== today) {
    user.dailyMessageCount = 0;
    user.lastMessageDate = today;
    await user.save();
  }
  
  // Check if user has exceeded free limit
  const remaining = FREE_DAILY_LIMIT - (user.dailyMessageCount || 0);
  
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, needsApiKey: true };
  }
  
  return { allowed: true, remaining, needsApiKey: false };
}

// Helper function to increment message count
async function incrementMessageCount(userId: string): Promise<void> {
  const user = await Account.findById(userId);
  
  if (!user || user.openrouterApiKey) {
    return; // Don't track if user has own key
  }
  
  user.dailyMessageCount = (user.dailyMessageCount || 0) + 1;
  await user.save();
}

// Get chat history
router.get('/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ChatMessage.find({ patientId: req.params.patientId })
      .sort({ timestamp: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error });
  }
});

// Send message and get AI response
router.post('/message', trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, content, userId } = req.body;
    
    // Validate input
    if (!patientId || !content || !userId) {
      console.error('❌ Missing required fields:', { patientId: !!patientId, content: !!content, userId: !!userId });
      res.status(400).json({ message: 'Missing patientId, content, or userId' });
      return;
    }

    // Get API key from middleware (already checked usage limit)
    const apiKey = getApiKey(req);
    const user = await Account.findById(userId);
    

    // Save user message
    const userMessage = new ChatMessage({
      patientId,
      role: 'user',
      content,
      timestamp: new Date()
    });
    await userMessage.save();

    // Use AI to detect intent and extract data
    const analysisPrompt = `Analyze this patient message and extract structured information:

Message: "${content}"

Determine the intent and extract relevant data. Return ONLY valid JSON in this exact format:
{
  "intent": "medication_add" | "appointment_create" | "query" | "general",
  "medications": [{"name": "", "dosage": "", "frequency": "", "duration": ""}],
  "appointments": [{"doctorName": "", "date": "YYYY-MM-DD", "time": "HH:MM", "type": ""}]
}

Rules:
- Only include medications array if user wants to ADD a medication
- Only include appointments array if user wants to SCHEDULE an appointment
- Use "query" for questions about existing medications/appointments
- Use "general" for greetings and other messages
- Return ONLY the JSON, no other text`;

    let intent = 'general';
    let extractedData: any = {};
    
    try {
      const analysisResponse = await callOpenRouterAPI(analysisPrompt, apiKey);
      
      // Extract JSON from response
      const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        intent = parsed.intent || 'general';
        extractedData = parsed;
      }
    } catch (error: any) {
      console.error('AI analysis failed:', error.message);
      // If AI fails, just treat as general message
      intent = 'general';
    }

    // Process extracted data
    if (intent === 'medication_add' && extractedData.medications?.length > 0) {
      for (const med of extractedData.medications) {
        if (med.name) {
          const schedule = new MedicationSchedule({
            patientId,
            medicationId: `med-${Date.now()}`,
            medicationName: med.name,
            dosage: med.dosage || 'As prescribed',
            schedules: [
              { time: '08:00', taken: false, skipped: false },
              { time: '20:00', taken: false, skipped: false }
            ],
            date: new Date(),
            adherenceScore: 0
          });
          await schedule.save();
        }
      }
    }

    if (intent === 'appointment_create' && extractedData.appointments?.length > 0) {
      for (const apt of extractedData.appointments) {
        if (apt.doctorName && apt.date) {
          const appointment = new Appointment({
            patientId,
            doctorId: 'doctor-tbd',
            doctorName: apt.doctorName,
            specialty: 'General',
            dateTime: new Date(`${apt.date}T${apt.time || '00:00'}`),
            type: apt.type || 'consultation',
            status: 'scheduled'
          });
          await appointment.save();
        }
      }
    }

    // Fetch patient's medical document summaries
    const medicalDocs = await MedicalDocument.find({ patientId }).sort({ uploadDate: -1 });
    
    const medicalContext = medicalDocs
      .filter(doc => doc.aiSummary && doc.aiSummary !== 'Medical information stored.')
      .map(doc => doc.aiSummary)
      .join('\n\n');


    // Generate AI response using OpenRouter
    let aiContent = '';
    
    // Build context for AI
    let aiPrompt = '';
    
    // Add medical context if available
    if (medicalContext && medicalContext.trim().length > 0) {
      aiPrompt += `PATIENT'S MEDICAL HISTORY:\n${medicalContext}\n\n`;
      console.log('✅ Added medical context to prompt');
    } else {
      console.log('⚠️ No medical context available');
    }
    
    aiPrompt += `Patient message: "${content}"\n\n`;
    
    if (intent === 'medication_add' && extractedData.medications?.length > 0) {
      const med = extractedData.medications[0];
      aiPrompt += `IMPORTANT: I've successfully added ${med.name} ${med.dosage} to their medication schedule in the database. Confirm this action in a friendly, supportive way and let them know they'll get reminders.`;
    } else if (intent === 'appointment_create' && extractedData.appointments?.length > 0) {
      const apt = extractedData.appointments[0];
      aiPrompt += `IMPORTANT: I've successfully scheduled an appointment with ${apt.doctorName} for ${apt.date} at ${apt.time} in the database. Confirm this in a warm, reassuring way.`;
    } else {
      aiPrompt += `Respond to this patient message in a helpful, friendly way. Use their medical history above to provide personalized advice. You're a health assistant that can help with medications, appointments, and health questions.`;
    }
    
    // Call AI
    aiContent = await callOpenRouterAPI(aiPrompt, apiKey);
    

    // Save AI response
    const assistantMessage = new ChatMessage({
      patientId,
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
      intent,
      extractedData: intent !== 'general' ? extractedData : undefined,
      processed: true
    });
    await assistantMessage.save();

    res.json({
      userMessage,
      assistantMessage,
      intent,
      extractedData,
      remaining: (req as any).remaining || 0,
      limit: 25,
      hasOwnKey: !!user?.openrouterApiKey
    });
  } catch (error: any) {
    console.error('=== CHAT ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's an AI model failure
    if (error.message?.includes('All') && error.message?.includes('models failed')) {
      res.status(503).json({ 
        message: 'AI service temporarily unavailable',
        error: 'All AI models are currently unavailable. This might be due to OpenRouter API settings or service issues. Please check https://openrouter.ai/settings/privacy',
        details: error.message
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Database validation error', 
        error: error.message,
        details: 'Check if MongoDB models are properly defined'
      });
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      res.status(500).json({ 
        message: 'Database error', 
        error: error.message,
        details: 'Check MongoDB connection'
      });
    } else {
      res.status(500).json({ 
        message: 'Error processing message', 
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

export default router;
