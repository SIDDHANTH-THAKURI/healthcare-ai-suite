# Quick Reference: New Medication System

## What Changed?

### Before
- Single text input for frequency (e.g., "Twice daily")
- Manual time selection with time pickers
- Edit button didn't work properly

### After
- **Dropdown 1**: Frequency Type (Daily/Weekly/Monthly/Yearly/Custom)
- **Dropdown 2**: Times of Day (Morning/Afternoon/Evening/Night) - Multi-select checkboxes
- **Custom Input**: Appears when "Custom" frequency is selected
- **Edit**: Now works correctly
- **Smart Display**: Medications auto-hide when taken
- **Live Counts**: "Meds Today" and "Taken" update in real-time

## How It Works

### 1. Creating a Prescription (Doctor Portal)

```
Medicine Name: [Aspirin ▼]
Dosage: [500mg]
Frequency Type: [Daily ▼]
Times of Day: 
  ☑ Morning
  ☐ Afternoon
  ☑ Evening
  ☐ Night
Duration: [7 days]
```

**Result**: Patient takes Aspirin 500mg twice daily (morning and evening) for 7 days

### 2. Patient Dashboard

**Meds Today Section:**
```
💊 3        ✅ 1        📊 33%
Meds Today  Taken       Score
```

**Today's Medications Section:**
```
Morning
2 pills
┌─────────────────────┐
│ 💊 Aspirin          │
│    500mg        [✓] │
└─────────────────────┘
┌─────────────────────┐
│ 🧪 Vitamin D        │
│    1000 IU      [✓] │
└─────────────────────┘

Evening
1 pill
┌─────────────────────┐
│ 💊 Aspirin          │
│    500mg        [✓] │
└─────────────────────┘
```

### 3. Taking Medication

1. Patient clicks [✓] button
2. Medication disappears from list
3. "Taken" count increases (1 → 2)
4. "Score" updates (33% → 67%)
5. If all medications in a time slot are taken, the entire slot disappears

## Key Features

### ✅ Frequency Options
- **Daily**: Every day
- **Weekly**: Once per week
- **Monthly**: Once per month
- **Yearly**: Once per year
- **Custom**: User types their own (e.g., "Every 3 days", "Twice a week")

### ✅ Times of Day
- **Morning**: 08:00 (8 AM)
- **Afternoon**: 14:00 (2 PM)
- **Evening**: 18:00 (6 PM)
- **Night**: 22:00 (10 PM)

*Can select multiple times*

### ✅ Smart Counting
- **Meds Today**: Counts unique medications scheduled for today
- **Taken**: Counts individual doses taken (if same med 2x/day, counts as 2)
- **Score**: (Taken / Total) × 100

### ✅ Visual Feedback
- Medication images show if uploaded
- Icons show if no image
- Time slots auto-hide when complete
- Real-time updates

## Example Scenarios

### Scenario 1: Simple Daily Medication
```
Medicine: Aspirin
Dosage: 81mg
Frequency: Daily
Times: Morning
Duration: Ongoing
```
→ Patient takes 1 pill every morning

### Scenario 2: Multiple Times Per Day
```
Medicine: Antibiotic
Dosage: 500mg
Frequency: Daily
Times: Morning, Afternoon, Evening
Duration: 7 days
```
→ Patient takes 3 pills per day for 1 week

### Scenario 3: Custom Frequency
```
Medicine: Vitamin B12
Dosage: 1000mcg
Frequency: Custom → "Every 3 days"
Times: Morning
Duration: 3 months
```
→ Patient takes 1 pill every 3 days in the morning

### Scenario 4: Weekly Medication
```
Medicine: Methotrexate
Dosage: 15mg
Frequency: Weekly
Times: Morning
Duration: Ongoing
```
→ Patient takes 1 pill once per week in the morning

## Validation Rules

### Creating Prescription
- ✓ Medicine name must be from dropdown
- ✓ Dosage required
- ✓ At least one time of day must be selected
- ✓ Duration required
- ✓ If "Custom" frequency, custom text required

### Patient Taking Medication
- ✓ Can only mark as taken once per time slot
- ✓ Cannot unmark (prevents gaming the system)
- ✓ Updates are immediate

## Technical Details

### Data Structure
```typescript
{
  medicationName: "Aspirin",
  dosage: "500mg",
  frequencyType: "daily",
  customFrequency: "",
  timesOfDay: ["Morning", "Evening"],
  schedules: [
    {
      time: "08:00",
      timeOfDay: "Morning",
      taken: false,
      takenAt: null
    },
    {
      time: "18:00",
      timeOfDay: "Evening",
      taken: false,
      takenAt: null
    }
  ]
}
```

### API Endpoints Used
- `POST /api/medication-schedule` - Add medication
- `GET /api/medication-schedule/today/:userId` - Get today's meds
- `PATCH /api/medication-schedule/:id/take` - Mark as taken
- `DELETE /api/medication-schedule/:id` - Delete medication

## Troubleshooting

### Edit button not working?
✓ Fixed! Now properly loads all fields including times of day

### Medications not showing?
- Check if start date is today or earlier
- Check if end date hasn't passed
- Verify medication was saved successfully

### Count not updating?
- Refresh the page
- Check browser console for errors
- Verify API is running on port 5000

### Times of day not saving?
- Ensure at least one checkbox is selected
- Check validation messages
- Verify all required fields are filled

## Tips for Best Results

1. **Upload Images**: Add medication images for easy visual identification
2. **Be Specific**: Use exact dosages (e.g., "500mg" not "500")
3. **Set End Dates**: For short-term medications, set end dates
4. **Check Daily**: Encourage patients to check medications daily
5. **Review Adherence**: Monitor the adherence score regularly

## Support

If you encounter issues:
1. Check browser console (F12)
2. Verify API is running (`npm run dev` in api-gateway)
3. Check database connection
4. Review MEDICATION_TRACKING_UPDATE.md for detailed implementation
