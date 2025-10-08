import React, { useState, useEffect } from 'react';
import './PatientPortal.css';

interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  schedules: Array<{
    time: string;
    taken: boolean;
    takenAt?: Date;
    skipped: boolean;
    skipReason?: string;
  }>;
}

interface PatientProfile {
  _id?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PatientPortal: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchPatientData();
    fetchChatHistory();
  }, []);

  const fetchPatientData = async () => {
    try {
      // Get user ID from localStorage
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';

      // Fetch profile
      const profileResponse = await fetch(`http://localhost:5000/api/patient-profile/${userId}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Fetch medications
      const medsResponse = await fetch(`http://localhost:5000/api/medication-schedule/today/${userId}`);
      if (medsResponse.ok) {
        const medsData = await medsResponse.json();
        setMedications(medsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';
      const response = await fetch(`http://localhost:5000/api/chat/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    setIsSending(true);
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';

      const response = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userId,
          content: chatInput
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.assistantMessage.content,
          timestamp: new Date(data.assistantMessage.timestamp)
        }]);

        // Refresh data if medications or appointments were added
        if (data.intent === 'medication_add' || data.intent === 'appointment_create') {
          fetchPatientData();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).email : 'demo-patient-001';

    const formData = new FormData();
    formData.append('document', file);
    formData.append('patientId', userId);
    formData.append('documentType', 'other');

    try {
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Document "${file.name}" uploaded successfully! ${data.document.aiSummary || 'I\'ve processed and stored it for reference.'}`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const markAsTaken = async (scheduleId: string, time: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/medication-schedule/${scheduleId}/take`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time })
      });

      if (response.ok) {
        fetchPatientData();
      }
    } catch (error) {
      console.error('Error marking medication:', error);
    }
  };

  const skipMedication = async (scheduleId: string, time: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/medication-schedule/${scheduleId}/skip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time, reason: 'User skipped' })
      });

      if (response.ok) {
        fetchPatientData();
      }
    } catch (error) {
      console.error('Error skipping medication:', error);
    }
  };

  const getTimeSlotLabel = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const getMedicationIcon = (index: number) => {
    const icons = ['💊', '💉', '🧪', '💊', '💉'];
    return icons[index % icons.length];
  };

  const getTotalMeds = () => {
    return medications.reduce((total, med) => total + med.schedules.length, 0);
  };

  const getTakenMeds = () => {
    return medications.reduce((total, med) => {
      return total + med.schedules.filter(s => s.taken).length;
    }, 0);
  };

  const getAdherenceScore = () => {
    const total = getTotalMeds();
    if (total === 0) return 100;
    return Math.round((getTakenMeds() / total) * 100);
  };

  const groupMedicationsByTime = () => {
    const grouped: { [key: string]: Array<{ med: Medication; schedule: any }> } = {};

    medications.forEach(med => {
      med.schedules.forEach(schedule => {
        const label = getTimeSlotLabel(schedule.time);
        const key = `${label} - ${schedule.time}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push({ med, schedule });
      });
    });

    return grouped;
  };

  const groupedMeds = groupMedicationsByTime();
  const firstName = profile?.personalInfo?.firstName || 'John';
  const lastName = profile?.personalInfo?.lastName || 'Doe';
  const initials = `${firstName[0]}${lastName[0]}`;

  // Generate patient ID from database ID or email
  const user = localStorage.getItem('user');
  const userEmail = user ? JSON.parse(user).email : '';
  const patientId = profile?._id ? String(profile._id).slice(-6).toUpperCase() : userEmail.split('@')[0].toUpperCase();

  return (
    <div className="stunning-portal">
      {/* Header */}
      <header className="portal-header">
        <div className="logo-section">
          <div className="logo-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <h1 className="logo-text">DrugNexusAI</h1>
        </div>
        <div className="user-profile">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <h3>{firstName} {lastName}</h3>
            <p>Patient ID: {patientId}</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="main-container">
        {/* Hero Welcome Card */}
        <div className="hero-welcome">
          <div className="hero-content">
            <h2 className="greeting">Welcome back, {firstName}! 👋</h2>
            <p className="greeting-subtitle">Your health journey starts here. Let's keep you on track today.</p>
            <div className="hero-stats">
              <div className="stat-box">
                <div className="stat-icon">💊</div>
                <div className="stat-value">{getTotalMeds()}</div>
                <div className="stat-label">Meds Today</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{getTakenMeds()}</div>
                <div className="stat-label">Taken</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{getAdherenceScore()}%</div>
                <div className="stat-label">Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions and Score Container */}
        <div className="actions-score-container">
          {/* Quick Actions - 2x2 Grid */}
          <div className="quick-actions">
            <div className="action-card" style={{ '--delay': '0s' } as React.CSSProperties}>
              <div className="action-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="action-title">Medications</div>
              <div className="action-subtitle">View & manage</div>
            </div>
            <div className="action-card" style={{ '--delay': '0.1s' } as React.CSSProperties}>
              <div className="action-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="action-title">Appointments</div>
              <div className="action-subtitle">Schedule visit</div>
            </div>
            <div className="action-card" style={{ '--delay': '0.2s' } as React.CSSProperties}>
              <div className="action-icon">
                <i className="fas fa-file-medical"></i>
              </div>
              <div className="action-title">Records</div>
              <div className="action-subtitle">View history</div>
            </div>
            <div className="action-card" style={{ '--delay': '0.3s' } as React.CSSProperties}>
              <div className="action-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="action-title">Emergency</div>
              <div className="action-subtitle">Quick contact</div>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="health-score-card">
            <div className="score-circle">
              <div className="score-inner">
                <div className="score-value">{getAdherenceScore()}</div>
                <div className="score-label">Score</div>
              </div>
            </div>
            <div className="score-title">Health Score</div>
          </div>
        </div>

        {/* Medications Card */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-pills"></i>
              Today's Medications
            </h3>
            <a href="#" className="view-all">
              View All <i className="fas fa-arrow-right"></i>
            </a>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading medications...</p>
            </div>
          ) : medications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>All clear!</h3>
              <p>No medications scheduled for today</p>
            </div>
          ) : (
            <div className="med-timeline">
              {Object.entries(groupedMeds).map(([timeSlot, meds], slotIndex) => (
                <div key={timeSlot} className="med-slot">
                  <div className="slot-header">
                    <div className="slot-time">{timeSlot}</div>
                    <div className="slot-badge">{meds.length} {meds.length === 1 ? 'pill' : 'pills'}</div>
                  </div>
                  <div className="pills-grid">
                    {meds.map(({ med, schedule }, medIndex) => (
                      <div key={`${med._id}-${schedule.time}`} className="pill">
                        <div className="pill-icon">{getMedicationIcon(slotIndex * 10 + medIndex)}</div>
                        <div className="pill-info">
                          <div className="pill-name">{med.medicationName}</div>
                          <div className="pill-dose">{med.dosage}</div>
                        </div>
                        {!schedule.taken && !schedule.skipped ? (
                          <div className="pill-actions">
                            <button
                              className="pill-check"
                              onClick={() => markAsTaken(med._id, schedule.time)}
                              title="Mark as taken"
                            >
                              ✓
                            </button>
                            <button
                              className="pill-skip"
                              onClick={() => skipMedication(med._id, schedule.time)}
                              title="Skip"
                            >
                              ×
                            </button>
                          </div>
                        ) : schedule.taken ? (
                          <div className="pill-check checked">✓</div>
                        ) : (
                          <div className="pill-check skipped">×</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Drawer Chat */}
      <div className={`chat-drawer ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-drawer-overlay" onClick={() => setIsChatOpen(false)}></div>
        <div className="chat-drawer-content">
          <div className="chat-header">
            <h3>AI Health Assistant</h3>
            <div className="chat-header-actions">
              <button className="upload-btn" onClick={() => setShowUpload(!showUpload)} title="Upload document">
                <i className="fas fa-paperclip"></i>
              </button>
              <button className="chat-close" onClick={() => setIsChatOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {showUpload && (
            <div className="upload-section">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-label">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Upload medical document</span>
                <small>PDF, DOC, Images accepted</small>
              </label>
            </div>
          )}

          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-message bot">
                <div className="message-avatar bot">🤖</div>
                <div className="message-bubble bot">
                  Hi {firstName}! I'm your AI health assistant. I can help you:
                  <ul>
                    <li>📋 Add medications (e.g., "Doctor prescribed Aspirin 81mg for 1 week")</li>
                    <li>📅 Schedule appointments (e.g., "Appointment with Dr. Smith tomorrow at 3pm")</li>
                    <li>📄 Upload and analyze medical documents</li>
                    <li>❓ Answer health questions</li>
                  </ul>
                  How can I help you today?
                </div>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'user' ? initials : '🤖'}
                </div>
                <div className={`message-bubble ${msg.role}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="chat-message bot">
                <div className="message-avatar bot">🤖</div>
                <div className="message-bubble bot typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isSending}
            />
            <button onClick={sendMessage} disabled={isSending || !chatInput.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button className="chat-fab" onClick={() => setIsChatOpen(!isChatOpen)}>
        <i className="fas fa-robot"></i>
        {chatMessages.length > 0 && <span className="chat-badge">{chatMessages.length}</span>}
      </button>
    </div>
  );
};

export default PatientPortal;
