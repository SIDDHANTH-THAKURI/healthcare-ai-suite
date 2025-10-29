import express, { Request, Response } from 'express';
import ChatMessage from '../models/chatMessage';
import MedicationSchedule from '../models/medicationSchedule';
import Appointment from '../models/appointment';
import MedicalDocument from '../models/medicalDocument';
import Account from '../models/Account';
import axios from 'axios';
import { OPENROUTER_URL, ML_SERVICE_URL, FRONTEND_URL } from '../config';
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
async function callOpenRouterAPI(prompt: string, apiKey: string, conversationHistory: Array<{ role: string, content: string }>): Promise<string> {
  const systemPrompt = `You are MedChat, a caring medical assistant. Answer in 2-3 sentences MAX.

FORBIDDEN:
- NO "Hello!" or "Hi!" in responses (conversation already started)
- NO "I'm here to help" or "Based on the information provided"
- NO long paragraphs or essays
- NO repeating patient history back to them

REQUIRED:
- Be warm, caring, and supportive in tone
- Answer the question immediately and directly
- For drug interactions: check if the drugs interact WITH EACH OTHER first, then with patient's current meds
- State risk clearly + explain briefly + "please consult your doctor"
- Use patient data silently to inform answer

Good: "I'd be cautious about combining isotretinoin and doxycycline - both can increase sun sensitivity significantly, and isotretinoin may worsen asthma symptoms given your history. Please discuss this with your doctor to explore safer alternatives."
Bad: "Hello! I'm here to help with your medication questions. Based on the information provided..." [TOO LONG, GREETING]`;

  // Try each model in order
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];

    try {

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: prompt }
      ];

      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_URL,
        {
          model: model,
          messages: messages
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': FRONTEND_URL,
            'X-Title': 'DrugNexusAI Patient Portal'
          },
          timeout: 30000
        }
      );

      let aiResponse = response.data.choices?.[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Post-process: Remove unwanted greetings and introductions
      aiResponse = aiResponse
        .replace(/^(Hello!?|Hi!?|Hey!?)\s*/i, '')
        .replace(/^I'm here to help.*?\.\s*/i, '')
        .replace(/^Based on (the information provided|your (medical )?history).*?,\s*/i, '')
        .trim();

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


    // Fetch recent conversation history (last 10 messages)
    const recentMessages = await ChatMessage.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Build conversation history for context (reverse to chronological order)
    const conversationHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

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
      const analysisResponse = await callOpenRouterAPI(analysisPrompt, apiKey, []);

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

    // Fetch comprehensive patient data from prescriptions collection
    const prescriptionData = await MedicationSchedule.findOne({ patientId }).sort({ date: -1 });

    // Fetch patient's medical document summaries
    const medicalDocs = await MedicalDocument.find({ patientId }).sort({ uploadDate: -1 });

    // Fetch patient account for age/gender
    const patientAccount = await Account.findById(patientId);

    // Build comprehensive medical context
    let medicalContext = '';

    // Add document summaries
    const docSummaries = medicalDocs
      .filter(doc => doc.aiSummary && doc.aiSummary !== 'Medical information stored.')
      .map(doc => doc.aiSummary)
      .join('\n');

    if (docSummaries) {
      medicalContext += `MEDICAL HISTORY FROM DOCUMENTS:\n${docSummaries}\n\n`;
    }

    // Try to get structured patient data from MongoDB (consultation notes)
    let structuredData: any = null;
    try {
      const response = await axios.get<{ notes: any[] }>(`${ML_SERVICE_URL}/api/patient-history?patientId=${patientId}`);
      if (response.data?.notes && response.data.notes.length > 0) {
        const latestNote = response.data.notes[0];
        structuredData = latestNote.structured;

        if (structuredData) {
          medicalContext += `CURRENT MEDICAL PROFILE:\n`;

          // Current conditions
          if (structuredData.conditions?.current?.length > 0) {
            medicalContext += `- Current Conditions: ${structuredData.conditions.current.join(', ')}\n`;
          }

          // Past conditions
          if (structuredData.conditions?.past?.length > 0) {
            medicalContext += `- Past Conditions: ${structuredData.conditions.past.join(', ')}\n`;
          }

          // Allergies
          if (structuredData.allergies?.length > 0) {
            medicalContext += `- Known Allergies: ${structuredData.allergies.join(', ')}\n`;
          }

          // Current medications
          if (structuredData.medications?.length > 0) {
            const activeMeds = structuredData.medications.filter((m: any) => m.status !== 'discontinued');
            if (activeMeds.length > 0) {
              medicalContext += `- Current Medications:\n`;
              activeMeds.forEach((med: any) => {
                medicalContext += `  * ${med.name} ${med.dosage || ''} - ${med.frequency || ''}\n`;
              });
            }
          }

          medicalContext += '\n';
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch structured patient data from ML service');
    }

    // Add patient demographics if available
    if (patientAccount?.patientProfile) {
      medicalContext += `PATIENT INFO:\n`;
      if (patientAccount.patientProfile.age) medicalContext += `- Age: ${patientAccount.patientProfile.age} years\n`;
      if (patientAccount.patientProfile.gender) medicalContext += `- Gender: ${patientAccount.patientProfile.gender}\n`;
      medicalContext += '\n';
    }

    // Build simple, focused prompt
    let aiPrompt = '';

    // Check if asking about drug interactions or taking medications together
    const isDrugInteractionQuery = /can i (take|have|use)|safe to (take|combine)|together|interaction|combine/i.test(content);
    const isMedicalQuery = /medication|drug|medicine|pill|dose|interaction|condition|symptom|illness|disease|allergy|treatment|prescription/i.test(content);

    if (isDrugInteractionQuery && medicalContext && medicalContext.trim().length > 0) {
      aiPrompt = `PATIENT MEDICAL CONTEXT:\n${medicalContext}\n\nQUESTION: ${content}\n\nINSTRUCTIONS:
1. Identify ALL drugs mentioned in the question
2. Check if those drugs interact with EACH OTHER (drug-drug interaction)
3. Check if those drugs interact with patient's CURRENT medications
4. Check if safe given patient's conditions and allergies
5. Answer in 2-3 sentences: state interaction risk clearly, explain why briefly, recommend consulting doctor
6. Be warm, caring, and supportive in tone`;
    } else if (isMedicalQuery && medicalContext && medicalContext.trim().length > 0) {
      aiPrompt = `PATIENT MEDICAL CONTEXT:\n${medicalContext}\n\nQUESTION: ${content}\n\nAnswer warmly and briefly (2-3 sentences).`;
    } else if (intent === 'medication_add' && extractedData.medications?.length > 0) {
      const med = extractedData.medications[0];
      aiPrompt = `Confirm you added ${med.name} ${med.dosage} to their schedule. Be warm and brief (1-2 sentences).`;
    } else if (intent === 'appointment_create' && extractedData.appointments?.length > 0) {
      const apt = extractedData.appointments[0];
      aiPrompt = `Confirm appointment with ${apt.doctorName} on ${apt.date} at ${apt.time}. Be warm and brief (1-2 sentences).`;
    } else {
      aiPrompt = `QUESTION: ${content}\n\nAnswer warmly and briefly.`;
    }

    // Call AI with conversation history
    const aiContent = await callOpenRouterAPI(aiPrompt, apiKey, conversationHistory);


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
