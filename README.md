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


---

## 🆕 Latest Updates & Enhancements

### Patient Portal v2.0 Features
- ✨ **Beautiful Welcome Modal** – Preview mode notification with feature showcase
- 🎨 **Redesigned Dashboard** – Gradient hero banner with personalized greetings
- 📊 **Real Adherence Tracking** – 7-day streak system with visual calendar
- 🤖 **Pure AI Chatbot** – 100% AI-powered responses with 9-model fallback system
- 💊 **Smart Medication Cards** – Clickable dashboard cards with hover effects
- 🏠 **Logo Navigation** – Click DrugNexusAI logo to return to home page
- 📱 **Fully Responsive** – Optimized for desktop, tablet, and mobile devices

### AI Chatbot Improvements
- **Multi-Model Fallback**: Automatically tries 9 different AI models until one works
- **Models Supported**: DeepSeek, GPT-OSS, Llama 3.3, Gemini 2.0, Mistral, and more
- **Zero Templates**: Every response is uniquely generated by AI
- **Intent Detection**: AI analyzes messages to understand medication/appointment requests
- **Context Awareness**: Remembers conversation flow and provides relevant responses
- **Error Handling**: Graceful degradation with helpful error messages

### Design Enhancements
- **Gradient Themes**: Multiple beautiful gradient options for welcome banner
- **Smooth Animations**: Fade-in, slide-up, bounce, and pulse effects
- **Glassmorphism**: Frosted glass effects on cards and modals
- **Hover States**: Interactive feedback on all clickable elements
- **Loading States**: Beautiful spinners and typing indicators
- **Auto-scroll**: Chat automatically scrolls to latest message

### Technical Improvements
- **Environment Configuration**: Proper `.env` setup in `apps/api-gateway/`
- **API Integration**: OpenRouter API with automatic model selection
- **Database Optimization**: Efficient queries for streak and adherence data
- **Error Logging**: Comprehensive logging for debugging
- **Type Safety**: Full TypeScript implementation
- **Code Quality**: Clean, maintainable, and well-documented code

---

## 📖 Additional Documentation

For detailed information about specific features:

- **[Pure AI Chatbot Guide](PURE_AI_CHATBOT.md)** – How the AI chatbot works
- **[Beautiful Chat System](BEAUTIFUL_CHAT_SYSTEM.md)** – Chat UI/UX details
- **[Intro Functionality](INTRO_FUNCTIONALITY_COMPLETE.md)** – Dashboard features
- **[Chatbot Troubleshooting](CHATBOT_TROUBLESHOOTING.md)** – Common issues and fixes

---

## 🎯 Quick Start Guide

1. **Install dependencies**: `npm install`
2. **Configure environment**: Copy `.env.example` to `apps/api-gateway/.env` and fill in values
3. **Start backend**: `cd apps/api-gateway && npm run dev`
4. **Start frontend**: `cd apps/web && npm run dev`
5. **Access app**: Open http://localhost:5173
6. **Login**: Use patient or doctor credentials
7. **Explore**: Check out the patient portal and AI chatbot!

---

## 💡 Tips for Best Experience

- **Use Chrome/Edge**: Best browser compatibility
- **Enable JavaScript**: Required for all features
- **Stable Internet**: Needed for AI chatbot
- **OpenRouter Account**: Get free API key at https://openrouter.ai
- **MongoDB Atlas**: Use cloud database for easy setup

---
