import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { authMiddleware } from './profileRouter';

const router = express.Router();

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  action: string;
  details: any;
  userAgent?: string;
  url?: string;
  userId?: string;
}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
const ensureLogsDir = async () => {
  try {
    await fs.access(logsDir);
  } catch {
    await fs.mkdir(logsDir, { recursive: true });
  }
};

// Get log file path for today
const getLogFilePath = (type: 'frontend' | 'backend' = 'frontend') => {
  const today = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `${type}-${today}.log`);
};

// Format log entry for file
const formatLogEntry = (entry: LogEntry): string => {
  return `[${entry.timestamp}] [${entry.level}] [${entry.userId}] ${entry.action}: ${JSON.stringify(entry.details)}\n`;
};

// Backend logging function
export const logToFile = async (level: LogEntry['level'], action: string, details: any, userId?: string) => {
  try {
    await ensureLogsDir();
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
      userId: userId || 'system'
    };
    
    const logLine = formatLogEntry(entry);
    const logFile = getLogFilePath('backend');
    
    await fs.appendFile(logFile, logLine);
    
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

// ───── RECEIVE FRONTEND LOGS ─────────────────────────────────────────
router.post('/logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const logEntry: LogEntry = req.body;
    const accountId = (req as any).accountId;
    
    // Add backend timestamp and user info
    logEntry.userId = accountId;
    
    await ensureLogsDir();
    const logLine = formatLogEntry(logEntry);
    const logFile = getLogFilePath('frontend');
    
    await fs.appendFile(logFile, logLine);
    
    // Log important errors to backend log as well
    if (logEntry.level === 'ERROR') {
      await logToFile('ERROR', `FRONTEND_ERROR: ${logEntry.action}`, logEntry.details, accountId);
    }
    
    res.status(200).json({ message: 'Log received' });
  } catch (error) {
    console.error('Failed to process log:', error);
    res.status(500).json({ error: 'Failed to process log' });
  }
});

// ───── GET LOGS FOR DEBUGGING ─────────────────────────────────────────
router.get('/logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type = 'frontend', date, lines = '100' } = req.query;
    const logFile = date 
      ? path.join(logsDir, `${type}-${date}.log`)
      : getLogFilePath(type as 'frontend' | 'backend');
    
    try {
      const logContent = await fs.readFile(logFile, 'utf-8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      
      // Return last N lines
      const maxLines = parseInt(lines as string);
      const recentLines = logLines.slice(-maxLines);
      
      res.json({
        logs: recentLines,
        totalLines: logLines.length,
        file: path.basename(logFile)
      });
    } catch (fileError) {
      res.status(404).json({ error: 'Log file not found', file: path.basename(logFile) });
    }
  } catch (error) {
    console.error('Failed to read logs:', error);
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// ───── GET AVAILABLE LOG FILES ─────────────────────────────────────────
router.get('/logs/files', authMiddleware, async (req: Request, res: Response) => {
  try {
    await ensureLogsDir();
    const files = await fs.readdir(logsDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    const fileInfo = await Promise.all(
      logFiles.map(async (file) => {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          type: file.includes('frontend') ? 'frontend' : 'backend'
        };
      })
    );
    
    res.json({ files: fileInfo });
  } catch (error) {
    console.error('Failed to list log files:', error);
    res.status(500).json({ error: 'Failed to list log files' });
  }
});

// ───── DOWNLOAD LOG FILE ─────────────────────────────────────────
router.get('/logs/download/:filename', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const logFile = path.join(logsDir, filename);
    
    // Security check - ensure filename is safe
    if (!filename.endsWith('.log') || filename.includes('..')) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }
    
    await fs.access(logFile);
    res.download(logFile);
  } catch (error) {
    res.status(404).json({ error: 'Log file not found' });
  }
});

export default router;