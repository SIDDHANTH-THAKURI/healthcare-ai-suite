import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  dateTime: Date;
  type: string;
  status: string;
  notes: string;
  prescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String },
    dateTime: { type: Date, required: true, index: true },
    type: { type: String, enum: ['checkup', 'followup', 'emergency', 'consultation'], default: 'checkup' },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
    notes: { type: String },
    prescription: { type: String }
  },
  { timestamps: true }
);

AppointmentSchema.index({ patientId: 1, dateTime: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
