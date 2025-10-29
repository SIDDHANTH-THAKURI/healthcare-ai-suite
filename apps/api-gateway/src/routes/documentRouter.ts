import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import MedicalDocument from '../models/medicalDocument';
import axios from 'axios';
import { OPENROUTER_API_KEY, OPENROUTER_URL, LLM_MODEL, FRONTEND_URL } from '../config';

// OpenRouter API response interface
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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
              role: 'user',
              content: prompt
            }
          ]
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/medical-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Check file extension
    const allowedExtensions = /\.(jpeg|jpg|png|pdf|doc|docx|txt)$/i;
    const hasValidExtension = allowedExtensions.test(file.originalname.toLowerCase());

    // Check mimetype - be more permissive
    const allowedMimetypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const hasValidMimetype = allowedMimetypes.includes(file.mimetype);

    if (hasValidExtension || hasValidMimetype) {
      return cb(null, true);
    }

    cb(new Error('Invalid file type. Only images (JPG, PNG), PDFs, Word documents, and text files are allowed.'));
  }
});

import { trackUsage, getApiKey } from '../middleware/usageTracking';

// Upload document
router.post('/upload', upload.single('document'), trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { patientId, documentType } = req.body;
    const fileUrl = `/uploads/medical-documents/${req.file.filename}`;

    // For now, we'll simulate text extraction
    // In production, you'd use libraries like pdf-parse, tesseract.js, mammoth, etc.
    let extractedText = '';

    if (req.file.mimetype === 'text/plain') {
      extractedText = fs.readFileSync(req.file.path, 'utf-8');
    } else {
      // Placeholder for other file types
      extractedText = `Document content from ${req.file.originalname}. 
      This would contain extracted text from PDF/image/doc using appropriate libraries.`;
    }

    // Process with AI - summarize medical info without PII
    const aiPrompt = `Summarize the medical information from this text in a single paragraph. Remove all personal identifiable information like names, addresses, phone numbers, ages, and locations. Focus only on medical conditions, medications, allergies, and relevant clinical history.

Text: ${extractedText}

Write a brief, natural paragraph summary (2-3 sentences) of the medical information only.`;

    let medicalSummary = '';
    try {
      const apiKey = getApiKey(req);
      medicalSummary = await callOpenRouterAPI(aiPrompt, apiKey);
    } catch (e) {
      console.error('Error processing with AI:', e);
      medicalSummary = 'Medical information stored.';
    }

    // Save document
    const document = new MedicalDocument({
      patientId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl,
      extractedText,
      documentType: documentType || 'other',
      processedByAI: true,
      aiSummary: medicalSummary,
      metadata: {
        medications: [],
        diagnoses: [],
        doctorName: '',
        date: undefined
      }
    });

    await document.save();

    res.json({
      message: 'Document uploaded and processed successfully',
      document
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading document', error });
  }
});

// Upload text (manual entry)
router.post('/upload-text', trackUsage, async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, text, documentType } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ message: 'No text provided' });
      return;
    }

    if (!patientId) {
      res.status(400).json({ message: 'Patient ID is required' });
      return;
    }

    // Process with AI - summarize medical info without PII
    const aiPrompt = `Summarize the medical information from this text in a single paragraph. Remove all personal identifiable information like names, addresses, phone numbers, ages, and locations. Focus only on medical conditions, medications, allergies, and relevant clinical history.

Text: ${text}

Write a brief, natural paragraph summary (2-3 sentences) of the medical information only.`;

    let medicalSummary = '';
    try {
      const apiKey = getApiKey(req);
      medicalSummary = await callOpenRouterAPI(aiPrompt, apiKey);
    } catch (e) {
      console.error('Error processing with AI:', e);
      medicalSummary = 'Medical information stored.';
    }

    // Save document
    const document = new MedicalDocument({
      patientId,
      fileName: `Manual Entry - ${new Date().toISOString().split('T')[0]}`,
      fileType: 'text/plain',
      fileUrl: '',
      extractedText: text,
      documentType: documentType || 'medical_history',
      processedByAI: true,
      aiSummary: medicalSummary,
      metadata: {
        medications: [],
        diagnoses: [],
        doctorName: '',
        date: undefined
      }
    });

    await document.save();

    res.json({
      message: 'Text processed and saved successfully',
      document
    });
  } catch (error) {
    console.error('Text upload error:', error);
    res.status(500).json({ message: 'Error processing text', error });
  }
});

// Get all documents for a patient
router.get('/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await MedicalDocument.find({ patientId: req.params.patientId })
      .sort({ uploadDate: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
});

// Get document by ID
router.get('/document/:documentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await MedicalDocument.findById(req.params.documentId);
    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error });
  }
});

// Delete document
router.delete('/:documentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await MedicalDocument.findById(req.params.documentId);
    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await MedicalDocument.findByIdAndDelete(req.params.documentId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
});

export default router;
