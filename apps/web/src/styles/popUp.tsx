import React from 'react';
import './popup.css';

interface PopupProps {
  visible: boolean;
  onClose: () => void;
}

// ============================================
// ABOUT US POPUP
// ============================================
export const AboutUsPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box large-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>About DrugNexusAI</h2>

        <div className="popup-section">
          <h3>🎯 The Mission</h3>
          <p>
            DrugNexusAI is an AI-powered platform designed to revolutionize medication safety by detecting
            dangerous drug interactions before they harm patients. What started as a university capstone
            project has evolved into a comprehensive healthcare solution that combines cutting-edge machine
            learning with real-world clinical workflows.
          </p>
        </div>

        <div className="popup-section">
          <h3>💡 The Problem We're Solving</h3>
          <p>
            Prescription errors and adverse drug interactions cause thousands of preventable hospitalizations
            and deaths each year. Healthcare professionals juggle complex medication regimens, patient histories,
            and constantly evolving drug databases — making it nearly impossible to catch every potential interaction
            manually. DrugNexusAI acts as an intelligent safety net, analyzing patient data in real-time to flag
            dangerous combinations before prescriptions are written.
          </p>
        </div>

        <div className="popup-section">
          <h3>🚀 The Journey</h3>
          <p>
            This project began as a capstone at the University of Wollongong, where a team of six students
            explored the intersection of AI and healthcare. After the academic phase, I took the initiative
            to transform the prototype into a production-ready platform. Through countless iterations, complete
            redesigns, and integration of advanced AI models, DrugNexusAI emerged as a beautiful, functional,
            and genuinely useful tool for healthcare professionals and patients alike.
          </p>
        </div>

        <div className="popup-section">
          <h3>✨ What Makes Us Different</h3>
          <ul className="styled-list">
            <li><b>🤖 Multi-Model AI:</b> Fallback system across 9 AI models ensures reliability</li>
            <li><b>⚡ Real-Time Analysis:</b> Instant interaction detection as prescriptions are created</li>
            <li><b>🎨 Beautiful UX:</b> Intuitive design that healthcare professionals actually want to use</li>
            <li><b>🔒 Privacy-First:</b> Patient data is encrypted, de-identified, and never shared</li>
            <li><b>📊 Comprehensive Data:</b> Powered by DrugBank's extensive pharmaceutical database</li>
            <li><b>💬 AI Assistant:</b> Natural language chatbot for medical queries and guidance</li>
          </ul>
        </div>

        <div className="popup-section">
          <h3>🔧 Technology Stack</h3>
          <div className="popup-tech-grid">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <span>React + TypeScript</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🟢</span>
              <span>Node.js + Express</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🐍</span>
              <span>Python + FastAPI</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🧠</span>
              <span>TensorFlow + ChemBERTa</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🤖</span>
              <span>OpenRouter API</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🍃</span>
              <span>MongoDB</span>
            </div>
          </div>
          <p className="drugbank-note">
            Drug interaction data sourced from the{' '}
            <a
              href="https://go.drugbank.com/releases/latest#datasets"
              target="_blank"
              rel="noopener noreferrer"
            >
              DrugBank Academic Dataset
            </a>{' '}
            under research license.
          </p>
        </div>

        <div className="popup-section">
          <h3>🎓 Academic Foundation</h3>
          <p>
            Originally developed as part of a Master's capstone project at the University of Wollongong,
            DrugNexusAI represents the culmination of research in machine learning, natural language processing,
            and healthcare informatics. The project has since grown beyond its academic roots to become a
            practical tool with real-world applications.
          </p>
        </div>

      </div>
    </div>
  );
};

// ============================================
// TEAM/DEVELOPER POPUP
// ============================================
export const TeamPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>Meet the Developer</h2>

        <div className="popup-section">
          <div className="developer-card">
            <div className="developer-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <h3>Siddhanth Thakuri</h3>
            <p className="developer-title">Full-Stack Developer & AI Engineer</p>
            <p className="developer-education">Master of Computer Science<br />University of Wollongong</p>
          </div>
        </div>

        <div className="popup-section">
          <h3>🚀 The Story</h3>
          <p>
            What started as a group capstone project evolved into a solo mission to create something truly impactful.
            After the academic phase, I took full ownership of DrugNexusAI, rebuilding it from the ground up with
            modern technologies, beautiful design, and real-world functionality. Every line of code, every feature,
            and every pixel has been crafted with the goal of making healthcare safer and more accessible.
          </p>
        </div>

        <div className="popup-section">
          <h3>💻 What I Built</h3>
          <ul className="styled-list">
            <li><b>🎨 Complete UI/UX Redesign:</b> Modern, intuitive interface for doctors and patients</li>
            <li><b>🤖 AI Integration:</b> Multi-model chatbot with intelligent fallback system</li>
            <li><b>🧠 ML Models:</b> Custom-trained drug interaction detection using ChemBERTa</li>
            <li><b>⚡ Real-Time Features:</b> Live medication tracking, streak systems, and alerts</li>
            <li><b>🔒 Security:</b> End-to-end encryption and privacy-first architecture</li>
            <li><b>📱 Responsive Design:</b> Optimized for all devices and screen sizes</li>
          </ul>
        </div>

        <div className="popup-section">
          <h3>🎯 Vision</h3>
          <p>
            My goal is to bridge the gap between cutting-edge AI research and practical healthcare applications.
            DrugNexusAI is just the beginning — I'm committed to continuously improving the platform, adding new
            features, and making it a tool that healthcare professionals genuinely rely on.
          </p>
        </div>

      </div>
    </div>
  );
};

// ============================================
// FUTURE PLANS POPUP
// ============================================
export const FuturePlanPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box large-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>🚀 Future Roadmap</h2>

        <div className="popup-section">
          <h3>🎯 Short-Term Goals (Next 6 Months)</h3>
          <ul className="styled-list">
            <li><b>📱 Mobile App:</b> Native iOS and Android applications for on-the-go access</li>
            <li><b>🔔 Smart Notifications:</b> Push alerts for medication reminders and interaction warnings</li>
            <li><b>📊 Advanced Analytics:</b> Detailed reports on medication adherence and health trends</li>
            <li><b>🌐 Multi-Language Support:</b> Expand accessibility to non-English speaking users</li>
            <li><b>🔗 EHR Integration:</b> Connect with popular Electronic Health Record systems</li>
          </ul>
        </div>

        <div className="popup-section">
          <h3>🌟 Mid-Term Vision (6-12 Months)</h3>
          <ul className="styled-list">
            <li><b>🤖 Enhanced AI Models:</b> Improved accuracy with larger training datasets</li>
            <li><b>👥 Telemedicine Integration:</b> Video consultations with built-in prescription management</li>
            <li><b>💊 Pharmacy Network:</b> Direct prescription fulfillment and delivery coordination</li>
            <li><b>🧬 Genetic Profiling:</b> Personalized drug recommendations based on pharmacogenomics</li>
            <li><b>📈 Clinical Trials:</b> Partner with healthcare institutions for validation studies</li>
          </ul>
        </div>

        <div className="popup-section">
          <h3>🔮 Long-Term Ambitions (1-2 Years)</h3>
          <ul className="styled-list">
            <li><b>🏥 Hospital Deployment:</b> Enterprise solutions for healthcare facilities</li>
            <li><b>🌍 Global Expansion:</b> Localized versions for different healthcare systems worldwide</li>
            <li><b>🔬 Research Platform:</b> Open API for pharmaceutical research and drug development</li>
            <li><b>🎓 Educational Tools:</b> Training modules for medical students and professionals</li>
            <li><b>🤝 Insurance Integration:</b> Streamlined claims and coverage verification</li>
            <li><b>🧠 Predictive Health:</b> AI-powered disease risk assessment and prevention strategies</li>
          </ul>
        </div>

        <div className="popup-section">
          <h3>💡 Innovation Focus</h3>
          <p>
            Our roadmap is driven by three core principles: <b>patient safety</b>, <b>clinical efficiency</b>,
            and <b>accessibility</b>. Every feature we build is designed to make healthcare safer, faster, and
            more inclusive. We're committed to staying at the forefront of AI and healthcare technology while
            maintaining the highest standards of privacy and security.
          </p>
        </div>

      </div>
    </div>
  );
};

// ============================================
// BLOG POPUP
// ============================================
export const BlogPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>📝 Blog</h2>

        <div className="popup-section">
          <div className="coming-soon-content">
            <div className="coming-soon-icon">✍️</div>
            <h3>Coming Soon!</h3>
            <p>
              We're working on launching our blog where we'll share:
            </p>
            <ul className="styled-list">
              <li><b>📚 Technical Deep Dives:</b> Behind-the-scenes look at our AI models and architecture</li>
              <li><b>🏥 Healthcare Insights:</b> Latest trends in medication safety and drug interactions</li>
              <li><b>🚀 Product Updates:</b> New features, improvements, and roadmap announcements</li>
              <li><b>💡 Best Practices:</b> Tips for healthcare professionals using DrugNexusAI</li>
              <li><b>🎓 Educational Content:</b> Understanding AI in healthcare and pharmacology</li>
            </ul>
            <p className="coming-soon-note">
              Stay tuned for regular updates and insights from the DrugNexusAI team!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================
// HELP CENTER POPUP
// ============================================
export const HelpCenterPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box large-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>🆘 Help Center</h2>

        <div className="popup-section">
          <h3>🚀 Getting Started</h3>
          <div className="help-item">
            <h4>For Doctors:</h4>
            <ol className="styled-list">
              <li>Sign up and complete your professional profile</li>
              <li>Add patients to your dashboard</li>
              <li>Create prescriptions with real-time interaction checking</li>
              <li>Monitor patient medication adherence</li>
              <li>Use the AI chatbot for quick drug information</li>
            </ol>
          </div>
          <div className="help-item">
            <h4>For Patients:</h4>
            <ol className="styled-list">
              <li>Create your account and set up your health profile</li>
              <li>View your medications and track adherence</li>
              <li>Check for drug interactions</li>
              <li>Chat with the AI assistant for medication questions</li>
              <li>Monitor your health dashboard and streaks</li>
            </ol>
          </div>
        </div>

        <div className="popup-section">
          <h3>💡 Key Features</h3>
          <ul className="styled-list">
            <li><b>Drug Interaction Checker:</b> Enter multiple medications to check for dangerous combinations</li>
            <li><b>AI Chatbot:</b> Ask questions about medications, side effects, and interactions</li>
            <li><b>Prescription Management:</b> Doctors can create and manage patient prescriptions</li>
            <li><b>Adherence Tracking:</b> Patients can track medication compliance and build streaks</li>
            <li><b>Health Dashboard:</b> Visual overview of medication status and health metrics</li>
          </ul>
        </div>

        <div className="popup-section">
          <h3>🔒 Privacy & Security</h3>
          <p>
            All patient data is encrypted and de-identified. We never share personal information with third parties.
            Your medical data is processed securely and stored with industry-standard encryption.
          </p>
        </div>

        <div className="popup-section">
          <h3>📧 Need More Help?</h3>
          <p>
            If you have questions not covered here, please reach out through the contact information in the footer.
            We're here to help make your experience with DrugNexusAI as smooth as possible!
          </p>
        </div>

      </div>
    </div>
  );
};

// ============================================
// FAQ POPUP
// ============================================
export const FAQPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box large-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>❓ Frequently Asked Questions</h2>

        <div className="popup-section">
          <div className="faq-item">
            <h4>Is DrugNexusAI a replacement for my doctor?</h4>
            <p>
              No. DrugNexusAI is a clinical decision support tool designed to assist healthcare professionals
              and inform patients. It should never replace professional medical advice, diagnosis, or treatment.
              Always consult with qualified healthcare providers for medical decisions.
            </p>
          </div>

          <div className="faq-item">
            <h4>How accurate is the drug interaction detection?</h4>
            <p>
              Our AI models are trained on extensive pharmaceutical databases including DrugBank and FDA drug labels.
              While we strive for high accuracy, no automated system is perfect. All interaction warnings should be
              reviewed by healthcare professionals before making clinical decisions.
            </p>
          </div>

          <div className="faq-item">
            <h4>Is my medical data secure?</h4>
            <p>
              Yes. We use industry-standard encryption, de-identification protocols, and secure storage. Patient data
              is never shared with third parties. We comply with healthcare privacy regulations and best practices.
            </p>
          </div>

          <div className="faq-item">
            <h4>Can I use DrugNexusAI on mobile devices?</h4>
            <p>
              The platform is accessible on mobile browsers, though some features are optimized for desktop use.
              We're working on dedicated mobile apps for iOS and Android to provide a better mobile experience.
            </p>
          </div>

          <div className="faq-item">
            <h4>How does the AI chatbot work?</h4>
            <p>
              Our chatbot uses advanced language models with a multi-model fallback system. It can answer questions
              about medications, interactions, side effects, and general health information. The system tries up to
              9 different AI models to ensure reliable responses.
            </p>
          </div>

          <div className="faq-item">
            <h4>Is DrugNexusAI free to use?</h4>
            <p>
              Currently, DrugNexusAI is available as an academic prototype. Pricing and subscription models for
              commercial use are being developed. Check back for updates on availability and pricing.
            </p>
          </div>

          <div className="faq-item">
            <h4>What makes DrugNexusAI different from other drug checkers?</h4>
            <p>
              We combine multiple AI models, real-time analysis, personalized patient profiles, and a beautiful
              user interface. Our system considers patient-specific factors and provides context-aware recommendations,
              not just generic interaction warnings.
            </p>
          </div>

          <div className="faq-item">
            <h4>Can I integrate DrugNexusAI with my existing EHR system?</h4>
            <p>
              EHR integration is on our roadmap. We're working on APIs and connectors for popular healthcare systems.
              Contact us if you're interested in enterprise integration.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

// ============================================
// TERMS OF SERVICE POPUP
// ============================================
export const TermsOfServicePopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box large-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>📄 Terms of Service</h2>
        <div className="popup-section">
          <p><strong>Effective Date:</strong> January 1, 2025</p>
          <p><strong>Last Updated:</strong> January 1, 2025</p>

          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using DrugNexusAI, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the platform.
          </p>

          <h3>2. Description of Service</h3>
          <p>
            DrugNexusAI is an AI-powered clinical decision support tool designed to assist healthcare
            professionals in identifying potential drug interactions and contraindications. The platform
            is currently an academic prototype developed for research and educational purposes.
          </p>

          <h3>3. Medical Disclaimer</h3>
          <ul className="styled-list">
            <li><b>⚕️ Not Medical Advice:</b> DrugNexusAI does not provide medical advice, diagnosis, or treatment</li>
            <li><b>🏥 Professional Consultation Required:</b> Always consult qualified healthcare providers</li>
            <li><b>📉 No Guarantee of Accuracy:</b> While we strive for accuracy, outputs are not clinically validated</li>
            <li><b>🚫 No Liability:</b> We are not responsible for outcomes resulting from use of this platform</li>
          </ul>

          <h3>4. User Responsibilities</h3>
          <ul className="styled-list">
            <li>Provide accurate information when using the platform</li>
            <li>Use the platform only for lawful purposes</li>
            <li>Maintain confidentiality of your account credentials</li>
            <li>Not attempt to reverse engineer or compromise the system</li>
            <li>Comply with all applicable healthcare regulations</li>
          </ul>

          <h3>5. Data Usage</h3>
          <p>
            We collect and process data as described in our Privacy Policy. By using DrugNexusAI,
            you consent to such processing and warrant that all data provided is accurate.
          </p>

          <h3>6. Third-Party Services</h3>
          <p>
            DrugNexusAI integrates with third-party services including DrugBank, OpenRouter, and other APIs.
            Use of these services is subject to their respective terms and conditions.
          </p>

          <h3>7. Intellectual Property</h3>
          <p>
            All content, features, and functionality of DrugNexusAI are owned by the developer and protected
            by international copyright, trademark, and other intellectual property laws.
          </p>

          <h3>8. Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, DrugNexusAI and its developer shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.
          </p>

          <h3>9. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the platform after changes
            constitutes acceptance of the modified terms.
          </p>

          <h3>10. Contact</h3>
          <p>
            For questions about these Terms of Service, please contact us through the information provided in the footer.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PRIVACY POLICY POPUP
// ============================================
export const PrivacyPolicyPopup: React.FC<PopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box large-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose} aria-label="Close Popup">&times;</button>
        <h2>🔐 Privacy Policy</h2>
        <div className="popup-section">
          <p><strong>Effective Date:</strong> January 1, 2025</p>
          <p><strong>Last Updated:</strong> January 1, 2025</p>

          <h3>1. Information We Collect</h3>
          <p>We collect the following types of information:</p>
          <ul className="styled-list">
            <li><b>Account Information:</b> Name, email, professional credentials (for healthcare providers)</li>
            <li><b>Health Data:</b> Medication lists, medical conditions, allergies (de-identified)</li>
            <li><b>Usage Data:</b> How you interact with the platform, features used, session duration</li>
            <li><b>Technical Data:</b> IP address, browser type, device information</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <ul className="styled-list">
            <li>Provide and improve our services</li>
            <li>Detect and prevent drug interactions</li>
            <li>Personalize your experience</li>
            <li>Conduct research and development</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>

          <h3>3. Data Security</h3>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul className="styled-list">
            <li><b>🔒 Encryption:</b> All data is encrypted in transit and at rest</li>
            <li><b>🙈 De-identification:</b> Personal health information is anonymized</li>
            <li><b>🛡️ Access Controls:</b> Strict authentication and authorization protocols</li>
            <li><b>📊 Regular Audits:</b> Security assessments and vulnerability testing</li>
          </ul>

          <h3>4. Data Sharing</h3>
          <p>
            We do NOT sell or share your personal information with third parties for marketing purposes.
            We may share data only in the following circumstances:
          </p>
          <ul className="styled-list">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>With service providers who assist in platform operations (under strict confidentiality agreements)</li>
            <li>In aggregated, anonymized form for research purposes</li>
          </ul>

          <h3>5. Third-Party Services</h3>
          <p>
            We use third-party services including:
          </p>
          <ul className="styled-list">
            <li><b>DrugBank:</b> Pharmaceutical database (academic license)</li>
            <li><b>OpenRouter:</b> AI model API for chatbot functionality</li>
            <li><b>MongoDB Atlas:</b> Cloud database hosting</li>
          </ul>
          <p>
            These services have their own privacy policies and we encourage you to review them.
          </p>

          <h3>6. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="styled-list">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of certain data processing activities</li>
          </ul>

          <h3>7. Data Retention</h3>
          <p>
            We retain your data only as long as necessary to provide services and comply with legal obligations.
            You can request deletion of your account and associated data at any time.
          </p>

          <h3>8. Children's Privacy</h3>
          <p>
            DrugNexusAI is not intended for use by individuals under 18 years of age. We do not knowingly
            collect personal information from children.
          </p>

          <h3>9. International Users</h3>
          <p>
            If you access DrugNexusAI from outside the country where our servers are located, your data may
            be transferred across borders. By using the platform, you consent to such transfers.
          </p>

          <h3>10. Changes to Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant changes
            via email or platform notification.
          </p>

          <h3>11. Contact Us</h3>
          <p>
            For privacy-related questions or to exercise your rights, please contact us through the information
            provided in the footer.
          </p>
        </div>
      </div>
    </div>
  );
};
