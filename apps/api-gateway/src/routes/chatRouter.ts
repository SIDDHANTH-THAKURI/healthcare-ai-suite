import express, { Request, Response } from 'express';
import ChatMessage from '../models/chatMessage';
import MedicationSchedule from '../models/medicationSchedule';
import Appointment from '../models/appointment';
import axios from 'axios';
import { OPENROUTER_API_KEY, OPENROUTER_URL, LLM_MODEL } from '../config';

const router = express.Router();

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

    // Save user message
    const userMessage = new ChatMessage({
      patientId,
      role: 'user',
      content,
      timestamp: new Date()
    });
    await userMessage.save();

    // Analyze intent and extract data using LLM
    const analysisPrompt = `Analyze this patient message and extract structured information:
Message: "${content}"

Determine the intent and extract relevant data in JSON format:
{
  "intent": "medication_add" | "appointment_create" | "query" | "general",
  "medications": [{"name": "", "dosage": "", "frequency": "", "duration": ""}],
  "appointments": [{"doctorName": "", "date": "YYYY-MM-DD", "time": "HH:MM", "type": ""}]
}

Only include medications or appointments if explicitly mentioned. Return valid JSON only.`;

    const analysisResponse = await axios.post(
      OPENROUTER_URL,
      {
        model: LLM_MODEL,
        messages: [{ role: 'user', content: analysisPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let extractedData: any = {};
    let intent = 'general';

    try {
      const analysisText = analysisResponse.data.choices?.[0]?.message?.content?.trim() || '{}';
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        intent = parsed.intent || 'general';
        extractedData = parsed;
      }
    } catch (e) {
      console.error('Error parsing LLM response:', e);
    }

    // Process extracted data
    if (intent === 'medication_add' && extractedData.medications?.length > 0) {
      for (const med of extractedData.medications) {
        if (med.name) {
          // Create medication schedule
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

    // Generate AI response
    const responsePrompt = `You are a helpful health assistant. The patient said: "${content}"

${intent === 'medication_add' ? 'Confirm that you\'ve added the medications to their schedule.' : ''}
${intent === 'appointment_create' ? 'Confirm that you\'ve scheduled the appointment.' : ''}

Respond in a friendly, supportive way. Keep it concise (2-3 sentences).`;

    const aiResponse = await axios.post(
      OPENROUTER_URL,
      {
        model: LLM_MODEL,
        messages: [{ role: 'user', content: responsePrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiContent = aiResponse.data.choices?.[0]?.message?.content?.trim() || 
      'I understand. How else can I help you today?';

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
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing message', error });
  }
});

export default router;
