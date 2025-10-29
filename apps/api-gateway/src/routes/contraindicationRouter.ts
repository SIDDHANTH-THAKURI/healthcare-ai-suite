import express, { Request, Response } from 'express';
import { OPENROUTER_URL, FRONTEND_URL } from '../config';
import axios from 'axios';
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
            'HTTP-Referer': FRONTEND_URL,
            'X-Title': 'DrugNexusAI Contraindication Check'
          },
          timeout: 30000
        }
      );

      const aiResponse = (response.data as any).choices?.[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      return aiResponse;

    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;

      if (i === FREE_MODELS.length - 1) {
        throw new Error(`All models failed. Last error: ${errorMsg}`);
      }
    }
  }

  throw new Error('Failed to get AI response');
}

// Check drug-condition contraindications
router.post('/', trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    const { medications, conditions, allergies, patientAge, patientGender } = req.body;

    if (!medications || medications.length === 0) {
      res.json({ contraindications: [] });
      return;
    }


    // Build patient context
    const patientContext = [];
    if (conditions && conditions.length > 0) {
      patientContext.push(`Medical Conditions: ${conditions.join(', ')}`);
    }
    if (allergies && allergies.length > 0) {
      patientContext.push(`Known Allergies: ${allergies.join(', ')}`);
    }
    if (patientAge) {
      patientContext.push(`Age: ${patientAge} years`);
    }
    if (patientGender) {
      patientContext.push(`Gender: ${patientGender}`);
    }

    const medicationList = medications.map((m: any) =>
      `${m.name} (${m.dosage}${m.frequency ? ', ' + m.frequency : ''})`
    ).join('\n');

    const prompt = `You are a clinical pharmacist analyzing medication safety. Check if any of these medications are contraindicated for this patient.

PATIENT PROFILE:
${patientContext.join('\n')}

CURRENT MEDICATIONS:
${medicationList}

Analyze each medication and identify any contraindications based on:
1. Medical conditions (e.g., beta-blockers with asthma, NSAIDs with kidney disease)
2. Known allergies (e.g., penicillin allergy)
3. Age-related concerns (e.g., certain drugs unsafe for elderly or children)
4. Gender-specific concerns (e.g., pregnancy category drugs)

Return ONLY valid JSON in this exact format:
{
  "contraindications": [
    {
      "medication": "drug name",
      "severity": "critical|major|moderate|minor",
      "message": "Brief explanation of the contraindication",
      "recommendation": "What action should be taken"
    }
  ]
}

RULES:
- Only include actual contraindications, not general precautions
- Be specific about which condition/allergy causes the contraindication
- Severity levels:
  * critical: Absolute contraindication, immediate action needed
  * major: Strong contraindication, alternative should be considered
  * moderate: Relative contraindication, requires monitoring
  * minor: Caution advised but generally acceptable
- If no contraindications found, return empty array
- Return ONLY the JSON, no other text`;

    let contraindications: any[] = [];

    try {
      const apiKey = getApiKey(req);
      const aiResponse = await callOpenRouterAPI(prompt, apiKey);

      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        contraindications = parsed.contraindications || [];
      }
    } catch (error: any) {
      console.error('AI processing failed:', error.message);
      // Return empty contraindications on error
    }

    res.json({
      success: true,
      contraindications,
      checkedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error checking contraindications:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check contraindications',
      contraindications: []
    });
  }
});

export default router;
