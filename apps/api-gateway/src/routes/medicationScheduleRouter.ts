import express, { Request, Response } from 'express';
import MedicationSchedule from '../models/medicationSchedule';

const router = express.Router();

// Get today's medications for a patient
router.get('/today/:patientId', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const schedules = await MedicationSchedule.find({
      patientId: req.params.patientId,
      date: today
    });
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
});

// Get medication schedule by date range
router.get('/:patientId', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { patientId: req.params.patientId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const schedules = await MedicationSchedule.find(query).sort({ date: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
});

// Mark medication as taken
router.patch('/:scheduleId/take', async (req: Request, res: Response): Promise<void> => {
  try {
    const { time } = req.body;
    
    const schedule = await MedicationSchedule.findById(req.params.scheduleId);
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    const timeSlot = schedule.schedules.find(s => s.time === time);
    if (!timeSlot) {
      res.status(404).json({ message: 'Time slot not found' });
      return;
    }
    
    timeSlot.taken = true;
    timeSlot.takenAt = new Date();
    timeSlot.skipped = false;
    
    // Calculate adherence score
    const totalSlots = schedule.schedules.length;
    const takenSlots = schedule.schedules.filter(s => s.taken).length;
    schedule.adherenceScore = (takenSlots / totalSlots) * 100;
    
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error });
  }
});

// Skip medication
router.patch('/:scheduleId/skip', async (req: Request, res: Response): Promise<void> => {
  try {
    const { time, reason } = req.body;
    
    const schedule = await MedicationSchedule.findById(req.params.scheduleId);
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    const timeSlot = schedule.schedules.find(s => s.time === time);
    if (!timeSlot) {
      res.status(404).json({ message: 'Time slot not found' });
      return;
    }
    
    timeSlot.skipped = true;
    timeSlot.skipReason = reason;
    timeSlot.taken = false;
    
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error });
  }
});

// Create medication schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const schedule = new MedicationSchedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating schedule', error });
  }
});

// Delete medication schedule
router.delete('/:scheduleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const schedule = await MedicationSchedule.findByIdAndDelete(req.params.scheduleId);
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    res.json({ message: 'Schedule deleted successfully', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting schedule', error });
  }
});

// Get all medications for a patient (without date filter)
router.get('/patient/:patientId', async (req: Request, res: Response) => {
  try {
    const schedules = await MedicationSchedule.find({
      patientId: req.params.patientId
    }).sort({ date: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
});

// Update medication schedule
router.put('/:scheduleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const schedule = await MedicationSchedule.findByIdAndUpdate(
      req.params.scheduleId,
      { $set: req.body },
      { new: true }
    );
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error });
  }
});

export default router;
