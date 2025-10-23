import express, { Request, Response } from 'express';
import Account from '../models/Account';

const router = express.Router();

// Get user's API key status
router.get('/status/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await Account.findById(req.params.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const today = new Date().toDateString();
    const isToday = user.lastMessageDate === today;
    const dailyCount = isToday ? (user.dailyMessageCount || 0) : 0;

    res.json({
      hasApiKey: !!user.openrouterApiKey,
      dailyMessageCount: dailyCount,
      dailyLimit: 20,
      remaining: Math.max(0, 20 - dailyCount),
      isUnlimited: !!user.openrouterApiKey
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching API key status', error });
  }
});

// Save user's API key
router.post('/save', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, apiKey } = req.body;

    if (!userId || !apiKey) {
      res.status(400).json({ message: 'Missing userId or apiKey' });
      return;
    }

    // Validate API key format (OpenRouter keys start with sk-or-v1-)
    if (!apiKey.startsWith('sk-or-v1-')) {
      res.status(400).json({ 
        message: 'Invalid API key format',
        error: 'OpenRouter API keys should start with sk-or-v1-'
      });
      return;
    }

    const user = await Account.findById(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.openrouterApiKey = apiKey;
    await user.save();

    res.json({
      message: 'API key saved successfully',
      hasApiKey: true,
      isUnlimited: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving API key', error });
  }
});

// Remove user's API key
router.delete('/remove/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await Account.findById(req.params.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.openrouterApiKey = null;
    await user.save();

    res.json({
      message: 'API key removed successfully',
      hasApiKey: false,
      isUnlimited: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing API key', error });
  }
});

export default router;
