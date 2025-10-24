import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Account, { IAccount, Role } from "./models/Account";
import profileRouter from "./routes/profileRouter";
import patientRouter from "./routes/patientRouter";
import prescriptionRouter from './routes/prescriptionRouter';
import logRouter from './routes/logRouter';
import ddiAlertRouter from './routes/ddiAlertRouter';
import patientProfileRouter from './routes/patientProfileRouter';
import medicationScheduleRouter from './routes/medicationScheduleRouter';
import chatRouter from './routes/chatRouter';
import documentRouter from './routes/documentRouter';
import appointmentRouter from './routes/appointmentRouter';
import adherenceRouter from './routes/adherenceRouter';
import apiKeyRouter from './routes/apiKeyRouter';
import { MONGO_URI, COLLECTION_NAME, LLM_MODEL, OPENROUTER_API_KEY, OPENROUTER_URL } from './config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use("/api", profileRouter);
app.use("/api", patientRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api', logRouter);
app.use('/api/ddi-alerts', ddiAlertRouter);
app.use('/api/patient-profile', patientProfileRouter);
app.use('/api/medication-schedule', medicationScheduleRouter);
app.use('/api/chat', chatRouter);
app.use('/api/documents', documentRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/adherence', adherenceRouter);
app.use('/api/api-key', apiKeyRouter);


// Start server first, then connect to MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DB_NAME:', process.env.DB_NAME);
    console.log('- MONGO_URI exists:', !!process.env.MONGO_URI);
});

// Connect to MongoDB with retry logic
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            dbName: process.env.DB_NAME || 'MedPortalDB'
        });
        console.log(`Connected to MongoDB - Database: ${process.env.DB_NAME || 'MedPortalDB'}`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectToMongoDB, 5000);
    }
};

connectToMongoDB();

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// =======================
// API ENDPOINTS
// =======================

// Get Medicines
app.get('/api/medicines', (req: Request, res: Response): void => {
    (async () => {
        try {
            const db = mongoose.connection.db;
            if (!db) throw new Error('MongoDB not ready');
            const drugs = await db
                .collection(COLLECTION_NAME)
                .find({}, { projection: { name: 1, _id: 0 } })
                .toArray();
            res.json(drugs);
        } catch (error: any) {
            console.error('Fetch error:', error.message);
            res.status(500).json({ error: 'Failed to fetch medicines' });
        }
    })();
});

// DDI Check
app.post('/api/interactions', (req: Request, res: Response): void => {
    (async () => {
        try {
            const selectedMedicines: string[] = req.body.medicines;
            if (!Array.isArray(selectedMedicines) || selectedMedicines.length < 2 || selectedMedicines.length > 5) {
                return res.status(400).json({ error: 'Provide 2-5 medicines as an array' });
            }

            const db = mongoose.connection.db;
            if (!db) throw new Error('MongoDB not ready');

            const drugs = await db.collection(COLLECTION_NAME).find({ name: { $in: selectedMedicines } }).toArray();
            const drugMap: Record<string, any[]> = {};
            drugs.forEach((drug) => {
                drugMap[drug.name.toLowerCase()] = drug.interactions || [];
            });

            const interactions: { pair: string; description: string }[] = [];
            for (let i = 0; i < selectedMedicines.length; i++) {
                for (let j = i + 1; j < selectedMedicines.length; j++) {
                    const a = selectedMedicines[i].toLowerCase();
                    const b = selectedMedicines[j].toLowerCase();
                    const aToB = drugMap[a]?.find((d) => d.name.toLowerCase() === b);
                    const bToA = drugMap[b]?.find((d) => d.name.toLowerCase() === a);
                    if (aToB) interactions.push({ pair: `${a} and ${b}`, description: aToB.description });
                    else if (bToA) interactions.push({ pair: `${a} and ${b}`, description: bToA.description });
                }
            }

            res.json(interactions);
        } catch (err: any) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to fetch interactions' });
        }
    })();
});

// Simplify Interactions
app.post('/api/simplify_interactions', (req: Request, res: Response): void => {
    (async () => {
        console.log(req, res);
        const { interactions } = req.body;
        if (!interactions?.length) return res.status(400).json({ error: 'No interactions provided' });

        try {
            const simplified = await Promise.all(
                interactions.map(async ({ pair, description }: { pair: string; description: string }) => {
                    const prompt = `Explain this drug interaction in a short, clear, and understandable way. Keep all important details from the description. Do not add any extra commentary or unrelated information.

Description: "${description}"`;
                    const response = await axios.post(
                        OPENROUTER_URL,
                        {
                            model: LLM_MODEL,
                            messages: [{ role: 'user', content: prompt }],
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                                'Content-Type': 'application/json',
                                'HTTP-Referer': 'http://localhost:5173',
                                'X-Title': 'DrugNexusAI DDI Checker',
                            },
                        }
                    );
                    const shortDescription = (response.data as any).choices?.[0]?.message?.content?.trim() || 'Could not simplify.';
                    return { pair, shortDescription };
                })
            );
            res.json(simplified);
        } catch (err: any) {
            console.error('OpenRouter API error:', err.response?.data || err.message);
            res.status(500).json({ error: 'Failed to simplify interactions' });
        }
    })();
});


// Updated Registration Endpoint for Multi-Role Account
app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
        const { email, password, role, confirmRoleAddition } = req.body;
        // Validate required fields.
        if (!email || !password || !role) {
            res.status(400).json({ error: "Email, password, and role are required." });
            return;
        }

        const existingAccount: IAccount | null = await Account.findOne({ email });

        if (existingAccount) {
            // If the account already includes the requested role, return an error.
            if (existingAccount.roles.includes(role)) {
                res.status(400).json({ error: "User already exists with this role." });
                return;
            } else {
                if (!confirmRoleAddition) {
                    res.status(409).json({
                        error: "Account exists",
                        message:
                            "This email is already registered. Do you want to add the new role to your existing account?",
                        addNewRole: true,
                    });
                    return;
                } else {
                    existingAccount.roles.push(role);
                    await existingAccount.save();
                    const token = jwt.sign(
                        { id: existingAccount._id },
                        process.env.JWT_SECRET as string,
                        { expiresIn: "1h" }
                    );
                    res.json({ token, user: existingAccount });
                    return;
                }
            }
        } else {
            const hashed = await bcrypt.hash(password, 10);
            const newAccount = new Account({
                email,
                password: hashed,
                roles: [role],
            });
            await newAccount.save();
            const token = jwt.sign(
                { id: newAccount._id },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );
            res.json({ token, user: newAccount });
            return;
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to register user" });
        return;
    }
});

// Updated Login Endpoint
app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const account = await Account.findOne({ email });
        if (!account) {
            res.status(400).json({ error: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { id: account._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );
        res.json({ token, user: account });
        return;
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to login" });
        return;
    }
});

app.post("/api/auth/check-email", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        console.log(req.body);
        if (!email) {
            res.status(400).json({ error: "Email is required." });
            return;
        }
        const existingAccount: IAccount | null = await Account.findOne({ email });
        // Respond with a boolean flag indicating if the email exists.
        res.status(200).json({ exists: !!existingAccount });
        return;
    } catch (err: any) {
        console.error("Error checking email:", err.message);
        res.status(500).json({ error: "Error checking email" });
        return;
    }
});


// =======================
// Graceful Shutdown
// =======================
process.on("SIGINT", () => {
    mongoose.connection.close().then(() => {
        console.log("MongoDB connection closed due to app termination");
        process.exit(0);
    });
});