import express, { Request, Response } from 'express';
import { OPENROUTER_URL } from '../config';
import axios from 'axios';
import PatientHistory from '../models/patientHistory';
import { trackUsage, getApiKey } from '../middleware/usageTracking';

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
async function callOpenRouterAPI(prompt: string, apiKey: string): Promise<string> {
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    
    try {
      console.log(`[${i + 1}/${FREE_MODELS.length}] Trying model: ${model}`);
      
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: model,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'DrugNexusAI Patient History'
          },
          timeout: 30000
        }
      );

      const aiResponse = (response.data as any).choices?.[0]?.message?.content?.trim();
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }
      
      console.log(`✅ SUCCESS with model: ${model}`);
      return aiResponse;
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`❌ Model ${model} failed: ${errorMsg}`);
      
      if (i === FREE_MODELS.length - 1) {
        throw new Error(`All models failed. Last error: ${errorMsg}`);
      }
    }
  }
  
  throw new Error('Failed to get AI response');
}

// Process patient history notes
router.post('/', trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, notes } = req.body;

    if (!patientId || !notes) {
      res.status(400).json({ success: false, detail: 'Missing patientId or notes' });
      return;
    }

    console.log('Processing consultation notes for patient:', patientId);

    // Fetch previous notes to provide context
    const previousNotes = await PatientHistory.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Build context from previous notes
    let contextInfo = '';
    if (previousNotes.length > 0) {
      const latestNote = previousNotes[0];
      const prevCurrent = latestNote.structured?.conditions?.current || [];
      const prevPast = latestNote.structured?.conditions?.past || [];
      const prevMeds = latestNote.structured?.medications || [];
      const prevAllergies = latestNote.structured?.allergies || [];

      contextInfo = `

PATIENT HISTORY CONTEXT:
Previous Current Conditions: ${prevCurrent.length > 0 ? prevCurrent.join(', ') : 'None'}
Previous Past Conditions: ${prevPast.length > 0 ? prevPast.join(', ') : 'None'}
Previous Medications: ${prevMeds.map(m => m.name).join(', ') || 'None'}
Known Allergies: ${prevAllergies.join(', ') || 'None'}`;
    }

    // Use AI to extract structured information with context
    const prompt = `You are analyzing a new consultation note for a patient. Use the patient's history to determine which conditions are NEW, ONGOING, or RESOLVED.

${contextInfo}

NEW CONSULTATION NOTE: "${notes}"

Return this exact JSON structure:
{
  "medications": [{"name": "drug name", "dosage": "amount", "frequency": "schedule"}],
  "conditions": {
    "current": ["condition 1", "condition 2"],
    "past": ["resolved condition 1"]
  },
  "allergies": ["allergy 1", "allergy 2"],
  "summary": "brief clinical summary"
}

CRITICAL RULES:
1. If a condition from "Previous Current Conditions" is mentioned as resolved/cured/no longer present, move it to "past"
2. If a condition from "Previous Current Conditions" is still mentioned or implied as ongoing, keep it in "current"
3. If a NEW condition is mentioned, add it to "current"
4. If the note says "no longer has X" or "X resolved", move X from current to past
5. Preserve all previous past conditions and add newly resolved ones
6. Include ALL medications mentioned (new or continuing)
7. Preserve and add to known allergies
8. Return ONLY the JSON, no other text`;

    let structured: any = {
      medications: [],
      conditions: { current: [], past: [] },
      allergies: [],
      summary: notes.substring(0, 200)
    };

    try {
      const apiKey = getApiKey(req);
      const aiResponse = await callOpenRouterAPI(prompt, apiKey);
      console.log('AI response:', aiResponse);
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Get AI's interpretation
        let aiCurrent = parsed.conditions?.current || [];
        let aiPast = parsed.conditions?.past || [];
        
        // Merge with previous history intelligently
        if (previousNotes.length > 0) {
          const latestNote = previousNotes[0];
          const prevCurrent = latestNote.structured?.conditions?.current || [];
          const prevPast = latestNote.structured?.conditions?.past || [];
          
          // Start with AI's past conditions and add all previous past conditions
          const allPast = new Set([...aiPast, ...prevPast]);
          
          // For current conditions: use AI's judgment but ensure we don't lose ongoing conditions
          // If a previous current condition is not mentioned at all in the new note, keep it as current
          const mentionedInNote = notes.toLowerCase();
          prevCurrent.forEach((condition: string) => {
            const conditionLower = condition.toLowerCase();
            // If condition is not in AI's current or past, and not explicitly mentioned as resolved
            if (!aiCurrent.some((c: string) => c.toLowerCase() === conditionLower) && 
                !aiPast.some((c: string) => c.toLowerCase() === conditionLower)) {
              // Check if it's mentioned as resolved in the note
              const resolvedKeywords = ['no longer', 'resolved', 'cured', 'recovered from', 'healed'];
              const isResolved = resolvedKeywords.some(keyword => 
                mentionedInNote.includes(keyword) && mentionedInNote.includes(conditionLower)
              );
              
              if (isResolved) {
                allPast.add(condition);
              } else if (!mentionedInNote.includes(conditionLower)) {
                // Not mentioned at all - keep as current (ongoing)
                aiCurrent.push(condition);
              }
            }
          });
          
          // Remove duplicates from current that are in past
          aiCurrent = aiCurrent.filter((c: string) => 
            !Array.from(allPast).some((p: string) => p.toLowerCase() === c.toLowerCase())
          );
          
          aiPast = Array.from(allPast);
        }
        
        structured = {
          medications: parsed.medications || [],
          conditions: {
            current: aiCurrent,
            past: aiPast
          },
          allergies: parsed.allergies || [],
          summary: parsed.summary || notes.substring(0, 200)
        };
        console.log('Extracted structured data:', structured);
      }
    } catch (error: any) {
      console.error('AI processing failed:', error.message);
      // Continue with empty structured data
    }

    // Save note to database
    const savedNote = await PatientHistory.create({
      patientId,
      rawText: notes,
      summary: structured.summary,
      structured: {
        conditions: structured.conditions,
        medications: structured.medications,
        allergies: structured.allergies
      },
      createdBy: 'doctor' // Could be extracted from token
    });

    // Return note with id as string for frontend compatibility
    const note = {
      id: (savedNote._id as any).toString(),
      patientId: savedNote.patientId,
      rawText: savedNote.rawText,
      summary: savedNote.summary,
      createdAt: savedNote.createdAt.toISOString(),
      structured: savedNote.structured,
      createdBy: savedNote.createdBy
    };

    res.json({
      success: true,
      note,
      message: 'Consultation note saved successfully'
    });

  } catch (error: any) {
    console.error('Error processing patient history:', error);
    res.status(500).json({
      success: false,
      detail: error.message || 'Failed to process consultation notes'
    });
  }
});

// Get patient history notes
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      res.status(400).json({ success: false, detail: 'Missing patientId' });
      return;
    }

    console.log('Fetching consultation notes for patient:', patientId);

    const notes = await PatientHistory.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    // Convert _id to id for frontend compatibility
    const formattedNotes = notes.map(note => ({
      id: note._id.toString(),
      patientId: note.patientId,
      rawText: note.rawText,
      summary: note.summary,
      createdAt: note.createdAt.toISOString(),
      structured: note.structured,
      createdBy: note.createdBy
    }));

    res.json({
      success: true,
      notes: formattedNotes
    });

  } catch (error: any) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({
      success: false,
      detail: error.message || 'Failed to fetch consultation notes'
    });
  }
});

// Update a consultation note
router.put('/:noteId', trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { rawText } = req.body;

    if (!rawText) {
      res.status(400).json({ success: false, detail: 'Missing rawText' });
      return;
    }

    console.log('Updating consultation note:', noteId);

    // Get the note being edited to find patientId
    const existingNote = await PatientHistory.findById(noteId);
    if (!existingNote) {
      res.status(404).json({ success: false, detail: 'Note not found' });
      return;
    }

    // Fetch previous notes (excluding the one being edited) to provide context
    const previousNotes = await PatientHistory.find({ 
      patientId: existingNote.patientId,
      _id: { $ne: noteId }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Build context from previous notes
    let contextInfo = '';
    if (previousNotes.length > 0) {
      const latestNote = previousNotes[0];
      const prevCurrent = latestNote.structured?.conditions?.current || [];
      const prevPast = latestNote.structured?.conditions?.past || [];
      const prevMeds = latestNote.structured?.medications || [];
      const prevAllergies = latestNote.structured?.allergies || [];

      contextInfo = `

PATIENT HISTORY CONTEXT:
Previous Current Conditions: ${prevCurrent.length > 0 ? prevCurrent.join(', ') : 'None'}
Previous Past Conditions: ${prevPast.length > 0 ? prevPast.join(', ') : 'None'}
Previous Medications: ${prevMeds.map(m => m.name).join(', ') || 'None'}
Known Allergies: ${prevAllergies.join(', ') || 'None'}`;
    }

    // Re-process with AI using context
    const prompt = `You are analyzing a consultation note for a patient. Use the patient's history to determine which conditions are NEW, ONGOING, or RESOLVED.

${contextInfo}

CONSULTATION NOTE: "${rawText}"

Return this exact JSON structure:
{
  "medications": [{"name": "drug name", "dosage": "amount", "frequency": "schedule"}],
  "conditions": {
    "current": ["condition 1", "condition 2"],
    "past": ["resolved condition 1"]
  },
  "allergies": ["allergy 1", "allergy 2"],
  "summary": "brief clinical summary"
}

CRITICAL RULES:
1. If a condition from "Previous Current Conditions" is mentioned as resolved/cured/no longer present, move it to "past"
2. If a condition from "Previous Current Conditions" is still mentioned or implied as ongoing, keep it in "current"
3. If a NEW condition is mentioned, add it to "current"
4. If the note says "no longer has X" or "X resolved", move X from current to past
5. Preserve all previous past conditions and add newly resolved ones
6. Include ALL medications mentioned (new or continuing)
7. Preserve and add to known allergies
8. Return ONLY the JSON, no other text`;

    let structured: any = {
      medications: [],
      conditions: { current: [], past: [] },
      allergies: [],
      summary: rawText.substring(0, 200)
    };

    try {
      const apiKey = getApiKey(req);
      const aiResponse = await callOpenRouterAPI(prompt, apiKey);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Get AI's interpretation
        let aiCurrent = parsed.conditions?.current || [];
        let aiPast = parsed.conditions?.past || [];
        
        // Merge with previous history intelligently
        if (previousNotes.length > 0) {
          const latestNote = previousNotes[0];
          const prevCurrent = latestNote.structured?.conditions?.current || [];
          const prevPast = latestNote.structured?.conditions?.past || [];
          
          const allPast = new Set([...aiPast, ...prevPast]);
          
          const mentionedInNote = rawText.toLowerCase();
          prevCurrent.forEach((condition: string) => {
            const conditionLower = condition.toLowerCase();
            if (!aiCurrent.some((c: string) => c.toLowerCase() === conditionLower) && 
                !aiPast.some((c: string) => c.toLowerCase() === conditionLower)) {
              const resolvedKeywords = ['no longer', 'resolved', 'cured', 'recovered from', 'healed'];
              const isResolved = resolvedKeywords.some(keyword => 
                mentionedInNote.includes(keyword) && mentionedInNote.includes(conditionLower)
              );
              
              if (isResolved) {
                allPast.add(condition);
              } else if (!mentionedInNote.includes(conditionLower)) {
                aiCurrent.push(condition);
              }
            }
          });
          
          aiCurrent = aiCurrent.filter((c: string) => 
            !Array.from(allPast).some((p: string) => p.toLowerCase() === c.toLowerCase())
          );
          
          aiPast = Array.from(allPast);
        }
        
        structured = {
          medications: parsed.medications || [],
          conditions: {
            current: aiCurrent,
            past: aiPast
          },
          allergies: parsed.allergies || [],
          summary: parsed.summary || rawText.substring(0, 200)
        };
      }
    } catch (error: any) {
      console.error('AI processing failed:', error.message);
    }

    const updatedNote = await PatientHistory.findByIdAndUpdate(
      noteId,
      {
        rawText,
        summary: structured.summary,
        structured
      },
      { new: true }
    );

    if (!updatedNote) {
      res.status(404).json({ success: false, detail: 'Note not found' });
      return;
    }

    const note = {
      id: (updatedNote._id as any).toString(),
      patientId: updatedNote.patientId,
      rawText: updatedNote.rawText,
      summary: updatedNote.summary,
      createdAt: updatedNote.createdAt.toISOString(),
      structured: updatedNote.structured,
      createdBy: updatedNote.createdBy
    };

    res.json({
      success: true,
      note,
      message: 'Note updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      detail: error.message || 'Failed to update note'
    });
  }
});

// Delete a consultation note
router.delete('/:noteId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    console.log('Deleting consultation note:', noteId);

    const deletedNote = await PatientHistory.findByIdAndDelete(noteId);

    if (!deletedNote) {
      res.status(404).json({ success: false, detail: 'Note not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      detail: error.message || 'Failed to delete note'
    });
  }
});

export default router;
