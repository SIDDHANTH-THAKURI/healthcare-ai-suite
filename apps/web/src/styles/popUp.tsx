import React from 'react';
import './popup.css';
import './support-modals.css';
import './legal-modals.css';

interface PopupProps {
  visible: boolean;
  onClose: () => void;
}

// ============================================
// ABOUT US POPUP - REDESIGNED
// ============================================
export const AboutUsPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay about-modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-bg-animation"></div>
          <div className="about-logo-container">
            <div className="about-logo-ring">
              <i className="fas fa-clinic-medical"></i>
            </div>
          </div>
          <h1 className="about-title">About DrugNexusAI</h1>
          <p className="about-subtitle">
            Revolutionizing medication safety through intelligent AI solutions
          </p>
        </div>

        {/* Mission Statement */}
        <div className="about-mission">
          <div className="mission-icon">
            <i className="fas fa-bullseye"></i>
          </div>
          <h2>Our Mission</h2>
          <p className="mission-text">
            To revolutionize medication safety by detecting dangerous drug interactions before they harm patients. 
            We combine cutting-edge machine learning with real-world clinical workflows to create an intelligent 
            safety net for healthcare professionals and patients worldwide.
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="about-problem-solution">
          <div className="problem-section">
            <div className="section-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>The Problem</h3>
            </div>
            <div className="problem-stats">
              <div className="stat-card">
                <div className="stat-number">125,000+</div>
                <div className="stat-label">Annual Deaths from ADRs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">2.2M</div>
                <div className="stat-label">Serious Injuries Yearly</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">$100B+</div>
                <div className="stat-label">Healthcare Costs</div>
              </div>
            </div>
            <p>
              Prescription errors and adverse drug interactions cause thousands of preventable hospitalizations 
              and deaths each year. Healthcare professionals juggle complex medication regimens, making it nearly 
              impossible to catch every potential interaction manually.
            </p>
          </div>

          <div className="solution-section">
            <div className="section-header">
              <i className="fas fa-lightbulb"></i>
              <h3>Our Solution</h3>
            </div>
            <div className="solution-features">
              <div className="feature-item">
                <i className="fas fa-brain"></i>
                <span>AI-Powered Detection</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-bolt"></i>
                <span>Real-Time Analysis</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Intelligent Safety Net</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-user-md"></i>
                <span>Clinical Integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="about-journey">
          <h2 className="section-title">
            <i className="fas fa-rocket"></i>
            Our Journey
          </h2>
          <div className="journey-path">
            <div className="journey-step">
              <div className="step-marker academic">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="step-content">
                <h4>Academic Foundation</h4>
                <p>University of Wollongong capstone project exploring AI in healthcare</p>
                <span className="step-year">2023-2024</span>
              </div>
            </div>
            <div className="journey-step">
              <div className="step-marker development">
                <i className="fas fa-code"></i>
              </div>
              <div className="step-content">
                <h4>Platform Development</h4>
                <p>Complete rebuild with modern technologies and production-ready features</p>
                <span className="step-year">2024</span>
              </div>
            </div>
            <div className="journey-step">
              <div className="step-marker future">
                <i className="fas fa-star"></i>
              </div>
              <div className="step-content">
                <h4>Real-World Impact</h4>
                <p>Transforming healthcare with AI-powered medication safety solutions</p>
                <span className="step-year">Present</span>
              </div>
            </div>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="about-differentiators">
          <h2 className="section-title">
            <i className="fas fa-gem"></i>
            What Makes Us Different
          </h2>
          <div className="differentiator-grid">
            <div className="diff-card">
              <div className="diff-icon ai">
                <i className="fas fa-robot"></i>
              </div>
              <h4>Multi-Model AI</h4>
              <p>Fallback system across 9 AI models ensures 99.9% reliability</p>
            </div>
            <div className="diff-card">
              <div className="diff-icon realtime">
                <i className="fas fa-tachometer-alt"></i>
              </div>
              <h4>Real-Time Analysis</h4>
              <p>Instant interaction detection as prescriptions are created</p>
            </div>
            <div className="diff-card">
              <div className="diff-icon design">
                <i className="fas fa-palette"></i>
              </div>
              <h4>Beautiful UX</h4>
              <p>Intuitive design that healthcare professionals actually want to use</p>
            </div>
            <div className="diff-card">
              <div className="diff-icon privacy">
                <i className="fas fa-lock"></i>
              </div>
              <h4>Privacy-First</h4>
              <p>Patient data is encrypted, de-identified, and never shared</p>
            </div>
            <div className="diff-card">
              <div className="diff-icon data">
                <i className="fas fa-database"></i>
              </div>
              <h4>Comprehensive Data</h4>
              <p>Powered by DrugBank's extensive pharmaceutical database</p>
            </div>
            <div className="diff-card">
              <div className="diff-icon assistant">
                <i className="fas fa-comments"></i>
              </div>
              <h4>AI Assistant</h4>
              <p>Natural language chatbot for medical queries and guidance</p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="about-tech">
          <h2 className="section-title">
            <i className="fas fa-cogs"></i>
            Technology Stack
          </h2>
          <div className="tech-showcase">
            <div className="tech-layer frontend">
              <h4>Frontend</h4>
              <div className="tech-badges">
                <span className="tech-badge react">React</span>
                <span className="tech-badge typescript">TypeScript</span>
                <span className="tech-badge css">CSS3</span>
              </div>
            </div>
            <div className="tech-layer backend">
              <h4>Backend</h4>
              <div className="tech-badges">
                <span className="tech-badge node">Node.js</span>
                <span className="tech-badge express">Express</span>
                <span className="tech-badge python">Python</span>
                <span className="tech-badge fastapi">FastAPI</span>
              </div>
            </div>
            <div className="tech-layer ai">
              <h4>AI/ML</h4>
              <div className="tech-badges">
                <span className="tech-badge tensorflow">TensorFlow</span>
                <span className="tech-badge chemberta">ChemBERTa</span>
                <span className="tech-badge openai">OpenRouter</span>
              </div>
            </div>
            <div className="tech-layer database">
              <h4>Database</h4>
              <div className="tech-badges">
                <span className="tech-badge mongodb">MongoDB</span>
                <span className="tech-badge atlas">Atlas</span>
                <span className="tech-badge encryption">Encrypted</span>
              </div>
            </div>
          </div>
          <div className="drugbank-attribution">
            <i className="fas fa-info-circle"></i>
            <p>
              Drug interaction data sourced from the{' '}
              <a href="https://go.drugbank.com/releases/latest#datasets" target="_blank" rel="noopener noreferrer">
                DrugBank Academic Dataset
              </a>{' '}
              under research license.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="about-cta">
          <div className="cta-content">
            <h3>Ready to Transform Healthcare?</h3>
            <p>Join us in making medication safety intelligent, accessible, and reliable for everyone.</p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={onClose}>
                <i className="fas fa-rocket"></i>
                Get Started
              </button>
              <button className="cta-btn secondary" onClick={onClose}>
                <i className="fas fa-envelope"></i>
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TEAM/DEVELOPER POPUP - REDESIGNED
// ============================================
export const TeamPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay developer-modal-overlay" onClick={onClose}>
      <div className="developer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="developer-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="developer-hero">
          <div className="developer-bg-pattern"></div>
          <div className="developer-avatar-container">
            <div className="developer-avatar-ring">
              <div className="developer-avatar-inner">
                <i className="fas fa-code"></i>
              </div>
            </div>
            <div className="developer-status-badge">
              <span className="status-dot"></span>
              Available for Projects
            </div>
          </div>
          <div className="developer-intro">
            <h1 className="developer-name">Siddhanth Thakuri</h1>
            <div className="developer-roles">
              <span className="role-tag primary">Full-Stack Developer</span>
              <span className="role-tag secondary">AI Engineer</span>
              <span className="role-tag accent">Healthcare Tech</span>
            </div>
            <p className="developer-tagline">
              Transforming healthcare through intelligent AI solutions
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="developer-stats">
          <div className="stat-item">
            <div className="stat-number">2+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">9</div>
            <div className="stat-label">AI Models Integrated</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Solo Built</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Uptime Goal</div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="developer-journey">
          <h2 className="section-title">
            <i className="fas fa-rocket"></i>
            The Journey
          </h2>
          <div className="journey-timeline">
            <div className="timeline-item">
              <div className="timeline-marker academic"></div>
              <div className="timeline-content">
                <h3>Academic Foundation</h3>
                <p>Master of Computer Science at University of Wollongong</p>
                <span className="timeline-date">2023-2024</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker project"></div>
              <div className="timeline-content">
                <h3>Capstone Project</h3>
                <p>Led team of 6 students in developing AI-powered drug interaction system</p>
                <span className="timeline-date">2024</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker solo"></div>
              <div className="timeline-content">
                <h3>Solo Development</h3>
                <p>Complete rebuild with modern tech stack and production-ready features</p>
                <span className="timeline-date">2024-Present</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="developer-tech">
          <h2 className="section-title">
            <i className="fas fa-cogs"></i>
            Technology Arsenal
          </h2>
          <div className="tech-grid">
            <div className="tech-category">
              <h3>Frontend</h3>
              <div className="tech-items">
                <span className="tech-badge react">React</span>
                <span className="tech-badge typescript">TypeScript</span>
                <span className="tech-badge css">CSS3</span>
                <span className="tech-badge responsive">Responsive</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>Backend</h3>
              <div className="tech-items">
                <span className="tech-badge node">Node.js</span>
                <span className="tech-badge express">Express</span>
                <span className="tech-badge python">Python</span>
                <span className="tech-badge fastapi">FastAPI</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>AI/ML</h3>
              <div className="tech-items">
                <span className="tech-badge tensorflow">TensorFlow</span>
                <span className="tech-badge chemberta">ChemBERTa</span>
                <span className="tech-badge openai">OpenRouter</span>
                <span className="tech-badge nlp">NLP</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>Database</h3>
              <div className="tech-items">
                <span className="tech-badge mongodb">MongoDB</span>
                <span className="tech-badge atlas">Atlas</span>
                <span className="tech-badge encryption">Encrypted</span>
                <span className="tech-badge cloud">Cloud</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="developer-achievements">
          <h2 className="section-title">
            <i className="fas fa-trophy"></i>
            Key Achievements
          </h2>
          <div className="achievements-grid">
            <div className="achievement-card">
              <div className="achievement-icon ui">
                <i className="fas fa-palette"></i>
              </div>
              <h3>Complete UI/UX Redesign</h3>
              <p>Modern, intuitive interface that healthcare professionals actually want to use</p>
            </div>
            <div className="achievement-card">
              <div className="achievement-icon ai">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Multi-Model AI System</h3>
              <p>Intelligent fallback across 9 AI models ensuring 99.9% response reliability</p>
            </div>
            <div className="achievement-card">
              <div className="achievement-icon security">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Enterprise Security</h3>
              <p>End-to-end encryption, HIPAA-compliant architecture, privacy-first design</p>
            </div>
            <div className="achievement-card">
              <div className="achievement-icon realtime">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Real-Time Features</h3>
              <p>Live medication tracking, instant alerts, and seamless user experience</p>
            </div>
          </div>
        </div>

        {/* Vision & Contact */}
        <div className="developer-vision">
          <div className="vision-content">
            <h2 className="section-title">
              <i className="fas fa-eye"></i>
              Vision & Mission
            </h2>
            <p className="vision-text">
              My mission is to bridge the gap between cutting-edge AI research and practical healthcare applications. 
              DrugNexusAI represents the future of medication safety — where technology serves humanity, 
              making healthcare safer, more accessible, and more intelligent.
            </p>
            <div className="vision-goals">
              <div className="goal-item">
                <i className="fas fa-heart"></i>
                <span>Patient Safety First</span>
              </div>
              <div className="goal-item">
                <i className="fas fa-rocket"></i>
                <span>Innovation Driven</span>
              </div>
              <div className="goal-item">
                <i className="fas fa-users"></i>
                <span>Accessible to All</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="developer-cta">
          <div className="cta-content">
            <h3>Let's Build the Future of Healthcare Together</h3>
            <p>Interested in collaboration, feedback, or just want to connect?</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">
                <i className="fas fa-envelope"></i>
                Get in Touch
              </button>
              <button className="cta-btn secondary">
                <i className="fab fa-github"></i>
                View Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FUTURE PLANS POPUP - REDESIGNED
// ============================================
export const FuturePlanPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay future-modal-overlay" onClick={onClose}>
      <div className="future-modal" onClick={(e) => e.stopPropagation()}>
        <button className="future-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="future-hero">
          <div className="future-bg-stars"></div>
          <div className="future-rocket">
            <i className="fas fa-rocket"></i>
          </div>
          <h1 className="future-title">Future Roadmap</h1>
          <p className="future-subtitle">
            Shaping the future of AI-powered healthcare
          </p>
        </div>

        {/* Vision Statement */}
        <div className="future-vision">
          <div className="vision-icon">
            <i className="fas fa-eye"></i>
          </div>
          <h2>Our Vision</h2>
          <p className="vision-text">
            To create a world where medication errors are eliminated through intelligent AI, 
            where healthcare is personalized and accessible to all, and where technology 
            serves humanity's greatest health challenges.
          </p>
          <div className="vision-principles">
            <div className="principle-item">
              <i className="fas fa-heart"></i>
              <span>Patient Safety</span>
            </div>
            <div className="principle-item">
              <i className="fas fa-tachometer-alt"></i>
              <span>Clinical Efficiency</span>
            </div>
            <div className="principle-item">
              <i className="fas fa-universal-access"></i>
              <span>Accessibility</span>
            </div>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="future-roadmap">
          <h2 className="section-title">
            <i className="fas fa-map-marked-alt"></i>
            Development Roadmap
          </h2>
          
          {/* Short Term */}
          <div className="roadmap-phase short-term">
            <div className="phase-header">
              <div className="phase-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="phase-info">
                <h3>Short-Term Goals</h3>
                <span className="phase-timeline">Next 6 Months</span>
              </div>
            </div>
            <div className="phase-features">
              <div className="feature-card mobile">
                <div className="feature-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h4>Mobile App</h4>
                <p>Native iOS and Android applications for on-the-go access</p>
                <div className="feature-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '25%'}}></div>
                  </div>
                  <span>Planning Phase</span>
                </div>
              </div>
              <div className="feature-card notifications">
                <div className="feature-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <h4>Smart Notifications</h4>
                <p>Push alerts for medication reminders and interaction warnings</p>
                <div className="feature-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '40%'}}></div>
                  </div>
                  <span>In Development</span>
                </div>
              </div>
              <div className="feature-card analytics">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4>Advanced Analytics</h4>
                <p>Detailed reports on medication adherence and health trends</p>
                <div className="feature-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '60%'}}></div>
                  </div>
                  <span>Beta Testing</span>
                </div>
              </div>
              <div className="feature-card multilang">
                <div className="feature-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h4>Multi-Language Support</h4>
                <p>Expand accessibility to non-English speaking users</p>
                <div className="feature-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '15%'}}></div>
                  </div>
                  <span>Research Phase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mid Term */}
          <div className="roadmap-phase mid-term">
            <div className="phase-header">
              <div className="phase-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="phase-info">
                <h3>Mid-Term Vision</h3>
                <span className="phase-timeline">6-12 Months</span>
              </div>
            </div>
            <div className="phase-features">
              <div className="feature-card ai-enhanced">
                <div className="feature-icon">
                  <i className="fas fa-brain"></i>
                </div>
                <h4>Enhanced AI Models</h4>
                <p>Improved accuracy with larger training datasets and advanced algorithms</p>
              </div>
              <div className="feature-card telemedicine">
                <div className="feature-icon">
                  <i className="fas fa-video"></i>
                </div>
                <h4>Telemedicine Integration</h4>
                <p>Video consultations with built-in prescription management</p>
              </div>
              <div className="feature-card pharmacy">
                <div className="feature-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <h4>Pharmacy Network</h4>
                <p>Direct prescription fulfillment and delivery coordination</p>
              </div>
              <div className="feature-card genetic">
                <div className="feature-icon">
                  <i className="fas fa-dna"></i>
                </div>
                <h4>Genetic Profiling</h4>
                <p>Personalized drug recommendations based on pharmacogenomics</p>
              </div>
            </div>
          </div>

          {/* Long Term */}
          <div className="roadmap-phase long-term">
            <div className="phase-header">
              <div className="phase-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="phase-info">
                <h3>Long-Term Ambitions</h3>
                <span className="phase-timeline">1-2 Years</span>
              </div>
            </div>
            <div className="phase-features">
              <div className="feature-card enterprise">
                <div className="feature-icon">
                  <i className="fas fa-hospital"></i>
                </div>
                <h4>Hospital Deployment</h4>
                <p>Enterprise solutions for healthcare facilities worldwide</p>
              </div>
              <div className="feature-card global">
                <div className="feature-icon">
                  <i className="fas fa-globe-americas"></i>
                </div>
                <h4>Global Expansion</h4>
                <p>Localized versions for different healthcare systems</p>
              </div>
              <div className="feature-card research">
                <div className="feature-icon">
                  <i className="fas fa-flask"></i>
                </div>
                <h4>Research Platform</h4>
                <p>Open API for pharmaceutical research and drug development</p>
              </div>
              <div className="feature-card predictive">
                <div className="feature-icon">
                  <i className="fas fa-crystal-ball"></i>
                </div>
                <h4>Predictive Health</h4>
                <p>AI-powered disease risk assessment and prevention strategies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Innovation Focus */}
        <div className="future-innovation">
          <h2 className="section-title">
            <i className="fas fa-lightbulb"></i>
            Innovation Focus Areas
          </h2>
          <div className="innovation-grid">
            <div className="innovation-card">
              <div className="innovation-icon safety">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Patient Safety</h4>
              <p>Zero-tolerance approach to medication errors through intelligent AI detection</p>
            </div>
            <div className="innovation-card">
              <div className="innovation-icon efficiency">
                <i className="fas fa-stopwatch"></i>
              </div>
              <h4>Clinical Efficiency</h4>
              <p>Streamlined workflows that save time and reduce administrative burden</p>
            </div>
            <div className="innovation-card">
              <div className="innovation-icon accessibility">
                <i className="fas fa-hands-helping"></i>
              </div>
              <h4>Universal Access</h4>
              <p>Making advanced healthcare technology available to everyone, everywhere</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="future-cta">
          <div className="cta-content">
            <h3>Be Part of the Future</h3>
            <p>Join us in revolutionizing healthcare through intelligent AI solutions</p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={onClose}>
                <i className="fas fa-rocket"></i>
                Join the Journey
              </button>
              <button className="cta-btn secondary" onClick={onClose}>
                <i className="fas fa-envelope"></i>
                Stay Updated
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// BLOG POPUP - REDESIGNED
// ============================================
export const BlogPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
        <button className="blog-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="blog-hero">
          <div className="blog-bg-pattern"></div>
          <div className="blog-icon-container">
            <div className="blog-icon-ring">
              <i className="fas fa-pen-fancy"></i>
            </div>
          </div>
          <h1 className="blog-title">DrugNexusAI Blog</h1>
          <p className="blog-subtitle">
            Insights, updates, and deep dives into AI-powered healthcare
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="blog-coming-soon">
          <div className="coming-soon-animation">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <h2>Coming Soon!</h2>
          <p className="coming-soon-description">
            We're crafting something special for you. Our blog will be your go-to source for 
            cutting-edge insights in AI healthcare technology.
          </p>
        </div>

        {/* Content Preview */}
        <div className="blog-content-preview">
          <h3 className="section-title">
            <i className="fas fa-newspaper"></i>
            What to Expect
          </h3>
          <div className="content-categories">
            <div className="category-card technical">
              <div className="category-icon">
                <i className="fas fa-code"></i>
              </div>
              <h4>Technical Deep Dives</h4>
              <p>Behind-the-scenes look at our AI models, architecture, and development process</p>
              <div className="category-topics">
                <span className="topic-tag">Machine Learning</span>
                <span className="topic-tag">ChemBERTa</span>
                <span className="topic-tag">Architecture</span>
              </div>
            </div>
            
            <div className="category-card healthcare">
              <div className="category-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h4>Healthcare Insights</h4>
              <p>Latest trends in medication safety, drug interactions, and clinical workflows</p>
              <div className="category-topics">
                <span className="topic-tag">Patient Safety</span>
                <span className="topic-tag">Drug Interactions</span>
                <span className="topic-tag">Clinical Research</span>
              </div>
            </div>
            
            <div className="category-card product">
              <div className="category-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h4>Product Updates</h4>
              <p>New features, improvements, roadmap announcements, and platform evolution</p>
              <div className="category-topics">
                <span className="topic-tag">New Features</span>
                <span className="topic-tag">Roadmap</span>
                <span className="topic-tag">Updates</span>
              </div>
            </div>
            
            <div className="category-card education">
              <div className="category-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h4>Educational Content</h4>
              <p>Understanding AI in healthcare, best practices, and professional guidance</p>
              <div className="category-topics">
                <span className="topic-tag">AI Education</span>
                <span className="topic-tag">Best Practices</span>
                <span className="topic-tag">Tutorials</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Articles Preview */}
        <div className="blog-featured-preview">
          <h3 className="section-title">
            <i className="fas fa-star"></i>
            Upcoming Articles
          </h3>
          <div className="article-previews">
            <div className="article-card">
              <div className="article-image">
                <i className="fas fa-brain"></i>
              </div>
              <div className="article-content">
                <h4>How ChemBERTa Revolutionizes Drug Interaction Detection</h4>
                <p>A deep dive into our custom-trained molecular transformer model...</p>
                <div className="article-meta">
                  <span className="article-category technical">Technical</span>
                  <span className="article-date">Coming Soon</span>
                </div>
              </div>
            </div>
            
            <div className="article-card">
              <div className="article-image">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="article-content">
                <h4>The Hidden Costs of Medication Errors in Healthcare</h4>
                <p>Exploring the $100B+ annual impact and how AI can help...</p>
                <div className="article-meta">
                  <span className="article-category healthcare">Healthcare</span>
                  <span className="article-date">Coming Soon</span>
                </div>
              </div>
            </div>
            
            <div className="article-card">
              <div className="article-image">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="article-content">
                <h4>Building a Mobile-First Healthcare Platform</h4>
                <p>Our journey from web to native mobile applications...</p>
                <div className="article-meta">
                  <span className="article-category product">Product</span>
                  <span className="article-date">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="blog-newsletter">
          <div className="newsletter-content">
            <div className="newsletter-icon">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <h3>Stay in the Loop</h3>
            <p>Be the first to know when we launch our blog and get exclusive insights delivered to your inbox.</p>
            <div className="newsletter-form">
              <div className="form-group">
                <input type="email" placeholder="Enter your email address" className="newsletter-input" />
                <button className="newsletter-btn">
                  <i className="fas fa-bell"></i>
                  Notify Me
                </button>
              </div>
              <p className="newsletter-note">
                <i className="fas fa-lock"></i>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="blog-cta">
          <div className="cta-content">
            <h3>Ready to Dive Deep?</h3>
            <p>Explore our platform while we prepare amazing content for you</p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={onClose}>
                <i className="fas fa-rocket"></i>
                Explore Platform
              </button>
              <button className="cta-btn secondary" onClick={onClose}>
                <i className="fas fa-question-circle"></i>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELP CENTER POPUP - REDESIGNED
// ============================================
export const HelpCenterPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <button className="help-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="help-hero">
          <div className="help-bg-gradient"></div>
          <div className="help-icon-container">
            <div className="help-icon-ring">
              <i className="fas fa-life-ring"></i>
            </div>
          </div>
          <h1 className="help-title">Help Center</h1>
          <p className="help-subtitle">
            Your guide to mastering DrugNexusAI's powerful features
          </p>
        </div>

        {/* Quick Actions */}
        <div className="help-quick-actions">
          <div className="quick-action-card">
            <div className="action-icon getting-started">
              <i className="fas fa-rocket"></i>
            </div>
            <h4>Getting Started</h4>
            <p>New to DrugNexusAI? Start here</p>
          </div>
          <div className="quick-action-card">
            <div className="action-icon features">
              <i className="fas fa-star"></i>
            </div>
            <h4>Key Features</h4>
            <p>Explore what you can do</p>
          </div>
          <div className="quick-action-card">
            <div className="action-icon security">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h4>Privacy & Security</h4>
            <p>Your data is safe with us</p>
          </div>
          <div className="quick-action-card">
            <div className="action-icon support">
              <i className="fas fa-headset"></i>
            </div>
            <h4>Contact Support</h4>
            <p>Get personalized help</p>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="help-getting-started">
          <h2 className="section-title">
            <i className="fas fa-rocket"></i>
            Getting Started
          </h2>
          <div className="user-type-guides">
            <div className="guide-card doctor">
              <div className="guide-header">
                <div className="guide-icon">
                  <i className="fas fa-user-md"></i>
                </div>
                <h3>For Healthcare Professionals</h3>
              </div>
              <div className="guide-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Create Your Professional Profile</h4>
                    <p>Sign up with your medical credentials and complete verification</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Add Patients to Dashboard</h4>
                    <p>Securely manage patient information and medical histories</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Create Smart Prescriptions</h4>
                    <p>Use real-time interaction checking while prescribing medications</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Monitor Patient Adherence</h4>
                    <p>Track medication compliance and health outcomes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="guide-card patient">
              <div className="guide-header">
                <div className="guide-icon">
                  <i className="fas fa-user-injured"></i>
                </div>
                <h3>For Patients</h3>
              </div>
              <div className="guide-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Set Up Your Health Profile</h4>
                    <p>Create account and add your medical information securely</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Track Your Medications</h4>
                    <p>View prescriptions and monitor adherence with streak tracking</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Check Drug Interactions</h4>
                    <p>Use our AI-powered checker for medication safety</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Chat with AI Assistant</h4>
                    <p>Get instant answers to medication questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="help-features">
          <h2 className="section-title">
            <i className="fas fa-star"></i>
            Key Features
          </h2>
          <div className="features-grid">
            <div className="feature-showcase">
              <div className="feature-icon checker">
                <i className="fas fa-pills"></i>
              </div>
              <h4>Drug Interaction Checker</h4>
              <p>Enter multiple medications to instantly check for dangerous combinations using our AI-powered analysis</p>
              <div className="feature-highlight">Real-time Analysis</div>
            </div>
            <div className="feature-showcase">
              <div className="feature-icon chatbot">
                <i className="fas fa-robot"></i>
              </div>
              <h4>AI Medical Assistant</h4>
              <p>Ask questions about medications, side effects, and interactions with our intelligent chatbot</p>
              <div className="feature-highlight">9 AI Models</div>
            </div>
            <div className="feature-showcase">
              <div className="feature-icon prescription">
                <i className="fas fa-prescription-bottle-alt"></i>
              </div>
              <h4>Prescription Management</h4>
              <p>Doctors can create, manage, and monitor patient prescriptions with built-in safety checks</p>
              <div className="feature-highlight">Clinical Integration</div>
            </div>
            <div className="feature-showcase">
              <div className="feature-icon tracking">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4>Adherence Tracking</h4>
              <p>Patients can track medication compliance, build streaks, and monitor health progress</p>
              <div className="feature-highlight">Gamification</div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="help-security">
          <div className="security-content">
            <div className="security-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h2>Privacy & Security</h2>
            <p className="security-description">
              Your health data is our top priority. We implement industry-leading security measures 
              to protect your personal and medical information.
            </p>
            <div className="security-features">
              <div className="security-item">
                <i className="fas fa-lock"></i>
                <span>End-to-End Encryption</span>
              </div>
              <div className="security-item">
                <i className="fas fa-user-secret"></i>
                <span>Data De-identification</span>
              </div>
              <div className="security-item">
                <i className="fas fa-ban"></i>
                <span>No Third-Party Sharing</span>
              </div>
              <div className="security-item">
                <i className="fas fa-certificate"></i>
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="help-contact">
          <div className="contact-content">
            <h2 className="section-title">
              <i className="fas fa-headset"></i>
              Need More Help?
            </h2>
            <p>Our support team is here to help you get the most out of DrugNexusAI</p>
            <div className="contact-options">
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h4>Email Support</h4>
                <p>Get detailed help via email</p>
                <button className="contact-btn">Send Message</button>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h4>Live Chat</h4>
                <p>Chat with our AI assistant</p>
                <button className="contact-btn">Start Chat</button>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="fas fa-book"></i>
                </div>
                <h4>Documentation</h4>
                <p>Browse detailed guides</p>
                <button className="contact-btn">View Docs</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FAQ POPUP - REDESIGNED
// ============================================
export const FAQPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay faq-modal-overlay" onClick={onClose}>
      <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
        <button className="faq-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="faq-hero">
          <div className="faq-bg-bubbles"></div>
          <div className="faq-icon-container">
            <div className="faq-icon-ring">
              <i className="fas fa-question-circle"></i>
            </div>
          </div>
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Find answers to common questions about DrugNexusAI
          </p>
        </div>

        {/* Search Bar */}
        <div className="faq-search">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search for answers..." className="search-input" />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="faq-categories">
          <div className="category-tabs">
            <div className="tab-item active">
              <i className="fas fa-star"></i>
              <span>Popular</span>
            </div>
            <div className="tab-item">
              <i className="fas fa-shield-alt"></i>
              <span>Security</span>
            </div>
            <div className="tab-item">
              <i className="fas fa-cogs"></i>
              <span>Features</span>
            </div>
            <div className="tab-item">
              <i className="fas fa-mobile-alt"></i>
              <span>Technical</span>
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="faq-content">
          <div className="faq-grid">
            <div className="faq-card popular">
              <div className="faq-question">
                <div className="question-icon">
                  <i className="fas fa-user-md"></i>
                </div>
                <h4>Is DrugNexusAI a replacement for my doctor?</h4>
                <div className="expand-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="faq-answer">
                <p>
                  <strong>No, absolutely not.</strong> DrugNexusAI is a clinical decision support tool designed to 
                  <em>assist</em> healthcare professionals and <em>inform</em> patients. It should never replace 
                  professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare 
                  providers for medical decisions.
                </p>
                <div className="answer-highlight">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Always consult your healthcare provider for medical decisions</span>
                </div>
              </div>
            </div>

            <div className="faq-card security">
              <div className="faq-question">
                <div className="question-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h4>Is my medical data secure?</h4>
                <div className="expand-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="faq-answer">
                <p>
                  <strong>Yes, your data is highly secure.</strong> We use industry-standard encryption, 
                  de-identification protocols, and secure storage. Patient data is never shared with third parties.
                </p>
                <div className="security-badges">
                  <span className="security-badge">
                    <i className="fas fa-shield-alt"></i>
                    HIPAA Compliant
                  </span>
                  <span className="security-badge">
                    <i className="fas fa-lock"></i>
                    End-to-End Encrypted
                  </span>
                  <span className="security-badge">
                    <i className="fas fa-user-secret"></i>
                    De-identified Data
                  </span>
                </div>
              </div>
            </div>

            <div className="faq-card accuracy">
              <div className="faq-question">
                <div className="question-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h4>How accurate is the drug interaction detection?</h4>
                <div className="expand-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="faq-answer">
                <p>
                  Our AI models are trained on extensive pharmaceutical databases including DrugBank and FDA drug labels. 
                  While we strive for high accuracy, no automated system is perfect.
                </p>
                <div className="accuracy-stats">
                  <div className="stat-item">
                    <div className="stat-number">9</div>
                    <div className="stat-label">AI Models</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">99.9%</div>
                    <div className="stat-label">Uptime</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Monitoring</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-card mobile">
              <div className="faq-question">
                <div className="question-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h4>Can I use DrugNexusAI on mobile devices?</h4>
                <div className="expand-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="faq-answer">
                <p>
                  The platform is accessible on mobile browsers, though some features are optimized for desktop use. 
                  We're working on dedicated mobile apps for iOS and Android.
                </p>
                <div className="mobile-roadmap">
                  <div className="roadmap-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Mobile Web Access</span>
                  </div>
                  <div className="roadmap-item coming-soon">
                    <i className="fas fa-clock"></i>
                    <span>iOS App (Coming Soon)</span>
                  </div>
                  <div className="roadmap-item coming-soon">
                    <i className="fas fa-clock"></i>
                    <span>Android App (Coming Soon)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-card ai">
              <div className="faq-question">
                <div className="question-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h4>How does the AI chatbot work?</h4>
                <div className="expand-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="faq-answer">
                <p>
                  Our chatbot uses advanced language models with a multi-model fallback system. It tries up to 
                  9 different AI models to ensure reliable responses about medications, interactions, and health information.
                </p>
                <div className="ai-features">
                  <div className="ai-feature">
                    <i className="fas fa-brain"></i>
                    <span>Multi-Model Fallback</span>
                  </div>
                  <div className="ai-feature">
                    <i className="fas fa-language"></i>
                    <span>Natural Language Processing</span>
                  </div>
                  <div className="ai-feature">
                    <i className="fas fa-database"></i>
                    <span>Medical Knowledge Base</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-card pricing">
              <div className="faq-question">
                <div className="question-icon">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <h4>Is DrugNexusAI free to use?</h4>
                <div className="expand-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <div className="faq-answer">
                <p>
                  Currently, DrugNexusAI is available as an academic prototype. Pricing and subscription models 
                  for commercial use are being developed.
                </p>
                <div className="pricing-info">
                  <div className="pricing-tier current">
                    <h5>Academic Prototype</h5>
                    <div className="price">Free</div>
                    <p>Limited features for research and education</p>
                  </div>
                  <div className="pricing-tier future">
                    <h5>Commercial Version</h5>
                    <div className="price">Coming Soon</div>
                    <p>Full features with enterprise support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Still Have Questions */}
        <div className="faq-contact">
          <div className="contact-content">
            <h3>Still have questions?</h3>
            <p>Can't find what you're looking for? Our support team is here to help.</p>
            <div className="contact-actions">
              <button className="contact-btn primary">
                <i className="fas fa-comments"></i>
                Chat with Support
              </button>
              <button className="contact-btn secondary">
                <i className="fas fa-envelope"></i>
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




// ============================================
// TERMS OF SERVICE POPUP - REDESIGNED
// ============================================
export const TermsOfServicePopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <button className="terms-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="terms-hero">
          <div className="terms-bg-pattern"></div>
          <div className="terms-icon-container">
            <div className="terms-icon-ring">
              <i className="fas fa-file-contract"></i>
            </div>
          </div>
          <h1 className="terms-title">Terms of Service</h1>
          <p className="terms-subtitle">
            Understanding your rights and responsibilities
          </p>
          <div className="terms-meta">
            <div className="meta-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Effective: January 1, 2025</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-clock"></i>
              <span>Last Updated: January 1, 2025</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="terms-summary">
          <h2 className="section-title">
            <i className="fas fa-lightbulb"></i>
            Quick Summary
          </h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon medical">
                <i className="fas fa-stethoscope"></i>
              </div>
              <h4>Medical Disclaimer</h4>
              <p>DrugNexusAI is a support tool, not medical advice. Always consult healthcare professionals.</p>
            </div>
            <div className="summary-card">
              <div className="summary-icon data">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Data Protection</h4>
              <p>Your data is encrypted, de-identified, and never shared with third parties.</p>
            </div>
            <div className="summary-card">
              <div className="summary-icon usage">
                <i className="fas fa-user-check"></i>
              </div>
              <h4>Responsible Use</h4>
              <p>Use the platform lawfully and provide accurate information for best results.</p>
            </div>
            <div className="summary-card">
              <div className="summary-icon academic">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h4>Academic Prototype</h4>
              <p>Currently in research phase with ongoing development and improvements.</p>
            </div>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="terms-content">
          <div className="terms-section">
            <div className="section-header">
              <div className="section-number">1</div>
              <h3>Acceptance of Terms</h3>
            </div>
            <div className="section-content">
              <p>
                By accessing or using DrugNexusAI, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the platform.
              </p>
              <div className="important-note">
                <i className="fas fa-exclamation-circle"></i>
                <span>Continued use constitutes acceptance of any updates to these terms</span>
              </div>
            </div>
          </div>

          <div className="terms-section medical-disclaimer">
            <div className="section-header">
              <div className="section-number">3</div>
              <h3>Medical Disclaimer</h3>
              <div className="disclaimer-badge">
                <i className="fas fa-exclamation-triangle"></i>
                <span>Critical Information</span>
              </div>
            </div>
            <div className="section-content">
              <div className="disclaimer-grid">
                <div className="disclaimer-item">
                  <div className="disclaimer-icon">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <h4>Not Medical Advice</h4>
                  <p>DrugNexusAI does not provide medical advice, diagnosis, or treatment recommendations</p>
                </div>
                <div className="disclaimer-item">
                  <div className="disclaimer-icon">
                    <i className="fas fa-hospital"></i>
                  </div>
                  <h4>Professional Consultation Required</h4>
                  <p>Always consult qualified healthcare providers for medical decisions</p>
                </div>
                <div className="disclaimer-item">
                  <div className="disclaimer-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h4>No Guarantee of Accuracy</h4>
                  <p>While we strive for accuracy, outputs are not clinically validated</p>
                </div>
                <div className="disclaimer-item">
                  <div className="disclaimer-icon">
                    <i className="fas fa-ban"></i>
                  </div>
                  <h4>No Liability</h4>
                  <p>We are not responsible for outcomes resulting from use of this platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="terms-agreement">
          <div className="agreement-content">
            <h3>Agreement Acknowledgment</h3>
            <p>By using DrugNexusAI, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
            <div className="agreement-actions">
              <button className="agreement-btn accept" onClick={onClose}>
                <i className="fas fa-check"></i>
                I Understand and Agree
              </button>
              <button className="agreement-btn decline" onClick={onClose}>
                <i className="fas fa-times"></i>
                I Do Not Agree
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PRIVACY POLICY POPUP - REDESIGNED
// ============================================
export const PrivacyPolicyPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay privacy-modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="privacy-close-btn" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
        
        {/* Hero Section */}
        <div className="privacy-hero">
          <div className="privacy-bg-shield"></div>
          <div className="privacy-icon-container">
            <div className="privacy-icon-ring">
              <i className="fas fa-user-shield"></i>
            </div>
          </div>
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">
            Your privacy is our priority - here's how we protect it
          </p>
          <div className="privacy-meta">
            <div className="meta-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Effective: January 1, 2025</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-clock"></i>
              <span>Last Updated: January 1, 2025</span>
            </div>
          </div>
        </div>

        {/* Privacy Principles */}
        <div className="privacy-principles">
          <h2 className="section-title">
            <i className="fas fa-heart"></i>
            Our Privacy Principles
          </h2>
          <div className="principles-grid">
            <div className="principle-card">
              <div className="principle-icon transparency">
                <i className="fas fa-eye"></i>
              </div>
              <h4>Transparency</h4>
              <p>We're clear about what data we collect and how we use it</p>
            </div>
            <div className="principle-card">
              <div className="principle-icon control">
                <i className="fas fa-sliders-h"></i>
              </div>
              <h4>Your Control</h4>
              <p>You decide what information to share and can delete it anytime</p>
            </div>
            <div className="principle-card">
              <div className="principle-icon security">
                <i className="fas fa-lock"></i>
              </div>
              <h4>Security First</h4>
              <p>Industry-leading encryption protects your sensitive health data</p>
            </div>
            <div className="principle-card">
              <div className="principle-icon no-sharing">
                <i className="fas fa-ban"></i>
              </div>
              <h4>No Selling</h4>
              <p>We never sell your data to third parties - your privacy isn't for sale</p>
            </div>
          </div>
        </div>

        {/* Data Collection */}
        <div className="privacy-data-collection">
          <h2 className="section-title">
            <i className="fas fa-database"></i>
            What Information We Collect
          </h2>
          <div className="data-categories">
            <div className="data-category">
              <div className="category-header">
                <div className="category-icon account">
                  <i className="fas fa-user"></i>
                </div>
                <h3>Account Information</h3>
              </div>
              <div className="data-items">
                <div className="data-item">
                  <i className="fas fa-envelope"></i>
                  <span>Email address</span>
                </div>
                <div className="data-item">
                  <i className="fas fa-id-card"></i>
                  <span>Professional credentials (for healthcare providers)</span>
                </div>
                <div className="data-item">
                  <i className="fas fa-user-circle"></i>
                  <span>Profile information</span>
                </div>
              </div>
            </div>

            <div className="data-category">
              <div className="category-header">
                <div className="category-icon health">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <h3>Health Data</h3>
              </div>
              <div className="data-items">
                <div className="data-item">
                  <i className="fas fa-pills"></i>
                  <span>Medication lists (de-identified)</span>
                </div>
                <div className="data-item">
                  <i className="fas fa-notes-medical"></i>
                  <span>Medical conditions</span>
                </div>
                <div className="data-item">
                  <i className="fas fa-allergies"></i>
                  <span>Allergies and reactions</span>
                </div>
              </div>
            </div>

            <div className="data-category">
              <div className="category-header">
                <div className="category-icon usage">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h3>Usage Data</h3>
              </div>
              <div className="data-items">
                <div className="data-item">
                  <i className="fas fa-mouse-pointer"></i>
                  <span>Platform interactions</span>
                </div>
                <div className="data-item">
                  <i className="fas fa-clock"></i>
                  <span>Session duration</span>
                </div>
                <div className="data-item">
                  <i className="fas fa-star"></i>
                  <span>Feature usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How We Use Data */}
        <div className="privacy-data-usage">
          <h2 className="section-title">
            <i className="fas fa-cogs"></i>
            How We Use Your Information
          </h2>
          <div className="usage-purposes">
            <div className="purpose-item">
              <div className="purpose-icon service">
                <i className="fas fa-tools"></i>
              </div>
              <div className="purpose-content">
                <h4>Provide and Improve Services</h4>
                <p>Deliver drug interaction detection, AI assistance, and platform functionality</p>
              </div>
            </div>
            <div className="purpose-item">
              <div className="purpose-icon safety">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="purpose-content">
                <h4>Detect Drug Interactions</h4>
                <p>Analyze medication combinations to identify potential safety concerns</p>
              </div>
            </div>
            <div className="purpose-item">
              <div className="purpose-icon personalization">
                <i className="fas fa-user-cog"></i>
              </div>
              <div className="purpose-content">
                <h4>Personalize Experience</h4>
                <p>Customize features and recommendations based on your healthcare needs</p>
              </div>
            </div>
            <div className="purpose-item">
              <div className="purpose-icon research">
                <i className="fas fa-flask"></i>
              </div>
              <div className="purpose-content">
                <h4>Research and Development</h4>
                <p>Improve AI models and develop new features (using anonymized data)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Measures */}
        <div className="privacy-security">
          <h2 className="section-title">
            <i className="fas fa-shield-alt"></i>
            How We Protect Your Data
          </h2>
          <div className="security-measures">
            <div className="security-measure">
              <div className="measure-icon encryption">
                <i className="fas fa-lock"></i>
              </div>
              <h4>End-to-End Encryption</h4>
              <p>All data is encrypted in transit and at rest using industry-standard protocols</p>
              <div className="security-badge">AES-256</div>
            </div>
            <div className="security-measure">
              <div className="measure-icon anonymization">
                <i className="fas fa-user-secret"></i>
              </div>
              <h4>Data De-identification</h4>
              <p>Personal health information is anonymized before processing or analysis</p>
              <div className="security-badge">HIPAA Compliant</div>
            </div>
            <div className="security-measure">
              <div className="measure-icon access">
                <i className="fas fa-key"></i>
              </div>
              <h4>Access Controls</h4>
              <p>Strict authentication and authorization protocols limit data access</p>
              <div className="security-badge">Multi-Factor Auth</div>
            </div>
            <div className="security-measure">
              <div className="measure-icon monitoring">
                <i className="fas fa-eye-slash"></i>
              </div>
              <h4>Continuous Monitoring</h4>
              <p>24/7 security monitoring and regular vulnerability assessments</p>
              <div className="security-badge">SOC 2</div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="privacy-rights">
          <h2 className="section-title">
            <i className="fas fa-balance-scale"></i>
            Your Privacy Rights
          </h2>
          <div className="rights-grid">
            <div className="right-item">
              <div className="right-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h4>Access Your Data</h4>
              <p>Request a copy of all personal data we have about you</p>
            </div>
            <div className="right-item">
              <div className="right-icon">
                <i className="fas fa-edit"></i>
              </div>
              <h4>Correct Information</h4>
              <p>Update or correct any inaccurate personal information</p>
            </div>
            <div className="right-item">
              <div className="right-icon">
                <i className="fas fa-trash"></i>
              </div>
              <h4>Delete Your Data</h4>
              <p>Request deletion of your account and associated data</p>
            </div>
            <div className="right-item">
              <div className="right-icon">
                <i className="fas fa-download"></i>
              </div>
              <h4>Data Portability</h4>
              <p>Export your data in a machine-readable format</p>
            </div>
            <div className="right-item">
              <div className="right-icon">
                <i className="fas fa-ban"></i>
              </div>
              <h4>Opt-Out</h4>
              <p>Withdraw consent for certain data processing activities</p>
            </div>
            <div className="right-item">
              <div className="right-icon">
                <i className="fas fa-pause"></i>
              </div>
              <h4>Restrict Processing</h4>
              <p>Limit how we process your personal information</p>
            </div>
          </div>
        </div>

        {/* Contact & Updates */}
        <div className="privacy-contact">
          <div className="contact-content">
            <h2 className="section-title">
              <i className="fas fa-envelope"></i>
              Questions About Privacy?
            </h2>
            <p>We're here to help you understand how we protect your privacy and exercise your rights.</p>
            <div className="contact-actions">
              <button className="contact-btn primary">
                <i className="fas fa-shield-alt"></i>
                Privacy Support
              </button>
              <button className="contact-btn secondary">
                <i className="fas fa-download"></i>
                Request My Data
              </button>
            </div>
            <div className="update-notice">
              <i className="fas fa-bell"></i>
              <span>We'll notify you of any significant changes to this Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};