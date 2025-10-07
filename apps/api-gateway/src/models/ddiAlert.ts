import mongoose, { Schema, model, Document } from 'mongoose';

export interface IDDIAlert {
    id: string;
    severity: 'critical' | 'major' | 'moderate' | 'minor';
    message: string;
    drugs: string[];
    recommendation: string;
    timestamp: string;
    status: 'active' | 'resolved';
}

export interface IDDIAlertRecord extends Document {
    patientId: string;
    activeAlerts: IDDIAlert[];
    oldAlerts: IDDIAlert[];
    lastCheckTime: string;
    createdAt: Date;
    updatedAt: Date;
}

const DDIAlertSchema = new Schema<IDDIAlert>(
    {
        id: { type: String, required: true },
        severity: { 
            type: String, 
            enum: ['critical', 'major', 'moderate', 'minor'],
            required: true 
        },
        message: { type: String, required: true },
        drugs: { type: [String], required: true },
        recommendation: { type: String, required: true },
        timestamp: { type: String, required: true },
        status: { 
            type: String, 
            enum: ['active', 'resolved'],
            required: true 
        },
    },
    { _id: false }
);

const DDIAlertRecordSchema = new Schema<IDDIAlertRecord>(
    {
        patientId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        activeAlerts: {
            type: [DDIAlertSchema],
            default: []
        },
        oldAlerts: {
            type: [DDIAlertSchema],
            default: []
        },
        lastCheckTime: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);

export default model<IDDIAlertRecord>('DDIAlertRecord', DDIAlertRecordSchema);
