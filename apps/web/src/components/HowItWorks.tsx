import React, { useState, useEffect } from 'react';
import { 
  FaMedkit, 
  FaArrowDown, 
  FaBrain,
  FaShieldAlt,
  FaUsers,
  FaChartLine,
  FaFileMedical,
  FaRobot,
  FaStethoscope,
  FaUserInjured,
  FaPrescriptionBottleAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClipboardList
} from 'react-icons/fa';
import './HowItWorks.css';

interface Step {
  id: number;
  icon: JSX.Element;
  title: string;
  summary: string;
  details: string[];
  category: 'core' | 'ai' | 'portal';
}

const steps: Step[] = [
  {
    id: 1,
    icon: <FaMedkit size={32} />,
    title: "AI-Powered Drug Interaction Checker",
    summary: "Instantly analyze medication combinations for potential interactions using advanced AI algorithms.",
    category: 'core',
    details: [
      "Enter at least 3 letters of any medication to see intelligent suggestions from our comprehensive drug database.",
      "Select medications from the smart dropdown list with real-time search and filtering capabilities.",
      "Add up to 5 medications simultaneously and click 'Analyze' to receive detailed interaction reports.",
      "Get comprehensive safety assessments with severity levels, clinical significance, and recommended actions.",
      "Access detailed interaction mechanisms, contraindications, and alternative medication suggestions."
    ],
  },
  {
    id: 2,
    icon: <FaBrain size={32} />,
    title: "Intelligent AI Medical Assistant",
    summary: "Chat with our advanced AI assistant for personalized medical guidance and drug interaction insights.",
    category: 'ai',
    details: [
      "Access MedChat, our sophisticated AI assistant trained on extensive medical literature and drug interaction databases.",
      "Upload medical records, lab results, or prescription images for comprehensive analysis and personalized recommendations.",
      "Receive real-time drug interaction warnings during conversations about your medications or health conditions.",
      "Get evidence-based medical information, dosage guidance, and safety recommendations tailored to your specific situation.",
      "Benefit from continuous learning AI that improves recommendations based on the latest medical research and clinical guidelines."
    ],
  },
  {
    id: 3,
    icon: <FaStethoscope size={32} />,
    title: "Comprehensive Doctor Portal",
    summary: "Complete practice management system with AI-powered clinical decision support for healthcare professionals.",
    category: 'portal',
    details: [
      "Access a full-featured dashboard with real-time metrics including active patients, drug interactions detected, and prescriptions reviewed.",
      "Manage patient profiles with comprehensive medical histories, current medications, allergies, and lab results.",
      "Create and manage prescriptions with automatic drug interaction checking against patient's complete medication profile.",
      "Receive instant alerts for high-risk interactions, contraindications, and dosage concerns before finalizing prescriptions.",
      "Track prescription history, monitor patient adherence, and generate detailed clinical reports for better patient outcomes."
    ],
  },
  {
    id: 4,
    icon: <FaUserInjured size={32} />,
    title: "Patient Portal & Health Management",
    summary: "Empowering patients with comprehensive health tracking and medication management tools.",
    category: 'portal',
    details: [
      "Monitor vital signs including blood pressure, heart rate, glucose levels with status indicators and trend analysis.",
      "Track current medications with dosage schedules, refill reminders, and interaction warnings.",
      "Access personalized health tips and recommendations based on your medical profile and current conditions.",
      "View and manage your complete medical history, lab results, and prescription records in one secure location.",
      "Communicate securely with healthcare providers and receive important health alerts and notifications."
    ],
  },
  {
    id: 5,
    icon: <FaShieldAlt size={32} />,
    title: "Advanced Safety & Risk Assessment",
    summary: "Multi-layered safety protocols ensuring the highest standards of medication safety and clinical decision support.",
    category: 'ai',
    details: [
      "Utilize machine learning algorithms trained on millions of drug interaction cases and clinical outcomes.",
      "Receive risk stratification with clear severity levels: minor, moderate, major, and contraindicated interactions.",
      "Access detailed clinical significance assessments including onset time, documentation level, and management strategies.",
      "Get alternative medication suggestions when interactions are detected, considering efficacy and safety profiles.",
      "Benefit from continuous database updates incorporating the latest FDA warnings, clinical studies, and pharmacovigilance data."
    ],
  },
  {
    id: 6,
    icon: <FaChartLine size={32} />,
    title: "Clinical Analytics & Reporting",
    summary: "Comprehensive analytics and reporting tools for healthcare providers to improve patient outcomes and practice efficiency.",
    category: 'portal',
    details: [
      "Generate detailed interaction reports with clinical recommendations and evidence-based management strategies.",
      "Track practice-wide metrics including interaction detection rates, prescription safety scores, and patient outcome indicators.",
      "Access population health analytics to identify trends in drug interactions and medication safety within your patient base.",
      "Export comprehensive reports for regulatory compliance, quality improvement initiatives, and clinical research purposes.",
      "Monitor system performance with real-time dashboards showing interaction detection accuracy and clinical decision support effectiveness."
    ],
  }
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<Step | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'ai' | 'portal'>('all');

  // Scroll to top when How It Works page mounts.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeModal = () => setActiveStep(null);

  const filteredSteps = activeCategory === 'all' 
    ? steps 
    : steps.filter(step => step.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <FaMedkit size={20} />;
      case 'ai': return <FaBrain size={20} />;
      case 'portal': return <FaUsers size={20} />;
      default: return <FaCheckCircle size={20} />;
    }
  };

  return (
    <div className="how-it-works">
      <header className="how-header">
        <div className="hero-content">
          <h1>How DrugNexusAI Works</h1>
          <p className="hero-subtitle">
            Discover the comprehensive AI-powered platform that revolutionizes medication safety and clinical decision support
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <FaBrain className="hero-feature-icon" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="hero-feature">
              <FaShieldAlt className="hero-feature-icon" />
              <span>Advanced Safety Protocols</span>
            </div>
            <div className="hero-feature">
              <FaChartLine className="hero-feature-icon" />
              <span>Clinical Decision Support</span>
            </div>
          </div>
        </div>
      </header>

      <section className="platform-overview">
        <div className="overview-content">
          <h2>Complete Healthcare Technology Platform</h2>
          <p>
            DrugNexusAI combines cutting-edge artificial intelligence with comprehensive clinical databases to provide 
            healthcare professionals and patients with the most advanced drug interaction detection and medication 
            safety platform available today.
          </p>
          <div className="platform-stats">
            <div className="stat-item">
              <FaFileMedical className="stat-icon" />
              <div className="stat-content">
                <h3>Comprehensive Database</h3>
                <p>Extensive medication database with real-time updates</p>
              </div>
            </div>
            <div className="stat-item">
              <FaRobot className="stat-icon" />
              <div className="stat-content">
                <h3>AI-Powered Intelligence</h3>
                <p>Machine learning algorithms trained on clinical data</p>
              </div>
            </div>
            <div className="stat-item">
              <FaExclamationTriangle className="stat-icon" />
              <div className="stat-content">
                <h3>Real-Time Alerts</h3>
                <p>Instant notifications for critical interactions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="category-filters">
        <h2>Explore Features by Category</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <FaCheckCircle size={16} />
            All Features
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'core' ? 'active' : ''}`}
            onClick={() => setActiveCategory('core')}
          >
            <FaMedkit size={16} />
            Core Tools
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ai')}
          >
            <FaBrain size={16} />
            AI Features
          </button>
          <button 
            className={`filter-btn ${activeCategory === 'portal' ? 'active' : ''}`}
            onClick={() => setActiveCategory('portal')}
          >
            <FaUsers size={16} />
            Portal Management
          </button>
        </div>
      </section>

      <section className="steps">
        {filteredSteps.map((step) => (
          <div
            key={step.id}
            className={`step-card category-${step.category}`}
            onClick={() => setActiveStep(step)}
          >
            <div className="step-category-badge">
              {getCategoryIcon(step.category)}
              <span>{step.category.toUpperCase()}</span>
            </div>
            <div className="step-icon">{step.icon}</div>
            <h2>{step.title}</h2>
            <p>{step.summary}</p>
            <button className="view-details">Explore Feature</button>
          </div>
        ))}
      </section>

      <section className="user-journeys">
        <h2>Complete User Journeys</h2>
        <div className="journey-cards">
          <div className="journey-card">
            <div className="journey-header">
              <FaStethoscope className="journey-icon" />
              <h3>Doctor Workflow</h3>
            </div>
            <div className="journey-steps">
              <div className="journey-step">
                <span className="step-number">1</span>
                <p>Access comprehensive doctor portal with patient management dashboard</p>
              </div>
              <div className="journey-step">
                <span className="step-number">2</span>
                <p>Review patient medical history, current medications, and lab results</p>
              </div>
              <div className="journey-step">
                <span className="step-number">3</span>
                <p>Create new prescriptions with real-time interaction checking</p>
              </div>
              <div className="journey-step">
                <span className="step-number">4</span>
                <p>Receive instant alerts for potential interactions and safety concerns</p>
              </div>
              <div className="journey-step">
                <span className="step-number">5</span>
                <p>Generate clinical reports and track patient outcomes</p>
              </div>
            </div>
          </div>
          
          <div className="journey-card">
            <div className="journey-header">
              <FaUserInjured className="journey-icon" />
              <h3>Patient Experience</h3>
            </div>
            <div className="journey-steps">
              <div className="journey-step">
                <span className="step-number">1</span>
                <p>Access patient portal to view personal health dashboard</p>
              </div>
              <div className="journey-step">
                <span className="step-number">2</span>
                <p>Monitor vital signs, medication schedules, and health metrics</p>
              </div>
              <div className="journey-step">
                <span className="step-number">3</span>
                <p>Chat with AI assistant for medication questions and health guidance</p>
              </div>
              <div className="journey-step">
                <span className="step-number">4</span>
                <p>Upload medical documents and receive personalized recommendations</p>
              </div>
              <div className="journey-step">
                <span className="step-number">5</span>
                <p>Receive medication reminders and interaction warnings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-technology">
        <div className="ai-content">
          <h2>Advanced AI Technology</h2>
          <p>
            Our artificial intelligence engine combines multiple machine learning models, natural language processing, 
            and clinical decision support algorithms to provide the most accurate and comprehensive drug interaction 
            analysis available.
          </p>
          <div className="ai-features">
            <div className="ai-feature">
              <FaBrain className="ai-feature-icon" />
              <h4>Machine Learning Models</h4>
              <p>Trained on millions of clinical cases and drug interaction patterns</p>
            </div>
            <div className="ai-feature">
              <FaClipboardList className="ai-feature-icon" />
              <h4>Clinical Decision Support</h4>
              <p>Evidence-based recommendations following clinical guidelines</p>
            </div>
            <div className="ai-feature">
              <FaPrescriptionBottleAlt className="ai-feature-icon" />
              <h4>Pharmacovigilance Integration</h4>
              <p>Real-time updates from FDA warnings and clinical studies</p>
            </div>
          </div>
        </div>
      </section>

      {activeStep && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">{activeStep.icon}</div>
              <div className="modal-title-section">
                <h2>{activeStep.title}</h2>
                <div className="modal-category-badge">
                  {getCategoryIcon(activeStep.category)}
                  <span>{activeStep.category.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="modal-summary">
              <p>{activeStep.summary}</p>
            </div>
            <div className="modal-details">
              <h3>Detailed Features</h3>
              {activeStep.details.map((detail, index) => (
                <div key={index} className="detail-wrapper">
                  <div className="detail-panel">
                    <div className="detail-number">{index + 1}</div>
                    <p>{detail}</p>
                  </div>
                  {index < activeStep.details.length - 1 && (
                    <div className="detail-arrow-wrapper">
                      <FaArrowDown size={20} className="detail-arrow" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="modal-close" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HowItWorks;
