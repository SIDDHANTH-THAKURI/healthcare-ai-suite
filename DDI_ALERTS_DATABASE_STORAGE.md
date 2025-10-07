# DDI Alerts Database Storage

## Overview
DDI (Drug-Drug Interaction) alerts are now stored in MongoDB database instead of just browser localStorage. This provides persistent, cross-device access to patient interaction alerts.

## What Changed

### Backend Changes

#### 1. New Database Model (`ddiAlert.ts`)
- **Collection**: `ddialertrecords`
- **Schema**:
  ```typescript
  {
    patientId: string (unique, indexed)
    activeAlerts: DDIAlert[]
    oldAlerts: DDIAlert[]
    lastCheckTime: string
    createdAt: Date
    updatedAt: Date
  }
  ```

#### 2. New API Endpoints (`ddiAlertRouter.ts`)
- **GET** `/api/ddi-alerts/:patientId` - Retrieve alerts for a patient
- **POST** `/api/ddi-alerts/:patientId` - Save/update alerts for a patient
- **DELETE** `/api/ddi-alerts/:patientId` - Delete alerts for a patient

All endpoints require authentication via JWT token.

#### 3. Server Integration
- Added `ddiAlertRouter` to `server.ts`
- Route mounted at `/api/ddi-alerts`

### Frontend Changes

#### DDIAlertSystem Component
- **Load alerts**: Fetches from database on component mount
- **Save alerts**: Automatically saves to database when alerts change
- **Fallback**: Still uses localStorage as backup if database fails
- **Dual storage**: Saves to both database and localStorage for reliability

## Benefits

✅ **Persistent Storage**: Alerts survive browser cache clearing
✅ **Cross-Device Access**: View alerts from any device/browser
✅ **Multi-User Access**: All doctors can see patient alerts
✅ **Audit Trail**: Timestamps and history preserved
✅ **Backup**: localStorage still used as fallback
✅ **Automatic Sync**: Changes saved automatically

## Data Flow

1. **On Page Load**:
   - Component fetches alerts from database
   - Falls back to localStorage if database unavailable
   - Displays active and resolved alerts

2. **On DDI Check**:
   - New interactions detected
   - Alerts updated in component state
   - Automatically saved to database
   - Also saved to localStorage as backup

3. **On Alert Resolution**:
   - Active alerts moved to old alerts
   - Changes saved to database
   - UI updates immediately

## Migration

Existing localStorage data will:
- Continue to work as fallback
- Be preserved alongside database storage
- Not be automatically migrated (happens on next alert check)

## Database Schema Details

### DDIAlert Object
```typescript
{
  id: string                    // Unique alert ID
  severity: 'critical' | 'major' | 'moderate' | 'minor'
  message: string               // Interaction description
  drugs: string[]               // Array of drug names involved
  recommendation: string        // Clinical recommendation
  timestamp: string             // ISO timestamp
  status: 'active' | 'resolved' // Current status
}
```

### Alert Record
- One record per patient
- Contains arrays of active and resolved alerts
- Indexed by patientId for fast lookups
- Automatically timestamped (createdAt, updatedAt)

## API Usage Examples

### Get Alerts
```javascript
const response = await fetch(`${BASE_URL_1}/api/ddi-alerts/${patientId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
// { activeAlerts: [], oldAlerts: [], lastCheckTime: "..." }
```

### Save Alerts
```javascript
await fetch(`${BASE_URL_1}/api/ddi-alerts/${patientId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    activeAlerts: [...],
    oldAlerts: [...],
    lastCheckTime: new Date().toISOString()
  })
});
```

## Restart Required

After implementing these changes, restart the backend server:
```bash
cd apps/api-gateway
npm run dev
```

The changes will take effect immediately, and alerts will start being saved to the database.
