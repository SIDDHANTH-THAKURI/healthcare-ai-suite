import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalDocument extends Document {
  patientId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  extractedText: string;
  documentType: string; // 'prescription', 'lab_report', 'medical_history', 'other'
  uploadDate: Date;
  processedByAI: boolean;
  aiSummary?: string;
  metadata: {
    medications?: string[];
    diagnoses?: string[];
    doctorName?: string;
    date?: Date;
  };
}

const MedicalDocumentSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    extractedText: { type: String },
    documentType: { 
      type: String, 
      enum: ['prescription', 'lab_report', 'medical_history', 'imaging', 'other'],
      default: 'other'
    },
    uploadDate: { type: Date, default: Date.now },
    processedByAI: { type: Boolean, default: false },
    aiSummary: { type: String },
    metadata: {
      medications: [{ type: String }],
      diagnoses: [{ type: String }],
      doctorName: { type: String },
      date: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IMedicalDocument>('MedicalDocument', MedicalDocumentSchema);
