# 💊🧠 DrugNexusAI: Personalized Drug-Drug Interaction (DDI) Checker  
### 🧬 AI-Powered Drug Interaction Intelligence Platform

![Project Banner](https://img.shields.io/badge/DRUGNEXUSAI-DDI%20Checker-2A9D8F?style=for-the-badge&logo=medchart&logoColor=white)

> Built with ❤️ by Team DDI – CSIT998 Capstone Project @ University of Wollongong (2025)

---

## 🚀 About the Project

👨‍⚕️ **DrugNexusAI** is an intelligent Clinical Decision Support System (CDSS) that leverages advanced AI to help doctors and patients identify **potentially dangerous drug-drug interactions** 💥 by combining:

- 🧠 Advanced deep learning models for precise DDI classification
- 💬 AI-powered natural language chatbot assistant
- 📝 Real-time intelligent analysis of patient history and prescribed medications
- 💾 Secure MongoDB integration for structured medical data management
- 🔐 Role-based secure doctor/patient portals with comprehensive access control

---

## 🖥️ Features

✨ Here’s what makes DrugNexusAI special:

- 🧬 **AI-Powered Interaction Detection** – Get instant, intelligent alerts on harmful drug combinations  
- 🤖 **Interactive AI Chatbot Assistant** – Ask anything about your prescriptions, conditions, or interaction risks  
- 👨‍⚕️ **Doctor Portal** – Comprehensive patient management, consultation history, and safe prescribing tools  
- 🧑‍⚕️ **Patient Portal** – Understand medication risks in plain English, track prescriptions intelligently  
- 📋 **AI Auto Summarization** – Upload your history; we’ll clean, summarize, and analyze it  
- ⚠️ **Smart Alerts Panel** – Know what to avoid, why it matters, and get AI-powered recommendations  
- 🌗 **Professional Interface** – Clean, intuitive design optimized for healthcare workflows

---

## 🧪 Tech Stack

| Frontend ⚛️ | Backend ⚙️ | AI/ML 🧠 | Database 💾 |
|-------------|-------------|----------|-------------|
| React + TypeScript | Express.js & FastAPI | ChemBERTa, DeepSeek, DL DDI models | MongoDB |

---

## 📸 UI Snapshots

yet to upload 

---

## 🔍 System Architecture

Doctor → Portal → Prescription Input
↓
DDI Checker ← Drug & History DB ← Patient Notes
↓
🔔 Risk Alerts + Chatbot Explanation



full architecture diagram yet to upload

---

## 🧠 AI Models & Intelligence

- 🤖 **ChemBERTa** – Advanced transformer model for precise drug interaction severity classification
- 🔬 **Binary DDI Predictor** – SMILES-based molecular interaction prediction with deep learning
- 💬 **Custom LLMs** – GPT-powered chatbot for intelligent, plain-language medical explanations
- 🧹 **AI Deidentifier** – Intelligent removal of sensitive data from patient records
- 🧬 **DrugNexusAI Core** – Proprietary AI engine combining multiple models for comprehensive DDI analysis

---

## 🔐 Authentication & Roles

- 👨‍⚕️ Doctor Role  
- 🧑‍⚕️ Patient Role  
- 🔒 JWT-secured endpoints  
- 💌 Password-protected access  

---

## 🛠️ Setup & Run Locally

```bash
# Clone the repo
git clone https://github.com/Team-DDI-CSIT998/Personalised_DDI_Checker.git
cd Personalised_DDI_Checker

# Install all dependencies
npm run install:all

# Install Python dependencies
cd apps/ml-service && pip install -r requirements.txt
cd ../ddi-service && pip install -r requirements.txt

# Start all services (Option 1: All at once)
npm run dev

# Or start services individually (Option 2)
npm run dev:web      # Frontend (React) - http://localhost:5173
npm run dev:api      # API Gateway (Node.js) - http://localhost:3000  
npm run dev:ml       # ML Service (Python) - http://localhost:8000
npm run dev:ddi      # DDI Service (Python) - http://localhost:9000

# Windows users can also use:
./scripts/dev.ps1
```

🔑 Be sure to configure your .env file with MONGO_URI, OPENROUTER_API_KEY, etc.

## 📁 Project Structure

```
Personalised_DDI_Checker/
├── apps/
│   ├── web/                    # React frontend
│   ├── api-gateway/            # Node.js API gateway
│   ├── ml-service/             # Python ML/AI service
│   └── ddi-service/            # DDI-specific service
├── packages/                   # Shared libraries
├── docs/                       # Documentation & ML models
├── scripts/                    # Build and deployment scripts
└── config/                     # Configuration files
```

📚 References
🧬 DrugBank Database

🔒 HIPAA Guidelines

💡 DrugNexusAI Capstone 2025 Docs

## 🐞 Bugs? Glitches? Quirks?

If you happen to stumble upon a bug, odd behavior, or the occasional AI hiccup... 😅  
Well, let’s just say: **we coded this with caffeine and deadlines.**

> _"Why is this button floating?"_  
> _"Why did the chatbot suddenly start quoting Shakespeare?"_  
> _→ That's probably a feature... maybe._

💬 **Seriously though**, we're aware this project isn't flawless.  
It was built under tight academic deadlines and limited bandwidth – so we appreciate your understanding.  
Feel free to report issues or weirdness [here] (https://github.com/Team-DDI-CSIT998/Personalised_DDI_Checker/issues) and we’ll do our best to patch it up! 🧰


📬 Contact
Have questions or want to collaborate with DrugNexusAI?

📧 Email us: thakurisiddhanth3@gmail.com
🌐 Project Page: Team-DDI-CSIT998 GitHub
🏢 DrugNexusAI Technologies

⭐ Show Your Support
If you liked this project, give it a ⭐ on GitHub!
Your support means a lot to us 💖
