import express, { Request, Response, NextFunction } from "express";
import Account, { IAccount, Role } from "../models/Account";
import jwt from "jsonwebtoken";
import { generateSecurePatientId, isValidPatientId } from "../utils/patientIdGenerator";
import { patientAccessLimiter } from "../middleware/rateLimiter";
const router = express.Router();

type Patient = {
    id: string;
    name: string;
    age: number;
    gender: string;
    dob: string;
    lastVisit: string;
};

// Auth middleware using the built‑in RequestHandler type.
const authMiddleware: express.RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Unauthorized: No token provided." });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized: Invalid token format." });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        (req as any).accountId = decoded.id; // attach the account id to the request object
        next();
    } catch (err) {
        res.status(401).json({ error: "Unauthorized: Invalid token." });
        return;
    }
};

// ───── ADD PATIENT ─────────────────────────────────────────
router.post("/patients/add", authMiddleware,
    async (req: Request, res: Response) => {
        const { name, age, gender, dob } = req.body;
        const accountId = (req as any).accountId;

        try {
            const account = await Account.findById(accountId);
            if (!account || !account.roles.includes(Role.DOCTOR)) {
                res.status(403).json({ error: "Unauthorized doctor access" });
                return;
            }

            // Generate secure patient ID
            const id = generateSecurePatientId();

            if (!account.doctorProfile.patients) account.doctorProfile.patients = [];
            account.doctorProfile.patients.push({ id, name, age, gender, dob, lastVisit: "Today" });
            await account.save();

            res.status(200).json({ message: "Patient added", patient: { id, name, age, gender, dob, lastVisit: "Today" } });
            return;
        } catch (err) {
            res.status(500).json({ error: "Failed to add patient" });
            return;
        }
    });

// ───── DELETE PATIENT ───────────────────────────────────────
router.delete(
    "/patients/:id",
    authMiddleware,
    (async function (req: Request, res: Response): Promise<void> {
        const accountId = (req as any).accountId;
        const patientId = req.params.id;

        try {
            const account = await Account.findById(accountId);
            if (!account || !account.roles.includes(Role.DOCTOR)) {
                res.status(403).json({ error: "Unauthorized doctor access" });
                return;
            }

            account.doctorProfile.patients = account.doctorProfile.patients.filter(
                (p: Patient) => p.id !== patientId
            );
            await account.save();

            res.status(200).json({ message: "Patient deleted" });
        } catch (err) {
            res.status(500).json({ error: "Failed to delete patient" });
        }
    }) as express.RequestHandler
);

router.get(
    "/patients",
    authMiddleware,
    (async function (req: Request, res: Response): Promise<void> {
        try {
            const accountId = (req as any).accountId;
            const account = await Account.findById(accountId);

            if (!account || !account.roles.includes(Role.DOCTOR)) {
                res.status(403).json({ error: "Unauthorized doctor access" });
                return;
            }

            const patients = account.doctorProfile?.patients || [];
            res.status(200).json({ patients });
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch patients" });
        }
    }) as express.RequestHandler
);

// ───── VALIDATE PATIENT ACCESS ─────────────────────────────────────────
router.get(
    "/patients/:id/validate",
    patientAccessLimiter,
    authMiddleware,
    (async function (req: Request, res: Response): Promise<void> {
        try {
            const accountId = (req as any).accountId;
            const patientId = req.params.id;
            
            // Validate patient ID format
            if (!isValidPatientId(patientId)) {
                res.status(400).json({ error: "Invalid patient ID format" });
                return;
            }

            const account = await Account.findById(accountId);

            if (!account || !account.roles.includes(Role.DOCTOR)) {
                res.status(403).json({ error: "Unauthorized doctor access" });
                return;
            }

            const hasAccess = account.doctorProfile?.patients?.some((p: Patient) => p.id === patientId) || false;
            
            if (!hasAccess) {
                res.status(403).json({ error: "Patient not found or access denied" });
                return;
            }

            const patient = account.doctorProfile.patients.find((p: Patient) => p.id === patientId);
            res.status(200).json({ patient, hasAccess: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to validate patient access" });
        }
    }) as express.RequestHandler
);

// ───── UPDATE PATIENT ─────────────────────────────────────────
router.put(
    "/patients/:id",
    authMiddleware,
    (async function (req: Request, res: Response): Promise<void> {
        try {
            const accountId = (req as any).accountId;
            const patientId = req.params.id;
            const { name, age, gender, dob } = req.body;

            const account = await Account.findById(accountId);

            if (!account || !account.roles.includes(Role.DOCTOR)) {
                res.status(403).json({ error: "Unauthorized doctor access" });
                return;
            }

            // Find the patient and verify ownership
            const patientIndex = account.doctorProfile.patients.findIndex((p: Patient) => p.id === patientId);
            
            if (patientIndex === -1) {
                res.status(404).json({ error: "Patient not found or access denied" });
                return;
            }

            // Update patient data
            account.doctorProfile.patients[patientIndex] = {
                ...account.doctorProfile.patients[patientIndex],
                name: name || account.doctorProfile.patients[patientIndex].name,
                age: age || account.doctorProfile.patients[patientIndex].age,
                gender: gender || account.doctorProfile.patients[patientIndex].gender,
                dob: dob || account.doctorProfile.patients[patientIndex].dob
            };

            await account.save();

            res.status(200).json({ 
                message: "Patient updated successfully", 
                patient: account.doctorProfile.patients[patientIndex] 
            });
        } catch (err) {
            res.status(500).json({ error: "Failed to update patient" });
        }
    }) as express.RequestHandler
);


export default router;
