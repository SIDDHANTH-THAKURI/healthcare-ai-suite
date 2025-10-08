import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationSchedule extends Document {
  patientId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  schedules: Array<{
    time: string;
    taken: boolean;
    takenAt?: Date;
    skipped: boolean;
    skipReason?: string;
  }>;
  date: Date;
  adherenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationScheduleSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    medicationId: { type: String, required: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    schedules: [{
      time: { type: String, required: true },
      taken: { type: Boolean, default: false },
      takenAt: { type: Date },
      skipped: { type: Boolean, default: false },
      skipReason: { type: String }
    }],
    date: { type: Date, required: true, index: true },
    adherenceScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

MedicationScheduleSchema.index({ patientId: 1, date: 1 });

export default mongoose.model<IMedicationSchedule>('MedicationSchedule', MedicationScheduleSchema);
