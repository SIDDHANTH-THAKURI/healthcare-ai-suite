import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientHistory extends Document {
  patientId: string;
  rawText: string;
  summary: string;
  structured: {
    conditions: {
      current: string[];
      past: string[];
    };
    medications: Array<{
      name: string;
      dosage: string;
      frequency?: string;
      duration?: string;
    }>;
    allergies: string[];
  };
  createdAt: Date;
  createdBy: string;
}

const PatientHistorySchema: Schema = new Schema({
  patientId: { type: String, required: true, index: true },
  rawText: { type: String, required: true },
  summary: { type: String, required: true },
  structured: {
    conditions: {
      current: [{ type: String }],
      past: [{ type: String }]
    },
    medications: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String }
    }],
    allergies: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'doctor' }
});

export default mongoose.model<IPatientHistory>('PatientHistory', PatientHistorySchema);
