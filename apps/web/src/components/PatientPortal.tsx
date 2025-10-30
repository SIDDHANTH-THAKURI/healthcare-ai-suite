import React, { useState, useEffect } from 'react';
import './PatientPortal.css';
import PatientProfileView from './PatientProfileView';
import MedicationsPage from './MedicationsPage';
import AppointmentsPage from './AppointmentsPage';
import APIKeySettings from './APIKeySettings';
import UpgradeModal from './UpgradeModal';
import { BASE_URL_1 } from '../base';

interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  medicationImage?: string;
  startDate: Date;
  endDate?: Date;
  schedules: Array<{
    time: string;
    timeOfDay?: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [streak, setStreak] = useState(0);
  const [last7Days, setLast7Days] = useState<any[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [chatHeight, setChatHeight] = useState(600);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  
  // BYOK states
  const [showSettings, setShowSettings] = useState(false);
  const [messageLimit, setMessageLimit] = useState({ remaining: 20, limit: 20, hasOwnKey: false });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showComingSoon) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showComingSoon]);

  useEffect(() => {
    fetchPatientData();
    fetchChatHistory();
    fetchStreakData();
    fetchMessageLimitStatus();
    
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenPatientPortalWelcome');
    if (hasSeenWelcome) {
      setShowWelcomeModal(false);
    }
  }, []);

  const fetchMessageLimitStatus = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      
      const userData = JSON.parse(user);
      const userId = userData._id || userData.id;
      
      const response = await fetch(`${BASE_URL_1}/api/api-key/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessageLimit({
          remaining: data.remaining,
          limit: data.dailyLimit,
          hasOwnKey: data.hasApiKey
        });
      }
    } catch (error) {
      console.error('Error fetching message limit:', error);
    }
  };

  // Handle chat height resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingHeight) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 300 && newHeight <= window.innerHeight - 100) {
          setChatHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
    };

    if (isResizingHeight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingHeight]);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenPatientPortalWelcome', 'true');
  };

  const fetchPatientData = async () => {
    try {
      // Get user ID from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        console.error('No user found in localStorage');
        return;
      }
      const userData = JSON.parse(user);
      const userId = userData.email;
      
      if (!userId) {
        console.error('No email found for user');
        return;
      }

      // Fetch profile
      const profileResponse = await fetch(`${BASE_URL_1}/api/patient-profile/${userId}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      } else {
        console.error('Failed to fetch profile:', profileResponse.status);
      }

      // Fetch medications
      const medsResponse = await fetch(`${BASE_URL_1}/api/medication-schedule/today/${userId}`);
      if (medsResponse.ok) {
        const medsData = await medsResponse.json();
        setMedications(medsData);
      } else {
        console.error('Failed to fetch medications:', medsResponse.status);
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
      if (!user) return;
      const userData = JSON.parse(user);
      const userId = userData.email;
      if (!userId) return;
      
      const response = await fetch(`${BASE_URL_1}/api/chat/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchStreakData = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      const userData = JSON.parse(user);
      const userId = userData.email;
      if (!userId) return;
      const response = await fetch(`${BASE_URL_1}/api/adherence/streak/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak);
        setLast7Days(data.last7Days || []);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
      // Fallback to default values
      setStreak(0);
      setLast7Days([]);
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
    const messageToSend = chatInput;
    setChatInput('');

    // Auto-scroll to bottom
    setTimeout(() => {
      const container = document.getElementById('chat-messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);

    try {
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      
      // Ensure we have valid user data - don't use shared demo IDs
      if (!userData || !userData.email) {
        throw new Error('User not authenticated. Please log in again.');
      }
      
      const userId = userData._id || userData.id;
      const patientId = userId; // Use userId as patientId (same as standalone chatbot)

      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${BASE_URL_1}/api/chat/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: patientId,
          content: messageToSend,
          userId: userId  // Add userId for BYOK
        })
      });


      // Handle limit exceeded
      if (response.status === 429) {
        const errorData = await response.json();
        setShowUpgradeModal(true);
        setMessageLimit({
          remaining: 0,
          limit: errorData.limit || 20,
          hasOwnKey: false
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.assistantMessage.content,
          timestamp: new Date(data.assistantMessage.timestamp)
        }]);

        // Update message limit
        if (data.remaining !== undefined) {
          setMessageLimit({
            remaining: data.remaining,
            limit: data.limit || 20,
            hasOwnKey: data.hasOwnKey || false
          });
        }

        // Auto-scroll to bottom
        setTimeout(() => {
          const container = document.getElementById('chat-messages-container');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);

        // Refresh data if medications or appointments were added
        if (data.intent === 'medication_add' || data.intent === 'appointment_create') {
          fetchPatientData();
          fetchStreakData();
        }
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Your session may have expired. Please log out and log in again.');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Chat API error:', errorData);
        throw new Error(errorData.details || errorData.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        response: error.response?.data
      });
      
      let errorMessage = '❌ Sorry, I encountered an error.\n\n';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage += `🔌 **Connection Error**\nCannot connect to the server at ${BASE_URL_1}\n\nPlease check:\n• Is the backend server running?\n• Is the URL correct in your .env file?`;
      } else if (error.message?.includes('User not authenticated')) {
        errorMessage += `🔐 **Authentication Error**\nYour session has expired. Please log out and log in again.`;
      } else if (error.message?.includes('All') && error.message?.includes('models failed')) {
        errorMessage += `🤖 **AI Service Unavailable**\nAll AI models are currently unavailable.\n\nThis might be due to:\n• OpenRouter API privacy settings\n• Service outage\n• API key issues\n\nPlease visit https://openrouter.ai/settings/privacy to configure your account.`;
      } else if (error.message?.includes('OpenRouter') || error.message?.includes('API')) {
        errorMessage += `⚙️ **API Configuration Error**\nThere was an issue with the AI service.\n\nPlease check your API configuration in the backend.`;
      } else if (error.message?.includes('Database') || error.message?.includes('MongoDB')) {
        errorMessage += `💾 **Database Error**\nThere was an issue connecting to the database.\n\nPlease check if MongoDB is running.`;
      } else {
        errorMessage += `📝 **Error Details**\n${error.message || 'Unknown error occurred'}\n\nPlease try again or contact support if the issue persists.`;
      }
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const container = document.getElementById('chat-messages-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload PDF, DOC, DOCX, TXT, or image files only');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).email : 'demo-patient-001';

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('patientId', userId);
    formData.append('documentType', 'medical_history');

    try {
      const response = await fetch(`${BASE_URL_1}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `📄 Document "${selectedFile.name}" uploaded and processed successfully!\n\n${data.document.aiSummary || 'I\'ve extracted and stored the medical information for reference in our conversations.'}`,
          timestamp: new Date()
        }]);
        
        // Clear selection
        setSelectedFile(null);
        setShowUpload(false);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          const container = document.getElementById('chat-messages-container');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload error response:', errorData);
        alert(`Upload failed: ${errorData.message || errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload document: ${error.message || 'Please check if the backend is running.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualTextSubmit = async () => {
    if (!manualText.trim()) return;

    setIsUploading(true);
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).email : 'demo-patient-001';

    try {
      const response = await fetch(`${BASE_URL_1}/api/documents/upload-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userId,
          text: manualText,
          documentType: 'medical_history'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `📝 Medical history text processed successfully!\n\n${data.document?.aiSummary || 'I\'ve stored your medical information for reference in our conversations.'}`,
          timestamp: new Date()
        }]);
        
        // Clear input
        setManualText('');
        setShowManualInput(false);
        setShowUpload(false);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          const container = document.getElementById('chat-messages-container');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Text processing error response:', errorData);
        alert(`Processing failed: ${errorData.message || errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error processing text:', error);
      alert(`Failed to process text: ${error.message || 'Please check if the backend is running.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelFileSelection = () => {
    setSelectedFile(null);
    setManualText('');
    setShowManualInput(false);
  };

  const markAsTaken = async (scheduleId: string, time: string) => {
    try {
      const response = await fetch(`${BASE_URL_1}/api/medication-schedule/${scheduleId}/take`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time })
      });

      if (response.ok) {
        fetchPatientData();
        fetchStreakData(); // Refresh streak when medication is taken
      }
    } catch (error) {
      console.error('Error marking medication:', error);
    }
  };

  const skipMedication = async (scheduleId: string, time: string) => {
    try {
      const response = await fetch(`${BASE_URL_1}/api/medication-schedule/${scheduleId}/skip`, {
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
    // Count unique active medications for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return medications.filter(med => {
      const startDate = new Date(med.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      if (endDate) endDate.setHours(0, 0, 0, 0);
      
      return startDate <= today && (!endDate || endDate >= today);
    }).length;
  };

  const getTakenMeds = () => {
    // Count medications taken today
    const today = new Date().toDateString();
    
    return medications.reduce((count, med) => {
      return count + med.schedules.filter(s => {
        if (!s.taken || !s.takenAt) return false;
        const takenDate = new Date(s.takenAt).toDateString();
        return takenDate === today;
      }).length;
    }, 0);
  };

  const getAdherenceScore = () => {
    const total = getTotalMeds();
    if (total === 0) return 100;
    const taken = getTakenMeds();
    return Math.round((taken / total) * 100);
  };

  const groupMedicationsByTime = () => {
    const grouped: { [key: string]: Array<{ med: Medication; schedule: any }> } = {};
    const timeOrder = ['Morning', 'Afternoon', 'Evening', 'Night'];

    medications.forEach(med => {
      med.schedules.forEach(schedule => {
        const label = schedule.timeOfDay || getTimeSlotLabel(schedule.time);
        if (!grouped[label]) {
          grouped[label] = [];
        }
        grouped[label].push({ med, schedule });
      });
    });

    // Sort by time order
    const sortedGrouped: { [key: string]: Array<{ med: Medication; schedule: any }> } = {};
    timeOrder.forEach(time => {
      if (grouped[time]) {
        sortedGrouped[time] = grouped[time];
      }
    });

    return sortedGrouped;
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
        <div className="logo-section" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <h1 className="logo-text">DrugNexusAI</h1>
        </div>
        <div className="user-profile" onClick={() => setShowProfile(true)}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <h3>{firstName} {lastName}</h3>
            <p>Patient ID: {patientId}</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="main-container">
        {/* Beautiful Intro Welcome Section */}
        <div className="intro-welcome-section">
          {/* Personalized Greeting Banner */}
          <div className="welcome-banner">
            <div className="welcome-banner-content">
              <div className="welcome-text">
                <div className="time-greeting">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return '🌅 Good Morning';
                    if (hour < 17) return '☀️ Good Afternoon';
                    if (hour < 21) return '🌆 Good Evening';
                    return '🌙 Good Night';
                  })()}
                </div>
                <h1 className="welcome-title">Welcome back, {firstName}!</h1>
                <p className="welcome-message">
                  {(() => {
                    const hour = new Date().getHours();
                    const totalMeds = getTotalMeds();
                    const takenMeds = getTakenMeds();
                    
                    if (totalMeds === 0) {
                      return "You're all set for today. No medications scheduled.";
                    }
                    if (takenMeds === totalMeds) {
                      return "Amazing! You've taken all your medications today. Keep up the great work! 🎉";
                    }
                    if (takenMeds > 0) {
                      return `You're doing great! ${totalMeds - takenMeds} more ${totalMeds - takenMeds === 1 ? 'medication' : 'medications'} to go today.`;
                    }
                    if (hour < 12) {
                      return "Ready to start your day? Let's stay on track with your medications.";
                    }
                    return "Your health journey continues. Let's keep you on track today.";
                  })()}
                </p>
              </div>
              <div className="welcome-illustration">
                <div className="floating-emoji">💊</div>
                <div className="floating-emoji delay-1">❤️</div>
                <div className="floating-emoji delay-2">✨</div>
              </div>
            </div>
          </div>

          {/* Health Dashboard Summary */}
          <div className="health-dashboard-summary">
            <div className="dashboard-card adherence-card" onClick={() => { setComingSoonFeature('Adherence Details'); setShowComingSoon(true); }}>
              <div className="card-icon-wrapper">
                <div className="card-icon">📊</div>
              </div>
              <div className="card-content">
                <div className="card-value">{getAdherenceScore()}%</div>
                <div className="card-label">Adherence Score</div>
                <div className="card-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${getAdherenceScore()}%` }}
                  ></div>
                </div>
                <div className="card-sublabel">
                  {getAdherenceScore() >= 90 ? 'Excellent!' : 
                   getAdherenceScore() >= 70 ? 'Good progress' : 
                   'Keep going!'}
                </div>
              </div>
            </div>

            <div className="dashboard-card medications-card" onClick={() => { setComingSoonFeature('Medication History'); setShowComingSoon(true); }}>
              <div className="card-icon-wrapper">
                <div className="card-icon">💊</div>
              </div>
              <div className="card-content">
                <div className="card-value">{getTakenMeds()}/{getTotalMeds()}</div>
                <div className="card-label">Medications Today</div>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-dot completed"></span>
                    <span>{getTakenMeds()} Taken</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-dot pending"></span>
                    <span>{getTotalMeds() - getTakenMeds()} Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card streak-card" onClick={() => { setComingSoonFeature('Streak Analytics'); setShowComingSoon(true); }}>
              <div className="card-icon-wrapper">
                <div className="card-icon">🔥</div>
              </div>
              <div className="card-content">
                <div className="card-value">{streak}</div>
                <div className="card-label">Day Streak</div>
                <div className="streak-visual">
                  {last7Days.length > 0 ? (
                    last7Days.map((day, i) => (
                      <div 
                        key={i} 
                        className={`streak-day ${day.perfect ? 'active' : 'inactive'}`}
                        title={`${day.date}: ${day.taken}/${day.total} taken`}
                      >
                        {day.perfect ? '✓' : '○'}
                      </div>
                    ))
                  ) : (
                    [...Array(7)].map((_, i) => (
                      <div key={i} className="streak-day inactive">○</div>
                    ))
                  )}
                </div>
                <div className="card-sublabel">
                  {streak > 0 ? 'Keep it up!' : 'Start your streak!'}
                </div>
              </div>
            </div>

            <div className="dashboard-card next-dose-card" onClick={() => { setComingSoonFeature('Medication Schedule'); setShowComingSoon(true); }}>
              <div className="card-icon-wrapper">
                <div className="card-icon">⏰</div>
              </div>
              <div className="card-content">
                {(() => {
                  const now = new Date();
                  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                  
                  let nextMed: Medication | null = null;
                  let nextTime: string | null = null;
                  
                  for (const med of medications) {
                    for (const schedule of med.schedules) {
                      if (!schedule.taken && schedule.time > currentTime) {
                        if (!nextTime || schedule.time < nextTime) {
                          nextTime = schedule.time;
                          nextMed = med;
                        }
                      }
                    }
                  }
                  
                  if (nextMed && nextTime) {
                    return (
                      <>
                        <div className="card-value">{nextTime}</div>
                        <div className="card-label">Next Dose</div>
                        <div className="next-med-info">
                          <div className="next-med-name">{nextMed.medicationName}</div>
                          <div className="next-med-dose">{nextMed.dosage}</div>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div className="card-value">✓</div>
                        <div className="card-label">All Done!</div>
                        <div className="card-sublabel">No more doses today</div>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions and Score Container */}
        <div className="actions-score-container">
          {/* Quick Actions - 2x2 Grid */}
          <div className="quick-actions">
            <div className="action-card" style={{ '--delay': '0s' } as React.CSSProperties} onClick={() => setShowMedications(true)}>
              <div className="action-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="action-title">My Medications</div>
              <div className="action-subtitle">Manage & track</div>
            </div>
            <div className="action-card" style={{ '--delay': '0.1s' } as React.CSSProperties} onClick={() => setShowAppointments(true)}>
              <div className="action-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="action-title">Appointments</div>
              <div className="action-subtitle">Book & view</div>
            </div>
            <div className="action-card" style={{ '--delay': '0.2s' } as React.CSSProperties} onClick={() => { setComingSoonFeature('Health Records'); setShowComingSoon(true); }}>
              <div className="action-icon">
                <i className="fas fa-file-medical"></i>
              </div>
              <div className="action-title">Health Records</div>
              <div className="action-subtitle">View & download</div>
            </div>
            <div className="action-card" style={{ '--delay': '0.3s' } as React.CSSProperties} onClick={() => { setComingSoonFeature('Health Tips'); setShowComingSoon(true); }}>
              <div className="action-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div className="action-title">Health Tips</div>
              <div className="action-subtitle">Learn more</div>
            </div>
          </div>

          {/* Next Medication Card */}
          <div className="next-med-card">
            {(() => {
              const now = new Date();
              const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              
              let nextMed: Medication | null = null;
              let nextTime: string | null = null;
              
              for (const med of medications) {
                for (const schedule of med.schedules) {
                  if (!schedule.taken && schedule.time > currentTime) {
                    if (!nextTime || schedule.time < nextTime) {
                      nextTime = schedule.time;
                      nextMed = med;
                    }
                  }
                }
              }
              
              if (nextMed && nextTime) {
                return (
                  <>
                    <div className="next-med-icon">⏰</div>
                    <div className="next-med-time">{nextTime}</div>
                    <div className="next-med-name">{nextMed.medicationName}</div>
                    <div className="next-med-dose">{nextMed.dosage}</div>
                    <div className="next-med-label">Next Medication</div>
                  </>
                );
              } else {
                return (
                  <>
                    <div className="next-med-icon">✅</div>
                    <div className="next-med-name">All Done!</div>
                    <div className="next-med-label">No more meds today</div>
                  </>
                );
              }
            })()}
          </div>
        </div>

        {/* Medications Card */}
        <div className="content-card1">
          <div className="card-header1">
            <h3 className="card-title">
              <i className="fas fa-pills"></i>
              Today's Medications
            </h3>
            <button 
              className="view-all" 
              onClick={(e) => { 
                e.preventDefault(); 
                setComingSoonFeature('All Medications'); 
                setShowComingSoon(true); 
              }}
            >
              View All <i className="fas fa-arrow-right"></i>
            </button>
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
              {Object.entries(groupedMeds).map(([timeSlot, meds], slotIndex) => {
                const untakenMeds = meds.filter(({ schedule }) => !schedule.taken);
                
                // Don't show time slot if all meds are taken
                if (untakenMeds.length === 0) return null;
                
                return (
                  <div key={timeSlot} className="med-slot">
                    <div className="slot-header">
                      <div className="slot-time">{timeSlot}</div>
                      <div className="slot-badge">{untakenMeds.length} {untakenMeds.length === 1 ? 'pill' : 'pills'}</div>
                    </div>
                    <div className="pills-grid">
                      {untakenMeds.map(({ med, schedule }, medIndex) => (
                        <div key={`${med._id}-${schedule.time}`} className="pill">
                          {med.medicationImage ? (
                            <img src={med.medicationImage} alt={med.medicationName} className="pill-image" />
                          ) : (
                            <div className="pill-icon">{getMedicationIcon(slotIndex * 10 + medIndex)}</div>
                          )}
                          <div className="pill-info">
                            <div className="pill-name">{med.medicationName}</div>
                            <div className="pill-dose">{med.dosage}</div>
                          </div>
                          <div className="pill-actions">
                            <button
                              className="pill-check"
                              onClick={() => markAsTaken(med._id, schedule.time)}
                              title="Mark as taken"
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Beautiful Modern Chat Drawer */}
      <div className={`chat-drawer ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-drawer-overlay" onClick={() => setIsChatOpen(false)}></div>
        <div 
          className="chat-drawer-content" 
          style={{ height: `${chatHeight}px`, maxHeight: `${chatHeight}px` }}
        >
          <div 
            className="chat-resize-handle-vertical"
            onMouseDown={(e) => {
              setIsResizingHeight(true);
              e.preventDefault();
            }}
          />
          {/* Modern Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="ai-avatar-large">
                <div className="ai-avatar-icon">🤖</div>
                <div className="ai-status-dot"></div>
              </div>
              <div className="chat-header-info">
                <h3>AI Health Assistant</h3>
                <p className="ai-status">Online • Ready to help</p>
              </div>
            </div>
            <div className="chat-header-actions">
              {!messageLimit.hasOwnKey && (
                <div className={`message-counter ${messageLimit.remaining <= 5 ? 'warning' : ''}`}>
                  <i className="fas fa-comment-dots"></i>
                  <span>{messageLimit.remaining}/{messageLimit.limit} free messages</span>
                </div>
              )}
              {messageLimit.hasOwnKey && (
                <div className="unlimited-badge">
                  <i className="fas fa-infinity"></i>
                  <span>Unlimited</span>
                </div>
              )}
              <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
                <i className="fas fa-cog"></i>
              </button>
              <button 
                className={`icon-btn experimental-btn ${showUpload ? 'active' : ''}`}
                onClick={() => setShowUpload(!showUpload)} 
                title="Upload document (Experimental)"
              >
                <i className="fas fa-paperclip"></i>
                <span className="experimental-badge">BETA</span>
              </button>
              <button className="icon-btn" onClick={() => setIsChatOpen(false)} title="Close">
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          </div>

          {/* Enhanced Upload Section */}
          {showUpload && (
            <div className="upload-section">
              {!selectedFile && !showManualInput && (
                <div className="upload-options">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-upload" className="upload-option-card">
                    <div className="upload-option-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div className="upload-option-text">
                      <span className="upload-option-title">Upload Document</span>
                      <small className="upload-option-subtitle">PDF, DOC, DOCX, TXT, Images</small>
                    </div>
                  </label>
                  
                  <button 
                    className="upload-option-card" 
                    onClick={() => setShowManualInput(true)}
                  >
                    <div className="upload-option-icon">
                      <i className="fas fa-keyboard"></i>
                    </div>
                    <div className="upload-option-text">
                      <span className="upload-option-title">Type/Paste Text</span>
                      <small className="upload-option-subtitle">Enter medical history manually</small>
                    </div>
                  </button>
                </div>
              )}

              {selectedFile && (
                <div className="file-preview">
                  <div className="file-preview-header">
                    <div className="file-icon">
                      {selectedFile.type.includes('pdf') && <i className="fas fa-file-pdf"></i>}
                      {selectedFile.type.includes('word') && <i className="fas fa-file-word"></i>}
                      {selectedFile.type.includes('text') && <i className="fas fa-file-alt"></i>}
                      {selectedFile.type.includes('image') && <i className="fas fa-file-image"></i>}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{selectedFile.name}</div>
                      <div className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</div>
                    </div>
                    <button className="file-remove" onClick={cancelFileSelection}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="file-preview-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={cancelFileSelection}
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-upload" 
                      onClick={handleFileUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload"></i> Upload & Process
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {showManualInput && (
                <div className="manual-input-section">
                  <div className="manual-input-header">
                    <h4>
                      <i className="fas fa-keyboard"></i> Enter Medical History
                    </h4>
                    <button className="close-manual-input" onClick={cancelFileSelection}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <textarea
                    className="manual-text-input"
                    placeholder="Paste or type your medical history here...&#10;&#10;Example:&#10;- Diagnosed with Type 2 Diabetes in 2020&#10;- Allergic to Penicillin&#10;- Currently taking Metformin 500mg twice daily&#10;- Blood pressure: 120/80"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={8}
                  />
                  <div className="manual-input-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={cancelFileSelection}
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-upload" 
                      onClick={handleManualTextSubmit}
                      disabled={isUploading || !manualText.trim()}
                    >
                      {isUploading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i> Submit & Process
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Messages */}
          <div className="chat-messages" id="chat-messages-container">
            {chatMessages.length === 0 && (
              <div className="chat-welcome">
                <div className="welcome-avatar">
                  <div className="welcome-avatar-icon">👋</div>
                </div>
                <h4 className="welcome-title">Hi {firstName}!</h4>
                <p className="welcome-subtitle">I'm your AI health assistant</p>
                
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => setChatInput("I need to add a new medication")}
                  >
                    <div className="quick-action-icon">💊</div>
                    <span>Add Medication</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setChatInput("I want to schedule an appointment")}
                  >
                    <div className="quick-action-icon">📅</div>
                    <span>Book Appointment</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setChatInput("What are my medications for today?")}
                  >
                    <div className="quick-action-icon">📋</div>
                    <span>Today's Meds</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setChatInput("Tell me about drug interactions")}
                  >
                    <div className="quick-action-icon">⚠️</div>
                    <span>Drug Info</span>
                  </button>
                </div>

                <div className="capabilities-list">
                  <div className="capability-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Add & manage medications</span>
                  </div>
                  <div className="capability-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Schedule appointments</span>
                  </div>
                  <div className="capability-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Answer health questions</span>
                  </div>
                  <div className="capability-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Analyze medical documents</span>
                  </div>
                </div>
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'user' ? (
                    <div className="user-avatar-small">{initials}</div>
                  ) : (
                    <div className="bot-avatar-small">🤖</div>
                  )}
                </div>
                <div className="message-content">
                  <div className={`message-bubble ${msg.role}`}>
                    {msg.content}
                  </div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isSending && (
              <div className="chat-message assistant">
                <div className="message-avatar assistant">
                  <div className="bot-avatar-small">🤖</div>
                </div>
                <div className="message-content">
                  <div className="message-bubble assistant typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modern Chat Input */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input-field"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isSending}
              />
              <button 
                className="send-btn" 
                onClick={sendMessage} 
                disabled={isSending || !chatInput.trim()}
                title="Send message"
              >
                {isSending ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
            <div className="chat-input-hint">
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Floating Chat Button - Hidden when chat is open */}
      {!isChatOpen && (
        <button className="chat-fab" onClick={() => setIsChatOpen(true)}>
          <div className="fab-icon">
            <i className="fas fa-robot"></i>
            {chatMessages.length > 0 && (
              <span className="chat-badge">{chatMessages.length}</span>
            )}
          </div>
          <div className="fab-pulse"></div>
        </button>
      )}

      {/* Modals */}
      {showProfile && <PatientProfileView onClose={() => setShowProfile(false)} />}
      {showMedications && <MedicationsPage onClose={() => setShowMedications(false)} />}
      {showAppointments && <AppointmentsPage onClose={() => setShowAppointments(false)} />}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="coming-soon-overlay" onClick={() => setShowComingSoon(false)}>
          <div className="coming-soon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coming-soon-icon">🚀</div>
            <h2 className="coming-soon-title">Coming Soon!</h2>
            <p className="coming-soon-feature">{comingSoonFeature}</p>
            <p className="coming-soon-message">
              We're working hard to bring you this feature. Stay tuned for updates!
            </p>
            <div className="coming-soon-progress">
              <div className="progress-bar-container">
                <div className="progress-bar-fill"></div>
              </div>
              <p className="progress-text">In Development</p>
            </div>
            <button className="coming-soon-btn" onClick={() => setShowComingSoon(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-container settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSettings(false)}>
              <i className="fas fa-times"></i>
            </button>
            <APIKeySettings userId={(() => {
              const user = localStorage.getItem('user');
              const userData = user ? JSON.parse(user) : null;
              return userData?._id || userData?.id || 'demo-patient-001';
            })()} />
          </div>
        </div>
      )}
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            setShowSettings(true);
          }}
          remaining={messageLimit.remaining}
        />
      )}

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="welcome-modal-overlay">
          <div className="welcome-modal">
            <div className="welcome-modal-header">
              <div className="welcome-icon">🚀</div>
              <h2>Welcome to Your Patient Portal!</h2>
              <p className="welcome-subtitle">Preview Mode - Explore the Features</p>
            </div>

            <div className="welcome-modal-content">
              <div className="welcome-message">
                <p className="welcome-intro">
                  Thank you for checking out the DrugNexusAI Patient Portal! This is a <strong>preview version</strong> showcasing the core features and design.
                </p>

                <div className="features-showcase">
                  <div className="feature-item">
                    <div className="feature-icon">💊</div>
                    <div className="feature-text">
                      <h4>Medication Management</h4>
                      <p>Track your medications and get reminders</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">📅</div>
                    <div className="feature-text">
                      <h4>Appointment Scheduling</h4>
                      <p>Book and manage your appointments</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">🤖</div>
                    <div className="feature-text">
                      <h4>AI Health Assistant</h4>
                      <p>Get instant help with your health questions</p>
                    </div>
                  </div>

                  <div className="feature-item">
                    <div className="feature-icon">📊</div>
                    <div className="feature-text">
                      <h4>Health Dashboard</h4>
                      <p>Monitor your adherence and progress</p>
                    </div>
                  </div>
                </div>

                <div className="welcome-note">
                  <div className="note-icon">ℹ️</div>
                  <div className="note-content">
                    <strong>Please Note:</strong> Some features are still in development and may have limited functionality. 
                    Feel free to explore and test the available features!
                  </div>
                </div>
              </div>
            </div>

            <div className="welcome-modal-footer">
              <button className="explore-btn" onClick={handleCloseWelcome}>
                <span>Start Exploring</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <p className="footer-note">You can always access help by clicking the chat button</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-container settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSettings(false)}>
              <i className="fas fa-times"></i>
            </button>
            <APIKeySettings userId={(() => {
              const user = localStorage.getItem('user');
              const userData = user ? JSON.parse(user) : null;
              return userData?._id || userData?.id || 'demo-patient-001';
            })()} />
          </div>
        </div>
      )}
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            setShowSettings(true);
          }}
          remaining={messageLimit.remaining}
        />
      )}
    </div>
  );
};

export default PatientPortal;
