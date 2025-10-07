# DDI Alert System - Complete Guide

## 🎯 Overview

The Drug-Drug Interaction (DDI) Alert System is an intelligent monitoring system that checks for potential drug interactions, contraindications, and allergies based on patient's current medications, medical conditions, and history.

---

## ✨ Features

### 1. **Smart Interaction Detection**
- Checks drug-drug interactions
- Identifies condition-specific contraindications
- Detects allergy conflicts
- Considers patient medical history

### 2. **Two-Tier Alert System**
- **Active Alerts**: Current issues requiring attention
- **Old/Resolved Alerts**: Historical issues that have been resolved

### 3. **Severity Levels**
- 🔴 **Critical**: Immediate action required (e.g., allergies)
- 🟠 **Major**: Significant risk, alternative needed
- 🟡 **Moderate**: Monitor closely
- 🟢 **Minor**: Low risk, awareness needed

### 4. **Automatic Alert Management**
- Alerts move from Active to Old when medications change
- Persistent storage (survives page refresh)
- Timestamp tracking for all alerts

---

## 📍 Location

The DDI Alert System appears on the **Patient Details** page, directly below the "Manage Prescription" button in the patient header section.

---

## 🎨 Visual Design

### Active Alerts Section
```
┌─────────────────────────────────────────────┐
│ 🛡️ Drug Interaction Alerts          [2]    │
│                    [🔄 Check Interactions]  │
├─────────────────────────────────────────────┤
│ ⚠️ ACTIVE ALERTS (2)                        │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL                             │ │
│ │ Aspirin + Warfarin                      │ │
│ │ Increased bleeding risk...              │ │
│ │                                    [▼]  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟠 MAJOR                                │ │
│ │ Metformin                               │ │
│ │ Contraindicated with kidney disease     │ │
│ │                                    [▼]  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### No Alerts State
```
┌─────────────────────────────────────────────┐
│ ✅ No active drug interactions detected     │
│ All current medications appear safe together│
└─────────────────────────────────────────────┘
```

### Resolved Alerts Section
```
┌─────────────────────────────────────────────┐
│ [▼] 📜 RESOLVED ALERTS (3)                  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ✓ Aspirin + Ibuprofen                   │ │
│ │ NSAIDs interaction                      │ │
│ │ [Resolved]                              │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### Workflow

1. **Doctor adds/modifies prescriptions**
   - Navigate to Create Prescription page
   - Add, edit, or remove medications
   - Save changes

2. **Return to Patient Details**
   - DDI Alert System is visible
   - Shows last check time (if any)

3. **Click "Check Interactions"**
   - System sends current medications to ML service
   - Includes patient conditions and allergies
   - Analyzes all combinations

4. **Alerts Generated**
   - New issues → Active Alerts
   - Resolved issues → Old Alerts
   - Severity assigned automatically

5. **Review Alerts**
   - Click alert to expand details
   - Read recommendations
   - Take appropriate action

---

## 🎯 Alert Types

### 1. Drug-Drug Interactions (DDI)
**Example**: Aspirin + Warfarin
- **Severity**: Critical
- **Message**: "Increased risk of bleeding"
- **Recommendation**: "Avoid combination or monitor INR closely"

### 2. Condition Contraindications
**Example**: Metformin + Kidney Disease
- **Severity**: Major
- **Message**: "Metformin contraindicated in renal impairment"
- **Recommendation**: "Consider alternative diabetes medication"

### 3. Allergy Alerts
**Example**: Patient allergic to Penicillin
- **Severity**: Critical
- **Message**: "Patient is allergic to Penicillin"
- **Recommendation**: "DO NOT ADMINISTER. Use alternative antibiotic"

---

## 💾 Data Persistence

### Local Storage
- Alerts saved per patient
- Survives page refresh
- Includes timestamps
- Maintains alert history

### Storage Key Format
```javascript
ddi_alerts_${patientId}
```

### Stored Data
```json
{
  "active": [
    {
      "id": "unique-id",
      "severity": "critical",
      "drugs": ["Drug A", "Drug B"],
      "message": "Interaction description",
      "recommendation": "What to do",
      "timestamp": "2024-03-15T10:30:00Z",
      "status": "active"
    }
  ],
  "old": [...],
  "lastCheck": "2024-03-15T10:30:00Z"
}
```

---

## 🔧 Technical Implementation

### Frontend Component
**File**: `DDIAlertSystem.tsx`

**Props**:
- `patientId`: Patient identifier
- `currentMedications`: Array of current meds
- `conditions`: Patient's medical conditions
- `allergies`: Known allergies
- `onAlertsUpdate`: Callback for alert changes

**State Management**:
- `activeAlerts`: Current issues
- `oldAlerts`: Resolved issues
- `isChecking`: Loading state
- `lastCheckTime`: Last check timestamp
- `expandedAlert`: Currently expanded alert ID

### Backend Endpoint
**File**: `server.py`
**Endpoint**: `POST /api/check-ddi`

**Request**:
```json
{
  "patientId": "P001",
  "medications": [
    {"name": "Aspirin", "dosage": "100mg"},
    {"name": "Warfarin", "dosage": "5mg"}
  ],
  "conditions": ["Hypertension", "Diabetes"],
  "allergies": ["Penicillin"]
}
```

**Response**:
```json
{
  "interactions": [
    {
      "severity": "critical",
      "drugs": ["Aspirin", "Warfarin"],
      "message": "Increased bleeding risk",
      "recommendation": "Monitor INR closely"
    }
  ]
}
```

---

## 🎨 Styling

### Color Coding
- **Critical**: Red (#dc3545)
- **Major**: Orange (#fd7e14)
- **Moderate**: Yellow (#ffc107)
- **Minor**: Green (#28a745)
- **Resolved**: Gray (#6c757d)

### Animations
- **Slide in**: Component entrance
- **Pulse**: Alert badge animation
- **Expand**: Alert details reveal
- **Hover**: Card lift effect

### Responsive Design
- **Mobile**: Stacked layout, full-width buttons
- **Tablet**: Optimized spacing
- **Desktop**: Full features with hover effects

---

## 📊 Use Cases

### Case 1: New Prescription with Interaction
**Scenario**: Doctor adds Warfarin to patient already on Aspirin

**Flow**:
1. Doctor adds Warfarin in Create Prescription
2. Returns to Patient Details
3. Clicks "Check Interactions"
4. System detects critical interaction
5. Alert appears in Active section
6. Doctor reviews and adjusts prescription

### Case 2: Resolved Interaction
**Scenario**: Doctor removes one of the interacting drugs

**Flow**:
1. Doctor removes Warfarin
2. Returns to Patient Details
3. Clicks "Check Interactions"
4. System finds no interaction
5. Previous alert moves to Old section
6. "No active interactions" message shown

### Case 3: Allergy Detection
**Scenario**: Patient allergic to Penicillin, doctor prescribes Amoxicillin

**Flow**:
1. System checks medications against allergies
2. Detects Amoxicillin (Penicillin derivative)
3. Critical alert generated
4. Doctor immediately notified
5. Alternative antibiotic prescribed

---

## 🚀 Benefits

### For Doctors
1. **Safety**: Catch dangerous interactions before prescribing
2. **Efficiency**: Automated checking saves time
3. **Documentation**: Alert history for reference
4. **Confidence**: Evidence-based recommendations

### For Patients
1. **Safety**: Reduced risk of adverse reactions
2. **Better Care**: Optimized medication regimens
3. **Transparency**: Clear communication about risks
4. **Trust**: Systematic safety checks

### For Healthcare System
1. **Quality**: Improved prescription safety
2. **Compliance**: Documented safety checks
3. **Liability**: Reduced malpractice risk
4. **Efficiency**: Automated monitoring

---

## 🔮 Future Enhancements

### Planned Features
1. **Real-time Monitoring**: Check on every prescription change
2. **Severity Scoring**: Numerical risk scores
3. **Alternative Suggestions**: Recommend safer alternatives
4. **Export Reports**: PDF reports for patient records
5. **Integration**: Link to external drug databases
6. **Notifications**: Email/SMS alerts for critical issues
7. **Analytics**: Track interaction patterns
8. **ML Enhancement**: Learn from doctor decisions

### Advanced Checks
- Drug-food interactions
- Drug-lab test interactions
- Dosage-specific warnings
- Age/weight-based adjustments
- Pregnancy/breastfeeding warnings
- Genetic factors (pharmacogenomics)

---

## 📝 Best Practices

### For Doctors
1. **Check regularly**: After any prescription change
2. **Review all alerts**: Don't dismiss without reading
3. **Document decisions**: Note why you override alerts
4. **Update conditions**: Keep patient history current
5. **Verify allergies**: Confirm with patient regularly

### For System Administrators
1. **Keep database updated**: Regular drug interaction updates
2. **Monitor performance**: Track API response times
3. **Backup data**: Regular alert history backups
4. **Test thoroughly**: Verify interaction detection
5. **Train users**: Ensure doctors understand system

---

## 🐛 Troubleshooting

### Issue: "Check Interactions" button disabled
**Cause**: Less than 2 medications
**Solution**: Add at least 2 medications to check

### Issue: No alerts showing after check
**Possible causes**:
1. No interactions detected (good!)
2. API error (check console)
3. Network issue (check connection)

**Solution**: Check browser console for errors

### Issue: Alerts not persisting
**Cause**: LocalStorage disabled or full
**Solution**: Enable localStorage or clear old data

### Issue: Incorrect interactions
**Cause**: Outdated drug database
**Solution**: Update interaction database

---

## 📚 API Reference

### Check DDI Endpoint

**URL**: `POST /api/check-ddi`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```typescript
{
  patientId: string;
  medications: Array<{
    name: string;
    dosage: string;
  }>;
  conditions: string[];
  allergies: string[];
}
```

**Response**:
```typescript
{
  interactions: Array<{
    severity: 'critical' | 'major' | 'moderate' | 'minor';
    drugs: string[];
    message: string;
    recommendation: string;
  }>;
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (missing data)
- `401`: Unauthorized
- `500`: Server error

---

## 🎉 Summary

The DDI Alert System provides:
- ✅ Automated drug interaction checking
- ✅ Multi-level severity classification
- ✅ Active and historical alert tracking
- ✅ Patient-specific contraindication detection
- ✅ Allergy conflict identification
- ✅ Beautiful, intuitive interface
- ✅ Persistent alert storage
- ✅ Actionable recommendations

**Result**: Safer prescriptions, better patient outcomes, and peace of mind for healthcare providers! 🏥✨
