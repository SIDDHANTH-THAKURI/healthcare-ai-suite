# Medication Status Management System

## 🎯 Overview

The Medication Status Management System automatically tracks medication status (active/inactive) based on duration and allows doctors to manually toggle status. Medications are separated into **Active** and **Past** tabs for better organization.

---

## ✨ Key Features

### 1. **Automatic Status Calculation**
- Medications automatically become inactive when duration expires
- Based on start date + duration
- Checked in real-time when viewing patient details

### 2. **Manual Status Toggle**
- Doctors can manually mark medications as active/inactive
- Click the status icon (✓ or ✕) to toggle
- Useful for stopping medications early or reactivating

### 3. **Separate Tabs**
- **Active Tab**: Currently prescribed medications
- **Past Tab**: Discontinued or expired medications
- Badge shows count for each category

### 4. **Duration-Based Logic**
- "7 days" → Auto-inactive after 7 days
- "2 weeks" → Auto-inactive after 14 days
- "1 month" → Auto-inactive after 30 days
- "Ongoing" → Always active (no end date)

---

## 📊 Data Structure

### Medicine Interface
```typescript
interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  status?: 'active' | 'inactive';
  startDate?: string;        // ISO date (YYYY-MM-DD)
  endDate?: string;          // Calculated from duration
}
```

### Example
```json
{
  "id": 1,
  "name": "Aspirin",
  "dosage": "100mg",
  "frequency": "Once daily",
  "duration": "7 days",
  "status": "active",
  "startDate": "2024-03-15",
  "endDate": "2024-03-22"
}
```

---

## 🔄 Workflow

### Adding New Medication

1. **Doctor adds medication** in Create Prescription
   - Enters name, dosage, frequency, duration
   - Clicks "Save Medication"

2. **System calculates dates**
   - `startDate` = Today's date
   - `endDate` = startDate + duration
   - `status` = 'active'

3. **Medication saved to MongoDB**
   - Stored with all metadata
   - No DDI check at this point

4. **Returns to Patient Details**
   - Medication appears in Active tab
   - Shows start and end dates

### Automatic Status Update

1. **Patient Details page loads**
2. **System checks each medication**
   ```typescript
   if (today > endDate) {
     status = 'inactive'
   }
   ```
3. **Medications sorted into tabs**
   - Active: status === 'active' AND today <= endDate
   - Past: status === 'inactive' OR today > endDate

### Manual Status Toggle

1. **Doctor clicks status icon**
   - ✓ (green) = Active → Click to mark inactive
   - ✕ (gray) = Inactive → Click to mark active

2. **Status updates immediately**
   - UI updates instantly
   - Saved to backend

3. **Medication moves to appropriate tab**
   - Active → Past (when marked inactive)
   - Past → Active (when reactivated)

---

## 🎨 Visual Design

### Active Medications Tab
```
┌─────────────────────────────────────────┐
│ 💊 Medications                          │
├─────────────────────────────────────────┤
│ [Active (3)]  [Past (2)]               │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Aspirin                          ✓  │ │ ← Green checkmark
│ │ ⚖️ Dosage: 100mg                    │ │
│ │ 🕐 Frequency: Once daily            │ │
│ │ 📅 Duration: 7 days                 │ │
│ │ 📅 Started: 03/15/2024              │ │
│ │ 📅 Ends: 03/22/2024                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Past Medications Tab
```
┌─────────────────────────────────────────┐
│ 💊 Medications                          │
├─────────────────────────────────────────┤
│ [Active (3)]  [Past (2)]               │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Ibuprofen                        ✕  │ │ ← Gray X
│ │ ⚖️ Dosage: 400mg                    │ │
│ │ 🕐 Frequency: Twice daily           │ │
│ │ 📅 Duration: 5 days                 │ │
│ │ 📅 Started: 03/01/2024              │ │
│ │ 📅 Ended: 03/06/2024                │ │
│ │ 🕐 Discontinued                     │ │ ← Badge
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 💻 Technical Implementation

### Duration Parsing
```typescript
const calculateEndDate = (startDate: string, duration: string): string | undefined => {
  if (!duration || duration.toLowerCase() === 'ongoing') return undefined;
  
  const start = new Date(startDate);
  const match = duration.match(/(\d+)\s*(day|week|month|year)s?/i);
  
  if (match) {
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'day':
        start.setDate(start.getDate() + amount);
        break;
      case 'week':
        start.setDate(start.getDate() + (amount * 7));
        break;
      case 'month':
        start.setMonth(start.getMonth() + amount);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() + amount);
        break;
    }
    
    return start.toISOString().split('T')[0];
  }
  
  return undefined;
};
```

### Status Check
```typescript
const isMedicationActive = (medication: Medicine): boolean => {
  if (medication.status === 'inactive') return false;
  if (!medication.endDate) return true; // Ongoing
  
  const today = new Date();
  const endDate = new Date(medication.endDate);
  return today <= endDate;
};
```

### Status Toggle
```typescript
const toggleMedicationStatus = async (medicationId: number) => {
  const updatedMedications = currentMedications.map(med => {
    if (med.id === medicationId) {
      return {
        ...med,
        status: med.status === 'active' ? 'inactive' : 'active'
      };
    }
    return med;
  });
  
  setCurrentMedications(updatedMedications);
  
  // Save to backend
  await fetch('/api/prescriptions/update-status', {
    method: 'POST',
    body: JSON.stringify({ patientId, medicationId, status })
  });
};
```

---

## 🗄️ Database Storage

### MongoDB Document Structure
```json
{
  "patient": "P001",
  "medicines": [
    {
      "id": 1,
      "name": "Aspirin",
      "dosage": "100mg",
      "frequency": "Once daily",
      "duration": "7 days",
      "status": "active",
      "startDate": "2024-03-15",
      "endDate": "2024-03-22"
    },
    {
      "id": 2,
      "name": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "status": "inactive",
      "startDate": "2024-03-01",
      "endDate": "2024-03-06"
    }
  ],
  "consultationNotes": [...]
}
```

---

## 📋 Use Cases

### Case 1: Short-Term Medication
**Scenario**: Antibiotic for 7 days

**Flow**:
1. Doctor prescribes "Amoxicillin, 500mg, 3x daily, 7 days"
2. System sets:
   - startDate: 2024-03-15
   - endDate: 2024-03-22
   - status: active
3. Patient takes medication for 7 days
4. On 2024-03-23, system auto-marks as inactive
5. Medication moves to Past tab

### Case 2: Ongoing Medication
**Scenario**: Blood pressure medication

**Flow**:
1. Doctor prescribes "Lisinopril, 10mg, Once daily, Ongoing"
2. System sets:
   - startDate: 2024-03-15
   - endDate: undefined
   - status: active
3. Medication stays in Active tab indefinitely
4. Doctor can manually mark inactive if needed

### Case 3: Early Discontinuation
**Scenario**: Patient has adverse reaction

**Flow**:
1. Medication prescribed for 30 days
2. After 5 days, patient has side effects
3. Doctor clicks ✓ icon to mark inactive
4. Medication immediately moves to Past tab
5. Status saved to database

### Case 4: Reactivating Medication
**Scenario**: Restart previous medication

**Flow**:
1. Medication in Past tab (inactive)
2. Doctor decides to restart
3. Clicks ✕ icon to reactivate
4. Medication moves back to Active tab
5. New start date recorded

---

## 🎯 Benefits

### For Doctors
1. **Clear Overview**: See active vs past medications at a glance
2. **Automatic Tracking**: No manual status updates needed
3. **Flexible Control**: Can override automatic status
4. **Better Documentation**: Complete medication history

### For Patients
1. **Safety**: Clear record of current medications
2. **History**: Track past treatments
3. **Accuracy**: Automatic expiration prevents confusion

### For System
1. **Data Integrity**: Accurate medication status
2. **DDI Checking**: Only check active medications
3. **Reporting**: Better analytics on medication patterns

---

## 🔧 Configuration

### Duration Formats Supported
- "7 days"
- "2 weeks"
- "1 month"
- "3 months"
- "1 year"
- "Ongoing" (no end date)

### Status Values
- `active`: Currently prescribed
- `inactive`: Discontinued or expired

---

## 🐛 Edge Cases Handled

### 1. Missing Duration
- Treated as "Ongoing"
- No end date set
- Always active until manually stopped

### 2. Invalid Duration Format
- Falls back to undefined end date
- Medication stays active
- Doctor can manually set inactive

### 3. Past Start Date
- Calculates end date from past start
- May already be expired
- Automatically marked inactive

### 4. Future Start Date
- Not currently supported
- Treated as starting today
- Future enhancement possible

---

## 📊 Status Indicators

### Visual Cues
- **Green border**: Active medication
- **Gray border**: Inactive medication
- **✓ icon**: Active (click to deactivate)
- **✕ icon**: Inactive (click to reactivate)
- **"Discontinued" badge**: Shows on past medications

### Color Scheme
- Active: #28a745 (green)
- Inactive: #6c757d (gray)
- Hover: Lighter shade with scale effect

---

## 🚀 Future Enhancements

### Planned Features
1. **Scheduled Start Dates**: Future-dated prescriptions
2. **Refill Tracking**: Track refill dates
3. **Adherence Monitoring**: Track if patient taking meds
4. **Dosage History**: Track dosage changes over time
5. **Interaction Alerts**: Alert when reactivating conflicting meds
6. **Export History**: PDF medication history report
7. **Reminders**: Notify when medication ending soon

---

## 📝 Summary

The Medication Status Management System provides:
- ✅ Automatic status tracking based on duration
- ✅ Manual override capability
- ✅ Clear active/past separation
- ✅ Complete medication history
- ✅ No DDI checks during save (only when requested)
- ✅ Simple, intuitive interface
- ✅ Persistent storage in MongoDB

**Result**: Better medication management, improved patient safety, and clearer documentation! 💊✨
