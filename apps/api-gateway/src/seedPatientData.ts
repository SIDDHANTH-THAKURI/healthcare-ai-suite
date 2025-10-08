import mongoose from 'mongoose';
import PatientProfile from './models/patientProfile';
import MedicationSchedule from './models/medicationSchedule';
import { MONGO_URI } from './config';

const sampleProfile = {
  userId: 'demo-patient-001',
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1985-06-15'),
    gender: 'male',
    bloodType: 'O+'
  },
  contactInfo: {
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543'
    }
  },
  medicalInfo: {
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date('2023-01-15'),
        prescribedBy: 'Dr. Smith'
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date('2023-02-20'),
        prescribedBy: 'Dr. Smith'
      }
    ]
  },
  lifestyle: {
    height: 175,
    weight: 80,
    activityLevel: 'moderate',
    sleepHours: 7,
    smokingStatus: 'never',
    alcoholConsumption: 'occasional'
  },
  preferences: {
    reminderEnabled: true,
    language: 'en',
    timezone: 'America/New_York'
  },
  onboardingCompleted: true
};

const sampleMedications = [
  {
    patientId: 'demo-patient-001',
    medicationId: 'med-001',
    medicationName: 'Aspirin',
    dosage: '81mg',
    schedules: [
      { time: '08:00', taken: true, takenAt: new Date(), skipped: false },
      { time: '20:00', taken: false, skipped: false }
    ],
    date: new Date(),
    adherenceScore: 50
  },
  {
    patientId: 'demo-patient-001',
    medicationId: 'med-002',
    medicationName: 'Metformin',
    dosage: '500mg',
    schedules: [
      { time: '08:00', taken: true, takenAt: new Date(), skipped: false },
      { time: '20:00', taken: false, skipped: false }
    ],
    date: new Date(),
    adherenceScore: 50
  },
  {
    patientId: 'demo-patient-001',
    medicationId: 'med-003',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    schedules: [
      { time: '14:00', taken: false, skipped: false }
    ],
    date: new Date(),
    adherenceScore: 0
  }
];

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await PatientProfile.deleteMany({ userId: 'demo-patient-001' });
    await MedicationSchedule.deleteMany({ patientId: 'demo-patient-001' });
    console.log('Cleared existing demo data');

    // Insert sample profile
    const profile = await PatientProfile.create(sampleProfile);
    console.log('Created sample patient profile:', profile._id);

    // Insert sample medications
    const medications = await MedicationSchedule.insertMany(sampleMedications);
    console.log('Created sample medications:', medications.length);

    console.log('\n✅ Sample data seeded successfully!');
    console.log('\nDemo Patient Credentials:');
    console.log('User ID: demo-patient-001');
    console.log('Name: John Doe');
    console.log('Email: john.doe@example.com');
    console.log('\nAccess the portal at: http://localhost:5173/patient-portal-new');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
