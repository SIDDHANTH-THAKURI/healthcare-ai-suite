import express, { Request, Response } from 'express';
import PatientProfile from '../models/patientProfile';

const router = express.Router();

// Get patient profile
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.params.userId });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Create patient profile
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = new PatientProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile', error });
  }
});

// Update patient profile
router.put('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

// Complete onboarding
router.patch('/:userId/complete-onboarding', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { onboardingCompleted: true },
      { new: true }
    );
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error completing onboarding', error });
  }
});

export default router;
