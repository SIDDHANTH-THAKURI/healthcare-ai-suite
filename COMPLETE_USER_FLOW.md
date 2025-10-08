# ✅ Complete Patient User Flow - Fixed & Verified

## Overview
The complete flow from signup to portal with user data persistence is now working correctly.

## Fixed Issues
1. ✅ **Added user object storage** - Now stores both token AND user object in localStorage
2. ✅ **User ID consistency** - Uses email from localStorage throughout the app
3. ✅ **Profile data persistence** - Saved profile reflects in portal

## Complete Flow

### Step 1: Sign Up as Patient

**Location:** `/Authentication`

**What Happens:**
1. User selects "Patient" role
2. Fills email, password
3. Clicks "Create Secure Account"

**Backend:**
```javascript
POST /api/auth/register
Body: { email, password, role: "patient" }
Response: { token, user: { email, roles, _id } }
```

**Frontend Storage:**
```javascript
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
// Stores: { email: "user@example.com", roles: ["patient"], _id: "..." }
```

**Redirect:** `/patient-profile-setup`

---

### Step 2: Profile Setup

**Location:** `/patient-profile-setup`

**What Happens:**
1. User fills 4-step form:
   - Step 1: Personal Info (name, DOB, gender, blood type)
   - Step 2: Contact Info (phone, email, emergency contact)
   - Step 3: Medical Info (allergies, conditions)
   - Step 4: Lifestyle Info (height, weight, activity, etc.)

2. Clicks "Complete Setup ✓"

**User ID Retrieval:**
```javascript
const user = localStorage.getItem('user');
const userId = user ? JSON.parse(user).email : 'demo-patient-001';
// Uses: "user@example.com" as userId
```

**Backend:**
```javascript
POST /api/patient-profile
Body: {
  userId: "user@example.com",  // From localStorage
  personalInfo: { firstName, lastName, ... },
  contactInfo: { phone, email, ... },
  medicalInfo: { allergies, chronicConditions, ... },
  lifestyle: { height, weight, ... },
  onboardingCompleted: true
}
Response: { _id, userId, personalInfo, ... }
```

**Database Storage:**
```javascript
// MongoDB Collection: PatientProfile
{
  userId: "user@example.com",
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1990-01-01",
    gender: "male",
    bloodType: "O+"
  },
  contactInfo: { ... },
  medicalInfo: { ... },
  lifestyle: { ... },
  onboardingCompleted: true
}
```

**Redirect:** `/patient-portal`

---

### Step 3: Patient Portal

**Location:** `/patient-portal`

**What Happens:**
1. Portal loads
2. Fetches user profile from database
3. Displays personalized information

**User ID Retrieval:**
```javascript
const user = localStorage.getItem('user');
const userId = user ? JSON.parse(user).email : 'demo-patient-001';
// Uses: "user@example.com"
```

**Backend Calls:**
```javascript
// 1. Fetch Profile
GET /api/patient-profile/user@example.com
Response: { userId, personalInfo, contactInfo, ... }

// 2. Fetch Today's Medications
GET /api/medication-schedule/today/user@example.com
Response: [{ medicationName, dosage, schedules, ... }]

// 3. Fetch Chat History
GET /api/chat/user@example.com
Response: [{ role, content, timestamp, ... }]
```

**Display:**
- **Header:** Shows user initials (from firstName, lastName)
- **Welcome:** "Welcome back, [firstName]!"
- **Stats:** Real medication counts and adherence score
- **Medications:** Today's medication schedule
- **Chat:** Previous conversations

---

## Data Flow Diagram

```
┌─────────────────┐
│   Sign Up       │
│  (Patient)      │
└────────┬────────┘
         │
         ├─ Store: localStorage.token
         ├─ Store: localStorage.user { email, roles }
         │
         v
┌─────────────────┐
│ Profile Setup   │
│  (4 Steps)      │
└────────┬────────┘
         │
         ├─ Get: localStorage.user.email
         ├─ POST: /api/patient-profile
         ├─ Save: MongoDB PatientProfile collection
         │
         v
┌─────────────────┐
│ Patient Portal  │
│  (Dashboard)    │
└────────┬────────┘
         │
         ├─ Get: localStorage.user.email
         ├─ GET: /api/patient-profile/:email
         ├─ GET: /api/medication-schedule/today/:email
         ├─ Display: User's personalized data
         │
         v
    ✅ Complete!
```

---

## User Data Mapping

### From Signup → Profile Setup
```javascript
// Signup stores:
localStorage.user = {
  email: "john@example.com",
  roles: ["patient"],
  _id: "507f1f77bcf86cd799439011"
}

// Profile Setup uses:
userId = localStorage.user.email  // "john@example.com"
```

### From Profile Setup → Portal
```javascript
// Profile Setup saves:
MongoDB.PatientProfile = {
  userId: "john@example.com",
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    ...
  },
  ...
}

// Portal fetches:
GET /api/patient-profile/john@example.com
// Returns the saved profile
```

### Portal Display
```javascript
// Portal uses profile data:
const firstName = profile.personalInfo.firstName;  // "John"
const lastName = profile.personalInfo.lastName;    // "Doe"
const initials = `${firstName[0]}${lastName[0]}`;  // "JD"

// Displays:
- Header: "JD" avatar
- Welcome: "Welcome back, John! 👋"
- User Info: "John Doe"
```

---

## Security & Persistence

### What's Stored in Browser
```javascript
// localStorage (persists across sessions)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": "{\"email\":\"john@example.com\",\"roles\":[\"patient\"]}"
}
```

### What's Stored in Database
```javascript
// MongoDB - Account Collection
{
  email: "john@example.com",
  password: "hashed_password",
  roles: ["patient"]
}

// MongoDB - PatientProfile Collection
{
  userId: "john@example.com",
  personalInfo: { ... },
  contactInfo: { ... },
  medicalInfo: { ... },
  lifestyle: { ... },
  onboardingCompleted: true
}

// MongoDB - MedicationSchedule Collection
{
  patientId: "john@example.com",
  medicationName: "Aspirin",
  dosage: "81mg",
  schedules: [...],
  date: "2024-01-15"
}

// MongoDB - ChatMessage Collection
{
  patientId: "john@example.com",
  role: "user",
  content: "Doctor prescribed...",
  timestamp: "2024-01-15T10:30:00Z"
}
```

---

## Testing the Complete Flow

### 1. Sign Up
```
1. Go to /Authentication
2. Select "Patient"
3. Email: test@example.com
4. Password: Test123!@#
5. Click "Create Secure Account"
6. ✅ Should redirect to /patient-profile-setup
```

### 2. Check localStorage
```javascript
// Open DevTools → Application → Local Storage
localStorage.getItem("token")  // Should have JWT token
localStorage.getItem("user")   // Should have user object with email
```

### 3. Profile Setup
```
1. Fill Step 1: First Name, Last Name, DOB, Gender
2. Click "Next"
3. Fill Step 2: Phone, Email, Emergency Contact
4. Click "Next"
5. Fill Step 3: Add allergies/conditions (optional)
6. Click "Next"
7. Fill Step 4: Height, Weight, etc. (optional)
8. Click "Complete Setup ✓"
9. ✅ Should save and redirect to /patient-portal
```

### 4. Verify Portal
```
1. Portal loads
2. Header shows: "TD" (initials from Test Data)
3. Welcome says: "Welcome back, Test! 👋"
4. User info shows: "Test Data"
5. ✅ All data from profile setup is displayed
```

### 5. Logout & Login
```
1. Clear localStorage (or logout)
2. Login with same email
3. Go to /patient-portal
4. ✅ Should still show all saved data
```

---

## Troubleshooting

### Issue: Portal shows "John Doe" instead of my name
**Cause:** Profile not saved or not fetched
**Check:**
```javascript
// In browser console
localStorage.getItem("user")  // Should show your email
```
**Solution:** Complete profile setup again

### Issue: "Failed to fetch" error
**Cause:** Backend not running
**Solution:**
```bash
cd Personalised_DDI_Checker
npm run dev:all
```

### Issue: Data not persisting
**Cause:** MongoDB not connected
**Check:** Backend console should show "Connected to MongoDB"
**Solution:** Start MongoDB: `mongod`

---

## Summary

✅ **Complete flow is working:**
1. Sign up stores token + user in localStorage
2. Profile setup uses email from localStorage as userId
3. Profile data saves to MongoDB with userId
4. Portal fetches profile using userId from localStorage
5. Portal displays personalized data from database

**User uniqueness:** Email address (stored in localStorage and used as userId in database)

**Data persistence:** MongoDB (survives browser refresh and logout/login)

**Security:** JWT token for authentication, email as unique identifier
