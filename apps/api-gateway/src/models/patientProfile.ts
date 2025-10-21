import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    bloodType: string;
    profilePicture?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      prescribedBy: string;
    }>;
  };
  lifestyle: {
    height: number;
    weight: number;
    activityLevel: string;
    sleepHours: number;
    smokingStatus: string;
    alcoholConsumption: string;
  };
  preferences: {
    reminderEnabled: boolean;
    language: string;
    timezone: string;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      gender: { type: String, required: true },
      bloodType: { type: String },
      profilePicture: { type: String }
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String },
      emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String }
      }
    },
    medicalInfo: {
      allergies: [{ type: String }],
      chronicConditions: [{ type: String }],
      currentMedications: [{
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        startDate: { type: Date },
        prescribedBy: { type: String }
      }]
    },
    lifestyle: {
      height: { type: Number },
      weight: { type: Number },
      activityLevel: { type: String },
      sleepHours: { type: Number },
      smokingStatus: { type: String },
      alcoholConsumption: { type: String }
    },
    preferences: {
      reminderEnabled: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' }
    },
    onboardingCompleted: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    collection: 'patientprofiles'
  }
);

export default mongoose.model<IPatientProfile>('PatientProfile', PatientProfileSchema);
