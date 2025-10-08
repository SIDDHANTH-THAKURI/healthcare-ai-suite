# Patient Portal - Full Implementation Plan

## Architecture Overview

### User Flow
1. **Authentication** → Login/Signup
2. **Profile Setup** (First Time Only) → Multi-step onboarding
3. **Patient Dashboard** → Main portal with all features

### Database Schema

#### PatientProfile Collection
```typescript
{
  userId: string,
  personalInfo: {
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    gender: string,
    bloodType: string,
    profilePicture?: string
  },
  contactInfo: {
    phone: string,
    email: string,
    address: string,
    emergencyContact: {
      name: string,
      relationship: string,
      phone: string
    }
  },
  medicalInfo: {
    allergies: string[],
    chronicConditions: string[],
    currentMedications: Array<{
      name: string,
      dosage: string,
      frequency: string,
      startDate: Date,
      prescribedBy: string
    }>
  },
  lifestyle: {
    height: number, // cm
    weight: number, // kg
    activityLevel: string,
    sleepHours: number,
    smokingStatus: string,
    alcoholConsumption: string
  },
  preferences: {
    reminderEnabled: boolean,
    language: string,
    timezone: string
  },
  onboardingCompleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### MedicationSchedule Collection
```typescript
{
  patientId: string,
  medicationId: string,
  medicationName: string,
  dosage: string,
  schedules: Array<{
    time: string, // "08:00", "14:00", "20:00"
    taken: boolean,
    takenAt?: Date,
    skipped: boolean,
    skipReason?: string
  }>,
  date: Date,
  adherenceScore: number
}
```

#### HealthMetrics Collection
```typescript
{
  patientId: string,
  date: Date,
  steps: number,
  sleepHours: number,
  waterIntake: number, // ml
  mood: string,
  symptoms: string[],
  notes: string
}
```

#### Appointments Collection
```typescript
{
  patientId: string,
  doctorId: string,
  doctorName: string,
  specialty: string,
  dateTime: Date,
  type: string, // "checkup", "followup", "emergency"
  status: string, // "scheduled", "completed", "cancelled"
  notes: string,
  prescription?: string
}
```

### Features to Implement

#### Phase 1: Core Setup
- [x] Profile setup multi-step form
- [x] Database models
- [x] API routes
- [x] Mobile-first responsive design

#### Phase 2: Dashboard
- [ ] Today's medications with time slots
- [ ] Mark as taken/skip functionality
- [ ] Health score calculation
- [ ] Quick action cards
- [ ] Upcoming appointments

#### Phase 3: Medication Management
- [ ] View all medications
- [ ] Medication history
- [ ] Adherence tracking
- [ ] Refill reminders
- [ ] Add/edit medications

#### Phase 4: Health Tracking
- [ ] Daily health metrics input
- [ ] Activity tracking
- [ ] Sleep tracking
- [ ] Symptom logger
- [ ] Health trends/charts

#### Phase 5: Appointments
- [ ] View appointments
- [ ] Book new appointment
- [ ] Reschedule/cancel
- [ ] Video consultation integration

#### Phase 6: AI Assistant
- [ ] Chat interface
- [ ] Medication queries
- [ ] Symptom checker
- [ ] Health tips
- [ ] Emergency guidance

### Mobile-First Breakpoints
- Mobile: 320px - 767px (default)
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Tech Stack
- Frontend: React + TypeScript
- Styling: CSS with mobile-first approach
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
