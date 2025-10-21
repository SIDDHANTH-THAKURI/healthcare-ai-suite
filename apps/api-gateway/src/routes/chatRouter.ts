import express, { Request, Response } from 'express';
import ChatMessage from '../models/chatMessage';
import MedicationSchedule from '../models/medicationSchedule';
import Appointment from '../models/appointment';
import MedicalDocument from '../models/medicalDocument';
import axios from 'axios';
import { OPENROUTER_API_KEY, OPENROUTER_URL, LLM_MODEL } from '../config';

const router = express.Router();

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
async function callOpenRouterAPI(prompt: string): Promise<string> {
  const systemPrompt = 'You are a helpful, friendly health assistant for a patient portal. Keep responses concise (2-3 sentences), warm, and supportive. Help with medications, appointments, and health questions.';
  
  // Try each model in order
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    
    try {
      console.log(`[${i + 1}/${FREE_MODELS.length}] Trying model: ${model}`);
      
      const response = await axios.post(
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
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
      
      console.log(`✅ SUCCESS with model: ${model}`);
      console.log('AI response:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`❌ Model ${model} failed: ${errorMsg}`);
      
      // If this is the last model, throw the error
      if (i === FREE_MODELS.length - 1) {
        console.error('🚨 ALL MODELS FAILED! No AI models are available.');
        throw new Error(`All ${FREE_MODELS.length} models failed. Last error: ${errorMsg}`);
      }
      
      // Otherwise, continue to next model
      console.log(`⏭️  Trying next model...`);
    }
  }
  
  throw new Error('Failed to get AI response from any model');
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
router.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, content } = req.body;

    console.log('=== CHAT REQUEST START ===');
    console.log('Received chat message:', { patientId, content });
    
    // Validate input
    if (!patientId || !content) {
      console.error('❌ Missing required fields:', { patientId: !!patientId, content: !!content });
      res.status(400).json({ message: 'Missing patientId or content' });
      return;
    }

    // Save user message
    console.log('💾 Saving user message to database...');
    const userMessage = new ChatMessage({
      patientId,
      role: 'user',
      content,
      timestamp: new Date()
    });
    await userMessage.save();
    console.log('✅ User message saved:', userMessage._id);

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
      const analysisResponse = await callOpenRouterAPI(analysisPrompt);
      console.log('AI analysis response:', analysisResponse);
      
      // Extract JSON from response
      const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        intent = parsed.intent || 'general';
        extractedData = parsed;
        console.log('Parsed intent:', intent, 'Data:', extractedData);
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
          console.log('Medication added:', med.name);
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
          console.log('Appointment created:', apt.doctorName, apt.date);
        }
      }
    }

    // Fetch patient's medical document summaries
    const medicalDocs = await MedicalDocument.find({ patientId }).sort({ uploadDate: -1 });
    const medicalContext = medicalDocs
      .filter(doc => doc.aiSummary)
      .map(doc => doc.aiSummary)
      .join('\n\n');

    // Generate AI response using OpenRouter
    let aiContent = '';
    
    // Build context for AI
    let aiPrompt = '';
    
    // Add medical context if available
    if (medicalContext) {
      aiPrompt += `PATIENT'S MEDICAL HISTORY:\n${medicalContext}\n\n`;
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
    aiContent = await callOpenRouterAPI(aiPrompt);
    
    console.log('AI response generated:', aiContent);

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
      extractedData
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
