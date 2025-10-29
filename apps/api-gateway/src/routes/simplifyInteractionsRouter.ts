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
            'X-Title': 'DrugNexusAI Interaction Simplifier'
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

// Simplify drug-drug interactions
router.post('/', trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    const { interactions } = req.body;
    
    if (!interactions || !Array.isArray(interactions) || interactions.length === 0) {
      res.status(400).json({ error: 'No interactions provided' });
      return;
    }


    const apiKey = getApiKey(req);
    
    // Process interactions sequentially to avoid rate limits
    const simplified = [];
    for (const interaction of interactions) {
      const { pair, description } = interaction;
      
      if (!pair || !description) {
        console.warn('Skipping invalid interaction:', interaction);
        simplified.push({ pair: pair || 'Unknown', shortDescription: 'Invalid interaction data' });
        continue;
      }

      try {
        const prompt = `Explain this drug interaction in a short, clear, and understandable way. Keep all important details from the description. Do not add any extra commentary or unrelated information.

Description: "${description}"`;

        const shortDescription = await callOpenRouterAPI(prompt, apiKey);
        simplified.push({ pair, shortDescription });
        
      } catch (error: any) {
        console.error(`Failed to simplify interaction for ${pair}:`, error.message);
        // Use original description if simplification fails
        simplified.push({ 
          pair, 
          shortDescription: description.length > 200 ? description.substring(0, 200) + '...' : description 
        });
      }
    }

    res.json(simplified);

  } catch (error: any) {
    console.error('Error simplifying interactions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to simplify interactions'
    });
  }
});

export default router;
