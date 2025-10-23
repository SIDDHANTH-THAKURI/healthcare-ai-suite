// HomePage.tsx - Modern Redesign (Updated)
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaBrain,
  FaBell,
  FaChartLine,
  FaUserMd,
  FaComments,
  FaFileMedical,
  FaCheckCircle,
  FaCogs,
  FaShieldAlt,
} from 'react-icons/fa';
import './HomePage.css';
import { BASE_URL_1 } from '../base';
import { useMobileRedirect } from '../hooks/useMobileRedirect';

const HomePage: React.FC = () => {
  // Redirect mobile users to warning page
  useMobileRedirect();

  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const [interactionResults, setInteractionResults] = useState<
    { pair: string; shortDescription: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  
  // Welcome modal state
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Usage limit state
  const MAX_CHECKS = 10;
  const [checksUsed, setChecksUsed] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Check for mobile device and show welcome on first visit
  useEffect(() => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    setIsMobileDevice(width < 1024 || mobileKeywords.test(userAgent));
    
    // Show welcome modal on first visit
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }

    // Load usage count from localStorage
    const storedChecks = localStorage.getItem('ddi_checks_used');
    if (storedChecks) {
      setChecksUsed(parseInt(storedChecks, 10));
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  // Fetch available medicines from the backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${BASE_URL_1}/api/medicines`);
        setAvailableMedicines(
          response.data.map((drug: { name: string }) => drug.name)
        );
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };
    fetchMedicines();
  }, []);

  // Update suggestions based on input
  useEffect(() => {
    if (input.trim().length >= 3) {
      const filtered = availableMedicines.filter((med) =>
        med.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestion(-1); 
  }, [input, availableMedicines]);

  // Add a medicine to selected list
  const addMedicine = (medicine: string) => {
    if (selectedMedicines.length >= 5) {
      setError("You can only add up to 5 medications at a time.");
      setShowPopup(true);
      return;
    }
    if (
      !selectedMedicines.some(
        (med) => med.toLowerCase() === medicine.toLowerCase()
      )
    ) {
      setSelectedMedicines([...selectedMedicines, medicine]);
      setInput("");
      setSuggestions([]);
      setActiveSuggestion(-1);
    }
  };

  // Remove a selected medicine
  const removeMedicine = (medicine: string) => {
    setSelectedMedicines(
      selectedMedicines.filter((med) => med !== medicine)
    );
  };

  // Handle arrow keys and Enter for suggestions
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev + 1 >= suggestions.length ? 0 : prev + 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
          addMedicine(suggestions[activeSuggestion]);
        }
      }
    }
  };

  // Trigger the API to analyze interactions
  const analyzeInteractions = async () => {
    if (selectedMedicines.length < 2) {
      setError("Please add at least two medications to perform an interaction check.");
      setShowPopup(true);
      return;
    }

    // Check usage limit
    if (checksUsed >= MAX_CHECKS) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL_1}/api/interactions`, {
        medicines: selectedMedicines,
      });
      const interactions = response.data;

      if (interactions.length === 0) {
        setInteractionResults([]);
        setError(null);
        setShowPopup(true);
        // Increment usage count
        const newCount = checksUsed + 1;
        setChecksUsed(newCount);
        localStorage.setItem('ddi_checks_used', newCount.toString());
        return;
      }
      const simplified = await axios.post(
        `${BASE_URL_1}/api/simplify_interactions`,
        { interactions }
      );
      setInteractionResults(simplified.data);
      setError(null);
      setShowPopup(true);
      
      // Increment usage count
      const newCount = checksUsed + 1;
      setChecksUsed(newCount);
      localStorage.setItem('ddi_checks_used', newCount.toString());
    } catch (error) {
      console.error("Error analyzing interactions:", error);
      setError("An error occurred while analyzing interactions. Please try again later.");
      setInteractionResults([]);
      setShowPopup(true);
    } finally{
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "AI-Powered DDI Prediction",
      icon: <FaBrain size={30} />,
      description: "Uses deep learning models trained on DrugBank and molecular fingerprints to predict potential drug-drug interactions."
    },
    {
      title: "Real-Time Clinical Alerts",
      icon: <FaBell size={24} />,
      description: "Instantly flags high-risk interactions or contraindications based on patient history and prescribed medications."
    },
    {
      title: "Context-Aware Risk Stratification",
      icon: <FaChartLine size={40} />,
      description: "Prioritizes alerts based on severity, patient-specific conditions, and drug classes for safer clinical decisions."
    },
    {
      title: "Interactive Medical Chatbot",
      icon: <FaComments size={30} />,
      description: "Allows users to ask natural-language medical questions, with responses tailored to patient history and AI reasoning."
    },
    {
      title: "Doctor & Patient Portals",
      icon: <FaUserMd size={30} />,
      description: "Separate role-based portals with workflows designed for clinicians and patients, ensuring clarity and usability."
    },
    {
      title: "Unified Patient Summary",
      icon: <FaFileMedical size={30} />,
      description: "Summarizes conditions, medications, and allergies into a clear, structured view using LLM-based processing."
    },
    {
      title: "Verified Drug Interaction Sources",
      icon: <FaCheckCircle size={35} />,
      description: "All interaction data is sourced from validated databases like DrugBank and FDA drug labels."
    },
    {
      title: "Custom Trained Models",
      icon: <FaCogs size={30} />,
      description: "Includes ChemBERTa and binary classifiers trained in-house for DDI, and a rule-assisted model for contraindications."
    },
    {
      title: "Privacy-Focused Design",
      icon: <FaShieldAlt size={24} />,
      description: "Patient data is de-identified, encrypted, and processed securely with no third-party sharing."
    }
  ];
  
  return (
    <div className="home-page">
      {isLoading && (
            <div className="fullscreen-loader">
                <div className="loader-content">
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p>Loading... Please wait.</p>
                </div>
            </div>
            )}
      <section className="hero">
        <div className="container">
          <h2>Real-Time Interaction Alerts for Safer Prescriptions</h2>
          <p>
            Our advanced AI swiftly identifies risky drug combinations, ensuring patient safety and empowering informed clinical decisions.
          </p>
          
          <div className="checker-box">
            <div className="checker-header">
              <h3>Drug Interaction Checker</h3>
              <div className="usage-indicator">
                <div className="usage-bar-container">
                  <div 
                    className="usage-bar-fill" 
                    style={{ width: `${(checksUsed / MAX_CHECKS) * 100}%` }}
                  />
                </div>
                <span className="usage-text">
                  {MAX_CHECKS - checksUsed} checks remaining
                </span>
              </div>
            </div>
            
            <div id="selected-medicines">
              {selectedMedicines.map((med) => (
                <span className="medicine-pill" key={med}>
                  {med}
                  <button 
                    className="remove-pill"
                    onClick={() => removeMedicine(med)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="input-container">
              <input
                type="text"
                id="medicine-input"
                placeholder="Enter a drug name..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {suggestions.length > 0 && (
                <div id="suggestion-list">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                      onClick={() => addMedicine(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={analyzeInteractions} 
              className="btn-red"
              disabled={checksUsed >= MAX_CHECKS}
            >
              {checksUsed >= MAX_CHECKS ? 'Limit Reached' : 'Check Interactions →'}
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h3>Why Choose DrugNexusAI?</h3>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <h4>{feature.icon} {feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Interaction Analysis</h3>
            {error ? (
              <p className="error">{error}</p>
            ) : interactionResults.length > 0 ? (
              <ul>
                {interactionResults.map((result, index) => (
                  <li key={index}>
                    <strong>{result.pair}</strong>: {result.shortDescription}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No interactions found between the selected medications.</p>
            )}
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="limit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="limit-icon">🔒</div>
            <h3>Daily Limit Reached</h3>
            <p className="limit-message">
              You've used all {MAX_CHECKS} free drug interaction checks for today. 
              Our AI-powered analysis uses advanced language models to provide accurate results.
            </p>
            <div className="limit-benefits">
              <h4>Want unlimited access?</h4>
              <ul>
                <li>✓ Unlimited drug interaction checks</li>
                <li>✓ Advanced AI medical chatbot</li>
                <li>✓ Patient & doctor portals</li>
                <li>✓ Prescription management</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <div className="limit-actions">
              <Link to="/authentication" className="btn-primary">
                Sign Up for Free
              </Link>
              <button onClick={() => setShowLimitModal(false)} className="btn-secondary">
                Close
              </button>
            </div>
            <p className="limit-note">
              Your limit will reset in 24 hours, or create a free account for more features!
            </p>
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-modal">
            <div className="welcome-modal-content">
              <div className="welcome-header">
                <div className="welcome-icon">
                  {isMobileDevice ? '📱' : '💻'}
                </div>
                <h2>Welcome to DrugNexusAI</h2>
                <p className="welcome-subtitle">AI-Powered Drug Interaction Platform</p>
              </div>

              <div className="welcome-content">
                {isMobileDevice && (
                  <div className="mobile-notice">
                    <div className="notice-icon">⚠️</div>
                    <h3>Desktop Experience Recommended</h3>
                    <p>
                      DrugNexusAI is optimized for desktop browsers. While you can browse on mobile, 
                      some features may have limited functionality or display issues.
                    </p>
                    <p className="notice-recommendation">
                      For the best experience, please access this platform from a desktop or laptop computer.
                    </p>
                  </div>
                )}

                <div className="welcome-features">
                  <h3>What You Can Do:</h3>
                  <div className="feature-list">
                    <div className="feature-item">
                      <i className="fas fa-pills"></i>
                      <span>Check Drug Interactions</span>
                    </div>
                    <div className="feature-item">
                      <i className="fas fa-robot"></i>
                      <span>AI Medical Assistant</span>
                    </div>
                    <div className="feature-item">
                      <i className="fas fa-user-md"></i>
                      <span>Doctor & Patient Portals</span>
                    </div>
                    <div className="feature-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>Secure & Private</span>
                    </div>
                  </div>
                </div>

                {!isMobileDevice && (
                  <div className="desktop-info">
                    <p>
                      <i className="fas fa-check-circle"></i>
                      You're using a desktop browser - perfect for the full experience!
                    </p>
                  </div>
                )}
              </div>

              <div className="welcome-footer">
                <button className="welcome-btn" onClick={handleCloseWelcome}>
                  {isMobileDevice ? 'Continue Anyway' : 'Get Started'}
                  <i className="fas fa-arrow-right"></i>
                </button>
                {isMobileDevice && (
                  <p className="mobile-disclaimer">Some features may not work as expected on mobile devices</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;