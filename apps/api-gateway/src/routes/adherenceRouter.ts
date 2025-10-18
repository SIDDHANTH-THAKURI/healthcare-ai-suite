import express, { Request, Response } from 'express';
import MedicationSchedule from '../models/medicationSchedule';

const router = express.Router();

// Calculate medication adherence streak
router.get('/streak/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    
    // Get all medication schedules for the patient from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const schedules = await MedicationSchedule.find({ 
      patientId,
      startDate: { $gte: thirtyDaysAgo }
    }).sort({ startDate: -1 });
    
    if (schedules.length === 0) {
      res.json({ streak: 0, last7Days: [] });
      return;
    }

    // Calculate daily adherence for the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days: Array<{ date: string; taken: number; total: number; perfect: boolean }> = [];
    
    // Go back 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      let taken = 0;
      let total = 0;
      
      // Count medications for this specific day
      schedules.forEach(schedule => {
        const scheduleDate = new Date(schedule.startDate || new Date());
        scheduleDate.setHours(0, 0, 0, 0);
        const scheduleDateKey = scheduleDate.toISOString().split('T')[0];
        
        // Only count if this schedule is for this day
        if (scheduleDateKey === dateKey) {
          schedule.schedules.forEach(timeSlot => {
            total++;
            if (timeSlot.taken) {
              taken++;
            }
          });
        }
      });
      
      last7Days.push({
        date: dateKey,
        taken,
        total,
        perfect: total > 0 && taken === total
      });
    }

    // Calculate streak (consecutive perfect days from today backwards)
    let streak = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      const day = last7Days[i];
      if (day.total > 0 && day.perfect) {
        streak++;
      } else if (day.total > 0) {
        break; // Streak broken
      }
      // Skip days with no medications
    }

    res.json({
      streak,
      last7Days
    });

  } catch (error) {
    console.error('Error calculating streak:', error);
    res.status(500).json({ error: 'Failed to calculate adherence streak' });
  }
});

// Get adherence statistics
router.get('/stats/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { days = '30' } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));
    
    const schedules = await MedicationSchedule.find({ 
      patientId,
      startDate: { $gte: cutoffDate }
    });
    
    if (schedules.length === 0) {
      res.json({
        overallAdherence: 100,
        totalDoses: 0,
        takenDoses: 0,
        missedDoses: 0,
        skippedDoses: 0
      });
      return;
    }

    let totalDoses = 0;
    let takenDoses = 0;
    let skippedDoses = 0;

    schedules.forEach(schedule => {
      schedule.schedules.forEach(timeSlot => {
        totalDoses++;
        
        if (timeSlot.taken) {
          takenDoses++;
        }
        if (timeSlot.skipped) {
          skippedDoses++;
        }
      });
    });

    const missedDoses = totalDoses - takenDoses - skippedDoses;
    const overallAdherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    res.json({
      overallAdherence,
      totalDoses,
      takenDoses,
      missedDoses,
      skippedDoses,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate adherence statistics' });
  }
});

export default router;
