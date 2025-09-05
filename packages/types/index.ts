// Shared types for Healthcare AI Suite

export interface User {
  id: string;
  email: string;
  role: 'doctor' | 'patient';
  name: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  medicalHistory?: string;
}

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'active' | 'discontinued';
}

export interface DDIAlert {
  severity: 'low' | 'moderate' | 'high' | 'severe';
  drug1: string;
  drug2: string;
  description: string;
  recommendation?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  userId: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}