import express, { Request, Response } from 'express';
import Appointment from '../models/appointment';

const router = express.Router();

// Get all appointments for a patient
router.get('/:patientId', async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId
    }).sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
});

// Create new appointment
router.post('/', async (req: Request, res: Response) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error });
  }
});

// Update appointment status
router.patch('/:appointmentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { $set: req.body },
      { new: true }
    );
    
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error });
  }
});

// Delete appointment
router.delete('/:appointmentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.appointmentId);
    
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    
    res.json({ message: 'Appointment deleted successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
});

export default router;
