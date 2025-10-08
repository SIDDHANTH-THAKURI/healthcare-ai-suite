import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthMetrics extends Document {
  patientId: string;
  date: Date;
  steps: number;
  sleepHours: number;
  waterIntake: number;
  mood: string;
  symptoms: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthMetricsSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    steps: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 },
    mood: { type: String },
    symptoms: [{ type: String }],
    notes: { type: String }
  },
  { timestamps: true }
);

HealthMetricsSchema.index({ patientId: 1, date: 1 }, { unique: true });

export default mongoose.model<IHealthMetrics>('HealthMetrics', HealthMetricsSchema);
