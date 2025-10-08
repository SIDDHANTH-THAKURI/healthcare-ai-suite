import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import MedicalDocument from '../models/medicalDocument';
import axios from 'axios';
import { OPENROUTER_API_KEY, OPENROUTER_URL, LLM_MODEL } from '../config';

const router = express.Router();

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
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
});

// Upload document
router.post('/upload', upload.single('document'), async (req: Request, res: Response): Promise<void> => {
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

    // Process with AI
    const aiPrompt = `Analyze this medical document and extract key information:

${extractedText}

Extract and structure:
1. Document type (prescription/lab_report/medical_history/imaging/other)
2. Medications mentioned (name, dosage, frequency)
3. Diagnoses or conditions
4. Doctor name if mentioned
5. Date if mentioned
6. Brief summary (2-3 sentences)

Return as JSON:
{
  "documentType": "",
  "medications": [""],
  "diagnoses": [""],
  "doctorName": "",
  "date": "YYYY-MM-DD",
  "summary": ""
}`;

    const aiResponse = await axios.post(
      OPENROUTER_URL,
      {
        model: LLM_MODEL,
        messages: [{ role: 'user', content: aiPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let aiData: any = {};
    try {
      const aiText = aiResponse.data.choices?.[0]?.message?.content?.trim() || '{}';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }

    // Save document
    const document = new MedicalDocument({
      patientId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl,
      extractedText,
      documentType: aiData.documentType || documentType || 'other',
      processedByAI: true,
      aiSummary: aiData.summary,
      metadata: {
        medications: aiData.medications || [],
        diagnoses: aiData.diagnoses || [],
        doctorName: aiData.doctorName,
        date: aiData.date ? new Date(aiData.date) : undefined
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
