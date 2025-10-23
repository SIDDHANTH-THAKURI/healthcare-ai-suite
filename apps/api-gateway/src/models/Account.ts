// models/Account.ts
import mongoose, { Schema, Document } from "mongoose";

export enum Role {
    DOCTOR = "doctor",
    PATIENT = "patient",
}

export interface IAccount extends Document {
    email: string;
    password: string;
    roles: Role[];
    doctorProfile?: any;
    patientProfile?: any;
    openrouterApiKey?: string | null;
    dailyMessageCount?: number;
    lastMessageDate?: string | null;
}

const PatientSchema = new Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        age: { type: Number },
        gender: { type: String },
        dob: { type: String },
        lastVisit: { type: String }
    },
    { _id: false }
);

const DoctorProfileSchema = new Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        specialization: { type: String, required: true },
        qualifications: { type: String },
        experienceYears: { type: Number },
        profileImage: { type: String },
        age: { type: Number, required: true },
        gender: { type: String, enum: ["male", "female", "other"], required: true },
        patients: { type: [PatientSchema], default: [] }
    },
    { _id: false }
);

const PatientProfileSchema = new Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        age: { type: Number },
        gender: { type: String, enum: ["male", "female", "other"] },
        height: { type: Number },
        weight: { type: Number },
        profileImage: { type: String },
    },
    { _id: false }
);




const AccountSchema = new Schema<IAccount>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        roles: { type: [String], required: true },
        // Make sure there is no separate required "role" field here
        doctorProfile: { type: DoctorProfileSchema },
        patientProfile: { type: PatientProfileSchema },
        // BYOK (Bring Your Own Key) fields
        openrouterApiKey: { type: String, default: null }, // User's own API key
        dailyMessageCount: { type: Number, default: 0 }, // Track daily usage
        lastMessageDate: { type: String, default: null }, // Reset counter daily
    },
    { 
        timestamps: true,
        collection: 'accounts' // Explicitly set collection name
    }
);


export default mongoose.model<IAccount>("Account", AccountSchema);
