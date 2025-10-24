# 💊🧠 DrugNexusAI: Personalized Drug-Drug Interaction (DDI) Checker  
### 🧬 AI-Powered Drug Interaction Intelligence Platform

![Project Banner](https://img.shields.io/badge/DRUGNEXUSAI-DDI%20Checker-2A9D8F?style=for-the-badge&logo=medchart&logoColor=white)

> Developed by Siddhanth Thakuri – Extended from CSIT998 Capstone Project @ University of Wollongong (2025)  
> This project represents a significant extension and enhancement of the original capstone work, with extensive additional features, improvements, and production-ready implementations.

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

### 🏠 Home Page
![Home Page](./apps/web/public/Home.png)
*Modern landing page with drug interaction checker and feature showcase*

### 👨‍⚕️ Doctor Portal
![Doctor Portal](./apps/web/public/doctor.png)
*Comprehensive patient management dashboard with real-time DDI alerts*

### 🧑‍⚕️ Patient Portal
![Patient Portal](./apps/web/public/patient.png)
*Intuitive medication tracking with adherence monitoring*

### 🤖 AI Chatbot
![AI Chatbot](./apps/web/public/Chatbot.png)
*Intelligent health assistant powered by multiple AI models*

### 🔬 Models Playground
![Models Playground](./apps/web/public/portals.png)
*Interactive testing environment for AI models and DDI analysis* 

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

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key (get free at https://openrouter.ai)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/SIDDHANTH-THAKURI/healthcare-ai-suite.git
cd Personalised_DDI_Checker

# 2. Install Node.js dependencies
npm run install:all

# 3. Install Python dependencies for ML services
cd apps/ml-service
pip install -r requirements.txt

cd ../ddi-service
pip install -r requirements.txt
cd ../..

# 4. Configure environment variables
# Create .env file in root directory with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# OPENROUTER_API_KEY=your_openrouter_api_key
# DB_NAME=MedPortalDB
# COLLECTION_NAME=drugs

# Also create .env in apps/api-gateway/ with same variables
```

### Running the Application

**Option 1: Start all services at once (Recommended)**
```bash
npm run dev:all
```

**Option 2: Start services individually**
```bash
# Terminal 1 - Frontend (React)
npm run dev:web      # http://localhost:5173

# Terminal 2 - API Gateway (Node.js)
npm run dev:api      # http://localhost:5000

# Terminal 3 - ML Service (Python)
npm run dev:ml       # http://localhost:8000
# Or manually: cd apps/ml-service && python -m uvicorn server:app --reload --port 8000

# Terminal 4 - DDI Service (Python)
npm run dev:ddi      # http://localhost:9000
# Or manually: cd apps/ddi-service && python -m uvicorn server2:app --reload --port 9000
```

**Note for Windows users**: If `npm run dev:ml` or `npm run dev:ddi` fails, use the manual `python -m uvicorn` commands instead. This ensures the correct Python environment is used.

**Option 3: Windows PowerShell script**
```powershell
# Note: scripts/start-dev.ps1 has been removed
# Use npm run dev:all instead
```

### Service Ports
- **Frontend (React)**: http://localhost:5173
- **API Gateway (Node.js)**: http://localhost:5000
- **ML Service (Python)**: http://localhost:8000
- **DDI Service (Python)**: http://localhost:9000

## 📁 Project Structure

```
Personalised_DDI_Checker/
├── apps/
│   ├── web/                    # React + TypeScript frontend (Port 5173)
│   ├── api-gateway/            # Node.js + Express API gateway (Port 5000)
│   ├── ml-service/             # Python FastAPI ML service (Port 8000)
│   └── ddi-service/            # Python FastAPI DDI service (Port 9000)
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utility functions
├── docs/
│   └── ml-models/              # ML model documentation & notebooks
├── scripts/
│   ├── analyze-logs.js         # Log analysis utility
│   ├── build.sh                # Build script for deployment
│   └── render.yaml             # Render.com deployment config
├── config/
│   └── tsconfig.json           # TypeScript configuration
├── .env                        # Environment variables (not in git)
├── package.json                # Root package configuration
└── README.md                   # This file
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
Feel free to report issues or weirdness [here] (https://github.com/SIDDHANTH-THAKURI/healthcare-ai-suite/issues) and we’ll do our best to patch it up! 🧰


## 🌐 Deployment Architecture

DrugNexusAI is deployed across multiple cloud platforms for optimal performance, scalability, and learning purposes:

### Frontend (Vercel)
- **Platform**: Vercel
- **URL**: https://drugnexusai.app/
- **Why Vercel**: 
  - Instant deployments with Git integration
  - Global CDN for fast content delivery
  - Automatic HTTPS and SSL certificates
  - Excellent React/TypeScript support
  - Zero-config deployment

### Backend API Gateway (AWS)
- **Platform**: AWS (Amazon Web Services)
- **Service**: AWS App Runner (Node.js backend)
- **Why AWS App Runner**:
  - Fully managed service — no manual server maintenance
  - Seamless GitHub integration and continuous deployment
  - Scalable compute resources for Node.js APIs
  - Built-in HTTPS, health checks, and auto-scaling
  - Easy integration with MongoDB Atlas and Render microservices
  - Professional-grade reliability and security

### ML/AI Services (Render)
- **Platform**: Render
- **Services**: Python FastAPI microservices
- **Why Render**:
  - Native Python support with automatic dependency management
  - Easy Docker containerization
  - Auto-scaling capabilities
  - Cost-effective for ML workloads
  - Simple deployment from Git

### Database (MongoDB Atlas)
- **Platform**: MongoDB Atlas (Cloud)
- **Why MongoDB Atlas**:
  - Fully managed cloud database
  - Global distribution and replication
  - Automatic backups and recovery
  - Built-in security features
  - Seamless scaling

### Multi-Platform Benefits
This distributed architecture provides:
- **Resilience**: If one service goes down, others continue operating
- **Performance**: Each service optimized for its specific workload
- **Learning**: Hands-on experience with multiple cloud platforms
- **Scalability**: Independent scaling of frontend, backend, and ML services
- **Cost Optimization**: Use free tiers and pay only for what you need


---

## 🆕 Latest Updates & Enhancements

### 🎨 Models Playground (NEW!)
- **Deidentifier Model** – Remove sensitive information from medical text using Stanford AI
- **DDI Binary Classifier** – Predict drug interactions with SMILES-based analysis
- **DL-Based DDI Classifier** – Deep learning classification with ChemBERTa
- **Coming Soon Features** – Condition contradiction checker and DeepSeek integration
- **Beautiful UI** – Modern interface with smooth animations and loading states
- **Smart Dropdowns** – Autocomplete drug search with proper z-index handling

### �‍⚕️ Doctor Portal Features
- **Patient Management** – Add, edit, and manage patient profiles
- **Prescription Creation** – Create prescriptions with DDI checking
- **Medical Document Upload** – Upload and manage patient documents
- **Consultation History** – Track all patient interactions
- **Profile Management** – Update doctor profile and credentials

### 🧑‍⚕️ Patient Portal v2.0
- ✨ **Welcome Modal** – Feature showcase on first visit
- 🎨 **Redesigned Dashboard** – Gradient hero banner with personalized greetings
- 📊 **Adherence Tracking** – 7-day streak system with visual calendar
- 🤖 **AI Chatbot** – Multi-model fallback system with 9+ AI models
- 💊 **Medication Management** – View active/inactive medications
- 📱 **Fully Responsive** – Optimized for all devices

### 🤖 AI Chatbot Improvements
- **Multi-Model Fallback**: DeepSeek, GPT-4, Llama 3.3, Gemini 2.0, Mistral, and more
- **Zero Templates**: 100% AI-generated responses
- **Intent Detection**: Understands medication and appointment requests
- **Context Awareness**: Maintains conversation flow
- **Error Handling**: Graceful degradation with helpful messages

### 🎨 Design Enhancements
- **Modern UI**: Gradient themes and glassmorphism effects
- **Smooth Animations**: Fade-in, slide-up, bounce, and pulse effects
- **Loading States**: Beautiful spinners with triple-ring animation
- **Hover Effects**: Interactive feedback on all elements
- **Coming Soon Overlays**: Elegant placeholders for upcoming features

### 🔧 Technical Improvements
- **TypeScript**: Full type safety across frontend
- **Environment Variables**: Proper `.env` configuration
- **API Integration**: OpenRouter API with automatic model selection
- **Database Optimization**: Efficient MongoDB queries
- **Error Logging**: Comprehensive logging system
- **Code Quality**: Clean, maintainable, documented code

---

## 📖 Key Features Explained

### 🔬 Models Playground
Access advanced AI models for drug interaction analysis:
- **Deidentifier**: Remove PII from medical records using Stanford AI
- **Binary DDI**: Quick yes/no interaction prediction
- **DL DDI**: Detailed interaction classification with confidence scores
- **Drug Search**: Autocomplete search with SMILES molecular structure lookup

### 👨‍⚕️ Doctor Portal
Comprehensive patient management system:
- Create and manage patient profiles
- Prescribe medications with real-time DDI checking
- Upload and organize medical documents
- Track consultation history
- View interaction alerts and recommendations

### 🧑‍⚕️ Patient Portal
Empowering patients with information:
- View current and past medications
- Track medication adherence with streak system
- Chat with AI about medications and health
- Understand drug interactions in plain language
- Access prescription history

---

## 🎯 Quick Start Guide

1. **Install dependencies**: `npm run install:all`
2. **Install Python packages**: 
   ```bash
   cd apps/ml-service && pip install -r req.txt
   cd ../ddi-service && pip install -r requirements.txt
   ```
3. **Configure environment**: Create `.env` files with MongoDB URI, JWT secret, and OpenRouter API key
4. **Start all services**: `npm run dev:all`
5. **Access app**: Open http://localhost:5173
6. **Create account**: Sign up as doctor or patient
7. **Explore features**: 
   - Doctor Portal: Manage patients and prescriptions
   - Patient Portal: View medications and chat with AI
   - Models Playground: Test AI models for DDI detection

---

## 💡 Tips for Best Experience

- **Use Chrome/Edge**: Best browser compatibility
- **Enable JavaScript**: Required for all features
- **Stable Internet**: Needed for AI chatbot
- **OpenRouter Account**: Get free API key at https://openrouter.ai
- **MongoDB Atlas**: Use cloud database for easy setup

---

## 🐞 Known Issues & Future Improvements

This project is continuously evolving! While the core functionality is solid, there are areas for enhancement:

### Current Limitations
- Some features are still in development (marked as "Coming Soon")
- Mobile experience could be further optimized
- Additional AI models are being integrated
- Performance optimizations ongoing

### Reporting Issues
Found a bug or have a suggestion? I'd love to hear from you!  
📝 **Report issues**: [GitHub Issues](https://github.com/SIDDHANTH-THAKURI/healthcare-ai-suite/issues)

### Contributing
Contributions are welcome! Feel free to:
- Fork the repository
- Create a feature branch
- Submit a pull request
- Share your ideas and feedback

---

## 🎓 Academic Context

This project originated as part of the CSIT998 Capstone Project at the University of Wollongong (2025). However, it has been significantly extended beyond the original scope with:

- **Enhanced UI/UX**: Complete redesign with modern aesthetics
- **Additional Features**: Patient portal, chatbot, models playground
- **Production Deployment**: Multi-platform cloud architecture
- **AI Integration**: Multiple LLM models and advanced ML capabilities
- **Security Enhancements**: JWT authentication, role-based access control
- **Performance Optimization**: Caching, lazy loading, code splitting
- **Documentation**: Comprehensive guides and API documentation

The current version represents months of additional development, learning, and refinement beyond the academic requirements.

---

## 📬 Contact

Have questions or want to collaborate with DrugNexusAI?

📧 **Email**: thakurisiddhanth1@gmail.com  
🌐 **GitHub**: https://github.com/SIDDHANTH-THAKURI/
💼 **LinkedIn**: [Connect with me](https://www.linkedin.com/in/siddhanththakuri/)  
🏢 **DrugNexusAI Technologies**

---

⭐ **Show Your Support**  
If you liked this project, give it a ⭐ on GitHub!  
Your support means a lot! 💖

---

**Last Updated**: October 2025  
**Version**: 2.0.0  
**Status**: Active Development 🚀
