import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  location: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    notes: { type: String },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  { timestamps: true }
);

AppointmentSchema.index({ patientId: 1, date: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
