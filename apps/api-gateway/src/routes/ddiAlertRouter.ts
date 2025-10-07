// routes/ddiAlertRouter.ts
import express, { Request, Response } from 'express';
import DDIAlertRecord from '../models/ddiAlert';
import { authMiddleware } from './profileRouter';

const router = express.Router();

// ─── GET DDI ALERTS FOR A PATIENT ─────────────────────────────────
router.get(
    '/:patientId',
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            
            if (!patientId) {
                res.status(400).json({ error: 'patientId is required' });
                return;
            }

            const alertRecord = await DDIAlertRecord.findOne({ patientId });

            if (!alertRecord) {
                res.json({ 
                    activeAlerts: [], 
                    oldAlerts: [], 
                    lastCheckTime: null 
                });
                return;
            }

            res.json({
                activeAlerts: alertRecord.activeAlerts,
                oldAlerts: alertRecord.oldAlerts,
                lastCheckTime: alertRecord.lastCheckTime
            });
        } catch (err) {
            console.error('❌ Error fetching DDI alerts:', err);
            res.status(500).json({ error: 'Failed to fetch DDI alerts.' });
        }
    }
);

// ─── SAVE/UPDATE DDI ALERTS FOR A PATIENT ─────────────────────────────────
router.post(
    '/:patientId',
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            const { activeAlerts, oldAlerts, lastCheckTime } = req.body;

            if (!patientId) {
                res.status(400).json({ error: 'patientId is required' });
                return;
            }

            // Upsert: update if exists, create if doesn't
            const alertRecord = await DDIAlertRecord.findOneAndUpdate(
                { patientId },
                {
                    patientId,
                    activeAlerts: activeAlerts || [],
                    oldAlerts: oldAlerts || [],
                    lastCheckTime: lastCheckTime || new Date().toISOString()
                },
                { 
                    upsert: true, 
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            res.json({
                message: 'DDI alerts saved successfully',
                alertRecord
            });
        } catch (err) {
            console.error('❌ Error saving DDI alerts:', err);
            res.status(500).json({ error: 'Failed to save DDI alerts.' });
        }
    }
);

// ─── DELETE DDI ALERTS FOR A PATIENT ─────────────────────────────────
router.delete(
    '/:patientId',
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;

            if (!patientId) {
                res.status(400).json({ error: 'patientId is required' });
                return;
            }

            await DDIAlertRecord.findOneAndDelete({ patientId });

            res.json({ message: 'DDI alerts deleted successfully' });
        } catch (err) {
            console.error('❌ Error deleting DDI alerts:', err);
            res.status(500).json({ error: 'Failed to delete DDI alerts.' });
        }
    }
);

export default router;
