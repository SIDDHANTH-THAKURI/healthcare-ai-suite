import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  patientId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string; // 'medication_add', 'appointment_create', 'query', 'document_upload'
  extractedData?: {
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    appointments?: Array<{
      doctorName: string;
      date: Date;
      time: string;
      type: string;
    }>;
  };
  processed: boolean;
}

const ChatMessageSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    intent: { type: String },
    extractedData: {
      medications: [{
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String }
      }],
      appointments: [{
        doctorName: { type: String },
        date: { type: Date },
        time: { type: String },
        type: { type: String }
      }]
    },
    processed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ChatMessageSchema.index({ patientId: 1, timestamp: -1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
