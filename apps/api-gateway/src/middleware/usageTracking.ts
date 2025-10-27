import { Request, Response, NextFunction } from 'express';
import Account from '../models/Account';
import jwt from 'jsonwebtoken';

const DAILY_FREE_LIMIT = 25;

interface JwtPayload {
  id: string;
}

export const trackUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract user ID from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        error: 'Authentication required',
        exhausted: false 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;

    const user = await Account.findById(userId);
    
    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        exhausted: false 
      });
      return;
    }

    // If user has their own API key, allow unlimited usage
    if (user.openrouterApiKey) {
      // Store user info in request for later use
      (req as any).userId = userId;
      (req as any).userApiKey = user.openrouterApiKey;
      (req as any).isUnlimited = true;
      next();
      return;
    }

    // Check daily limit for free tier users
    const today = new Date().toDateString();
    const isToday = user.lastMessageDate === today;
    const currentCount = isToday ? (user.dailyMessageCount || 0) : 0;

    if (currentCount >= DAILY_FREE_LIMIT) {
      res.status(429).json({
        error: 'Daily limit reached',
        exhausted: true,
        dailyLimit: DAILY_FREE_LIMIT,
        remaining: 0,
        message: `You've reached your daily limit of ${DAILY_FREE_LIMIT} AI requests. Add your own OpenRouter API key to continue.`
      });
      return;
    }

    // Increment usage count
    if (isToday) {
      user.dailyMessageCount = currentCount + 1;
    } else {
      user.dailyMessageCount = 1;
      user.lastMessageDate = today;
    }
    
    await user.save();

    // Store user info in request
    (req as any).userId = userId;
    (req as any).userApiKey = null;
    (req as any).isUnlimited = false;
    (req as any).remaining = DAILY_FREE_LIMIT - user.dailyMessageCount;

    next();
  } catch (error: any) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ 
      error: 'Usage tracking failed',
      exhausted: false 
    });
  }
};

// Middleware to get user's API key (either their own or system default)
export const getApiKey = (req: Request): string => {
  const userApiKey = (req as any).userApiKey;
  return userApiKey || process.env.OPENROUTER_API_KEY || '';
};

// Check if user has unlimited access
export const isUnlimited = (req: Request): boolean => {
  return (req as any).isUnlimited || false;
};

// Get remaining requests
export const getRemaining = (req: Request): number => {
  return (req as any).remaining || 0;
};
