import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DrugNexusAIDoctorPortal.css';
import './PatientDetails.css';
import { DocSidebar } from './PortalSidebar';
import { BASE_URL_1, BASE_URL_2 } from '../base';
import { decodePatientId, isValidPatientIdFormat } from '../utils/patientSecurity';
import { logger } from '../utils/logger';
import DDIAlertSystem from './DDIAlertSystem';
import APIKeySettings from './APIKeySettings';
import ExhaustedModal from './ExhaustedModal';
import DoctorUsageIndicator from './DoctorUsageIndicator';

interface DoctorProfile {
  fullName: string;
  phone: string;
  specialization: string;
  qualifications?: string;
  experienceYears?: number;
  age: number;
  gender: string;
  profileImage?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  phone?: string;
  lastVisit: string;
  profileImage?: string;
  conditions?: string[];
}

interface Medicine {
  id?: number;
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  status?: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

interface HistoryNote {
  id: string;
  createdAt: string;
  rawText: string;
  summary: string;
  structured?: {
    conditions: { current: string[]; past: string[] };
    medications: Medicine[];
    allergies: string[];
  };
}

interface PrescriptionResp {
  prescription: { medicines: Medicine[] } | null;
}



const defaultPatientAvatars: Record<string, string> = {
  male: 'https://img.icons8.com/color/96/user-male-circle.png',
  female: 'https://img.icons8.com/color/96/user-female-circle.png',
  other: 'https://img.icons8.com/color/96/user.png',
};

const NOTES_PER_PAGE = 4;

const PatientDetails: React.FC = () => {
  const { patientId: encodedPatientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();



  // Decode the patient ID and validate access
  const patientId = encodedPatientId ? decodePatientId(encodedPatientId) : null;

  // Log patient details page access
  useEffect(() => {
    logger.info('PATIENT_DETAILS_PAGE_ACCESSED', {
      encodedPatientId,
      decodedPatientId: patientId,
      isValidFormat: patientId ? isValidPatientIdFormat(patientId) : false,
      referrer: document.referrer
    });
  }, [encodedPatientId, patientId]);

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [editForm, setEditForm] = useState<DoctorProfile>({ fullName: '', phone: '', specialization: '', qualifications: '', experienceYears: 0, age: 0, gender: '', profileImage: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  const [patientBio, setPatientBio] = useState<Patient | null>(null);
  const [currentMedications, setCurrentMedications] = useState<Medicine[]>([]);
  const [currentConditions, setCurrentConditions] = useState<string[]>([]);
  const [pastConditions, setPastConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [historyNotes, setHistoryNotes] = useState<HistoryNote[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNote, setSelectedNote] = useState<HistoryNote | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [medicationTab, setMedicationTab] = useState<'active' | 'past'>('active');
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  // BYOK states
  const [showSettings, setShowSettings] = useState(false);
  const [showExhaustedModal, setShowExhaustedModal] = useState(false);
  const [isFreeTierExhausted, setIsFreeTierExhausted] = useState(false);
  const [apiUsage, setApiUsage] = useState({
    hasOwnKey: false,
    remaining: 50,
    limit: 50,
    usage: 0
  });

  // Format date to DD-MM-YYYY
  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate age from DOB
  const calculateAgeFromDOB = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Load active alerts count from localStorage on mount
  useEffect(() => {
    if (patientId) {
      const savedAlerts = localStorage.getItem(`ddi_alerts_${patientId}`);
      if (savedAlerts) {
        try {
          const parsed = JSON.parse(savedAlerts);
          const activeCount = parsed.active?.length || 0;
          setActiveAlertsCount(activeCount);
        } catch (error) {
          console.error('Failed to parse saved alerts:', error);
        }
      }
    }
  }, [patientId]);

  // Fetch API usage status
  const fetchApiUsageStatus = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;
      
      const userData = JSON.parse(user);
      const userId = userData._id || userData.id;
      
      const response = await fetch(`http://localhost:5000/api/api-key/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setApiUsage({
          hasOwnKey: data.hasApiKey,
          remaining: data.remaining,
          limit: data.dailyLimit,
          usage: data.usage || 0
        });
      }
    } catch (error) {
      console.error('Error fetching API usage:', error);
    }
  };

  useEffect(() => {
    fetchApiUsageStatus();
  }, []);

  // Check if medication is still active based on end date AND manual status
  const isMedicationActive = (medication: Medicine): boolean => {
    // Respect manually set status - if it's inactive, keep it inactive
    if (medication.status === 'inactive') return false;
    
    // If no end date, it's ongoing and active
    if (!medication.endDate) return true;
    
    // Check if medication has expired based on end date
    const today = new Date();
    const endDate = new Date(medication.endDate);
    return today <= endDate;
  };

  // Update medication status ONLY for auto-expiration (not for manually set inactive)
  const updateMedicationStatus = (medications: Medicine[]): Medicine[] => {
    return medications.map(med => {
      // Preserve the status from database - don't recalculate
      // The status in the database is the source of truth
      return {
        ...med,
        status: med.status || 'active' // Default to active if no status set
      };
    });
  };

  // Separate active and inactive medications - recalculate when currentMedications changes
  const activeMedications = React.useMemo(() => {
    return currentMedications.filter(med => isMedicationActive(med));
  }, [currentMedications]);

  const inactiveMedications = React.useMemo(() => {
    return currentMedications.filter(med => !isMedicationActive(med));
  }, [currentMedications]);

  // Toggle medication status manually
  const toggleMedicationStatus = async (medicationIndex: number) => {
    if (!patientId) return;
    
    const updatedMedications = currentMedications.map((med, idx) => {
      if (idx === medicationIndex) {
        return {
          ...med,
          status: med.status === 'active' ? 'inactive' as const : 'active' as const
        };
      }
      return med;
    });
    
    setCurrentMedications(updatedMedications);
    
    // Save all medications to backend
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_URL_1}/api/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId,
          medicines: updatedMedications
        })
      });
      
      if (response.ok) {
        console.log('Medication status updated successfully');
      } else {
        console.error('Failed to save medication status');
      }
    } catch (error) {
      console.error('Failed to update medication status:', error);
    }
  };

  // Check ML service health
  const checkServiceHealth = async () => {
    try {
      setServiceStatus('Checking...');
      const res = await fetch(`${BASE_URL_2}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      if (res.ok) {
        const data = await res.json();
        setServiceStatus(`✅ ML Service is running (${data.service || 'ml-service'})`);
        console.log('Service health:', data);
      } else {
        setServiceStatus(`⚠️ ML Service responded with status ${res.status}`);
      }
    } catch (err: any) {
      console.error('Service health check failed:', err);
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setServiceStatus(`❌ ML Service timeout - not responding at ${BASE_URL_2}`);
      } else {
        setServiceStatus(`❌ Cannot connect to ML Service at ${BASE_URL_2}`);
      }
    }
  };

  useEffect(() => {
    console.log('PatientDetails useEffect triggered for patientId:', patientId);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      setError('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }
    
    if (!patientId || !isValidPatientIdFormat(patientId)) {
      console.error('Invalid patient ID:', patientId);
      logger.patientValidation(patientId || 'null', false, 'Invalid patient ID format');
      setError('Invalid patient ID');
      navigate('/DrugNexusAIDoctorPortal');
      return;
    }

    console.log('Patient ID validation passed:', patientId);
    logger.patientValidation(patientId, true, 'Patient ID format valid');

    // Alert functionality disabled

    // Fetch doctor profile
    console.log('Fetching doctor profile...');
    fetch(`${BASE_URL_1}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Doctor profile fetch failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Doctor profile response:', data);
        if (data.doctorProfile) {
          setDoctorProfile(data.doctorProfile);
          setEditForm(data.doctorProfile);
        } else {
          console.warn('No doctor profile found in response');
        }
      })
      .catch((error) => {
        console.error('Doctor profile fetch error:', error);
        setError(`Failed to fetch doctor profile: ${error.message}`);
      });

    // Try to fetch patient data directly from the patients list (simplified approach)
    console.log('Fetching patient data for ID:', patientId);
    fetch(`${BASE_URL_1}/api/patients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        console.log('Patient fetch response status:', res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch patients: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Patient fetch response data:', data);
        if (data.patients) {
          console.log('Looking for patient with ID:', patientId, 'in', data.patients.length, 'patients');
          const patient = data.patients.find((p: Patient) => p.id === patientId);
          if (patient) {
            console.log('Patient found:', patient);
            setPatientBio(patient);
            setHasAccess(true);
            setError(null);
            logger.patientDataFetch(patientId, 'direct_fetch', true, { patientName: patient.name });
            return;
          } else {
            console.error('Patient not found in list. Available patient IDs:', data.patients.map((p: Patient) => p.id));
          }
        } else {
          console.error('No patients array in response');
        }
        throw new Error('Patient not found in patient list');
      })
      .catch((error) => {
        console.error('Patient fetch error:', error);
        logger.patientDataFetch(patientId, 'direct_fetch', false, { error: error.message });
        setError(`Unable to load patient data: ${error.message}`);
        setTimeout(() => {
          navigate('/DrugNexusAIDoctorPortal');
        }, 5000);
      });

    // Fetch prescriptions
    fetch(`${BASE_URL_1}/api/prescriptions?patientId=${patientId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 404) {
          // No prescription found - this is normal, not an error
          logger.patientDataFetch(patientId, 'prescriptions', true, { message: 'No prescriptions found' });
          return { prescription: null };
        } else {
          throw new Error(`Failed to fetch prescriptions: ${res.status} ${res.statusText}`);
        }
      })
      .then((data: PrescriptionResp) => {
        console.log('Prescriptions data:', data);
        if (data.prescription?.medicines) {
          console.log('Setting medications:', data.prescription.medicines);
          // Update status based on current date
          const updatedMeds = updateMedicationStatus(data.prescription.medicines);
          setCurrentMedications(updatedMeds);
          logger.patientDataFetch(patientId, 'prescriptions', true, {
            medicineCount: data.prescription.medicines.length
          });
        }
      })
      .catch((error) => {
        logger.patientDataFetch(patientId, 'prescriptions', false, { error: error.message });
        console.warn('Failed to fetch prescriptions:', error.message);
        // Don't set error for prescriptions as it's not critical for page load
      });

    // Fetch history notes
    fetch(`${BASE_URL_2}/api/patient-history?patientId=${patientId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.notes) {
          const sortedNotes = data.notes.sort((a: HistoryNote, b: HistoryNote) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setHistoryNotes(sortedNotes);
          // Apply latest structured data (but don't overwrite medications from prescriptions)
          const latest = sortedNotes[0];
          if (latest?.structured) {
            // Only update medications if we don't have any from prescriptions
            if (latest.structured.medications && latest.structured.medications.length > 0) {
              const updatedMeds = updateMedicationStatus(latest.structured.medications);
              setCurrentMedications(prev => prev.length > 0 ? prev : updatedMeds);
            }
            setCurrentConditions(latest.structured.conditions?.current || []);
            setPastConditions(latest.structured.conditions?.past || []);
            setAllergies(latest.structured.allergies || []);
          }
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch patient history:', error);
        // Don't set error for history as it's not critical for page load
      });

    return () => {
      // Cleanup function
    };
  }, [patientId]);



  const handleSaveNote = async () => {
    if (!noteInput.trim()) return;
    setSaveError(null); // Clear previous save errors
    setIsLoading(true); // 🔄 Show loading
    const token = localStorage.getItem('token');
    
    // Set a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      console.log('Saving consultation note for patient:', patientId);
      console.log('API endpoint:', `${BASE_URL_2}/api/patient-history`);
      console.log('Request payload:', { patientId, notes: noteInput.substring(0, 50) + '...' });
      
      const res = await fetch(`${BASE_URL_2}/api/patient-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId, notes: noteInput }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();
      console.log('Save response:', result);
      
      if (result.success && result.note) {
        // Update notes
        setHistoryNotes(prev => [result.note, ...prev]);

        // Update structured data
        const s = result.note.structured;
        if (s) {
          setCurrentMedications(s.medications || []);
          setCurrentConditions(s.conditions?.current || []);
          setPastConditions(s.conditions?.past || []);
          setAllergies(s.allergies || []);
        }

        // Cleanup
        setNoteInput('');
        setCurrentPage(1);
        setSaveError(null); // Clear any previous errors
        console.log('Consultation note saved successfully');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error saving consultation note:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Use setSaveError instead of setError to avoid triggering error page
      if (err.name === 'AbortError') {
        setSaveError('Request timed out after 60 seconds. The ML service may be slow or unresponsive.');
      } else if (err.message === 'Failed to fetch') {
        setSaveError(`Cannot connect to ML service at ${BASE_URL_2}. Please ensure the ML service is running on port 8000.`);
      } else if (err.message) {
        setSaveError(`Failed to save note: ${err.message}`);
      } else {
        setSaveError('Error saving note. Please try again.');
      }
    } finally {
      setIsLoading(false); // ✅ Hide loading
    }
  };

  const indexOfLast = currentPage * NOTES_PER_PAGE;
  const indexOfFirst = indexOfLast - NOTES_PER_PAGE;
  const currentNotes = historyNotes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(historyNotes.length / NOTES_PER_PAGE);

  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  const handleOpenNote = (note: HistoryNote) => {
    setSelectedNote(note);
    setEditText(note.rawText || note.summary); // Use rawText if available, fallback to summary
    setShowNoteModal(true);
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL_2}/api/patient-history/${selectedNote.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistoryNotes(prev => prev.filter(n => n.id !== selectedNote.id));
        // After deletion, fetch the latest notes to update structured data
        const latestNotes = historyNotes.filter(n => n.id !== selectedNote.id);
        const latest = latestNotes[0];
        if (latest?.structured) {
          setCurrentMedications(latest.structured.medications || []);
          setCurrentConditions(latest.structured.conditions?.current || []);
          setPastConditions(latest.structured.conditions?.past || []);
          setAllergies(latest.structured.allergies || []);
        } else {
          setCurrentMedications([]);
          setCurrentConditions([]);
          setPastConditions([]);
          setAllergies([]);
        }
        setShowNoteModal(false);
        setSaveError(null);
      } else {
        setSaveError('Failed to delete note');
      }
    } catch (err) {
      setSaveError('Error deleting note');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;
    setSaveError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL_2}/api/patient-history/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rawText: editText })
      });
      const result = await res.json();
      if (res.ok) {
        // Update the history notes with the edited note
        setHistoryNotes(prev => prev.map(n => (n.id === selectedNote.id ? { ...n, rawText: editText, summary: result.note?.summary || editText, structured: result.note?.structured || n.structured } : n)));
        // Update structured data
        const s = result.note?.structured;
        if (s) {
          setCurrentMedications(s.medications || []);
          setCurrentConditions(s.conditions?.current || []);
          setPastConditions(s.conditions?.past || []);
          setAllergies(s.allergies || []);
        }
        setShowNoteModal(false);
        setSaveError(null);
      } else {
        setSaveError('Failed to update note');
      }
    } catch (err) {
      setSaveError('Error updating note');
    }
  };

  // Tab functionality for conditions
  const [activeTab, setActiveTab] = useState('current');

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  if (error) {
    return (
      <div className="error-page-container">
        <div className="error-content">
          <div className="error-animation">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="error-waves">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
            </div>
          </div>

          <div className="error-text">
            <h1>Oops! Something went wrong</h1>
            <h2>Unable to Load Patient Details</h2>
            <p className="error-description">
              We encountered an issue while trying to fetch the patient information.
              This could be due to a temporary network issue or server maintenance.
            </p>
            <div className="error-details">
              <span className="error-code">Error: {error}</span>
            </div>
          </div>

          <div className="error-actions">
            <button
              className="btn-primary-error"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-redo"></i>
              Try Again
            </button>
            <button
              className="btn-secondary-error"
              onClick={() => navigate('/DrugNexusAIDoctorPortal')}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Portal
            </button>
          </div>

          <div className="error-help">
            <p>If the problem persists, please contact your system administrator or try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctorProfile || !patientBio || !hasAccess) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3>Loading Patient Details</h3>
          <p>Please wait while we securely fetch the patient information...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  const imgSrc = patientBio.profileImage || defaultPatientAvatars[patientBio.gender.toLowerCase()] || defaultPatientAvatars.other;

  const onEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, files } = e.target as HTMLInputElement;
    if (id === 'profileImage' && files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setEditForm(prev => ({ ...prev, profileImage: reader.result as string }));
      reader.readAsDataURL(files[0]);
    } else {
      setEditForm(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value } as any));
    }
  };

  const handleEditSave = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL_1}/api/profile/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profileData: { doctorProfile: editForm } })
    });
    if (res.ok) {
      setDoctorProfile(editForm);
      setShowEditModal(false);
    }
  };

  return (
    <div className="doctor-dashboard">
      {isLoading && (
        <div className="fullscreen-loader">
          <div className="loader-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Processing Request</h3>
            <p>Please wait while we save your consultation notes...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="sidebar-wrapper">
        <DocSidebar
          profile={{
            name: `Dr. ${doctorProfile.fullName}`,
            specialization: doctorProfile.specialization,
            avatarUrl: doctorProfile.profileImage,
            onEditProfile: () => setShowEditModal(true)
          }}
        />
      </div>

      <main className="dashboard-main patient-details-main">
        {error && <div className="error-message">{error}</div>}

        {/* Patient Header Section */}
        <div className="patient-header-section">
          <div className="patient-hero-card">
            <div className="patient-avatar-container">
              <img src={imgSrc} alt="Patient" className="patient-avatar" />
              <div className="patient-status-indicator"></div>
            </div>
            <div className="patient-hero-info">
              <h1 className="patient-name">{patientBio.name}</h1>
              <div className="patient-meta-grid">
                <div className="meta-item">
                  <i className="fas fa-id-card"></i>
                  <span className="meta-label">Patient ID</span>
                  <span className="meta-value">{patientBio.id}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-birthday-cake"></i>
                  <span className="meta-label">Age</span>
                  <span className="meta-value">{calculateAgeFromDOB(patientBio.dob)} years</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-venus-mars"></i>
                  <span className="meta-label">Gender</span>
                  <span className="meta-value">{patientBio.gender}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span className="meta-label">Date of Birth</span>
                  <span className="meta-value">{formatDateToDDMMYYYY(patientBio.dob)}</span>
                </div>
                {patientBio.phone && (
                  <div className="meta-item">
                    <i className="fas fa-phone"></i>
                    <span className="meta-label">Phone Number</span>
                    <span className="meta-value">{patientBio.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="patient-actions">
              <button className="prescription-btn" onClick={() => navigate('/create-prescription', { state: { patientId } })}>
                <i className="fas fa-prescription-bottle-alt"></i>
                <span>Manage Prescription</span>
              </button>
              <button 
                className="prescription-btn alerts-btn" 
                onClick={() => setShowAlertsModal(true)}
              >
                <i className="fas fa-shield-alt"></i>
                <span>Interaction Alerts</span>
                {activeAlertsCount > 0 && (
                  <span className="alert-badge-btn">{activeAlertsCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="patient-content-grid">
          {/* Left Column */}
          <div className="content-column-left">
            {/* Consultation Notes */}
            <section className="modern-card consultation-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-notes-medical"></i>
                </div>
                <h3>Consultation Notes</h3>
                <div className="header-actions">
                  <span className="notes-count">{historyNotes.length} notes</span>
                </div>
              </div>

              <div className="notes-input-container">
                <textarea
                  rows={4}
                  value={noteInput}
                  placeholder="Document patient's condition, symptoms, observations, or treatment notes..."
                  onChange={e => setNoteInput(e.target.value)}
                  className="modern-textarea"
                />
                <button className="save-note-btn" onClick={handleSaveNote} disabled={!noteInput.trim()}>
                  <i className="fas fa-save"></i>
                  Save Note
                </button>
              </div>

              {saveError && (
                <div className="save-error-message" style={{ 
                  padding: '12px', 
                  margin: '10px 0', 
                  backgroundColor: '#fee', 
                  border: '1px solid #fcc', 
                  borderRadius: '8px', 
                  color: '#c33'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fas fa-exclamation-circle"></i>
                    <span style={{ flex: 1 }}>{saveError}</span>
                    <button 
                      onClick={() => setSaveError(null)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#c33'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {saveError.includes('Cannot connect') && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        onClick={checkServiceHealth}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fff',
                          border: '1px solid #c33',
                          borderRadius: '4px',
                          color: '#c33',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Check Service Status
                      </button>
                      {serviceStatus && <span style={{ fontSize: '12px' }}>{serviceStatus}</span>}
                    </div>
                  )}
                </div>
              )}

              <div className="notes-timeline">
                {currentNotes.length ? (
                  currentNotes.map(note => (
                    <div key={note.id} className="timeline-note" onClick={() => handleOpenNote(note)}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                          <span className="timeline-time">{new Date(note.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="timeline-text">{note.summary.length > 150 ? note.summary.slice(0, 150) + '...' : note.summary}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-clipboard-list"></i>
                    <p>No consultation notes yet</p>
                    <span>Start documenting patient interactions above</span>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="modern-pagination">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </section>

            {/* Medications Section with Active/Past Tabs */}
            <section className="modern-card medications-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <h3>Medications</h3>
              </div>

              <div className="conditions-tabs">
                <div className="tab-header">
                  <button
                    className={`tab-btn ${medicationTab === 'active' ? 'active' : ''}`}
                    onClick={() => setMedicationTab('active')}
                  >
                    Active ({activeMedications.length})
                  </button>
                  <button
                    className={`tab-btn ${medicationTab === 'past' ? 'active' : ''}`}
                    onClick={() => setMedicationTab('past')}
                  >
                    Past ({inactiveMedications.length})
                  </button>
                </div>

                {/* Active Medications Tab */}
                <div className={`tab-content ${medicationTab === 'active' ? 'active' : ''}`}>
                  {activeMedications.length ? (
                    <div className="medications-grid">
                      {activeMedications.map((med, idx) => {
                        const originalIndex = currentMedications.findIndex(m => m === med);
                        return (
                        <div key={idx} className="medication-item active-med">
                          <div className="medication-header">
                            <h4 className="medication-name">{med.name || 'Unknown Medication'}</h4>
                            <button
                              className="status-toggle-btn active"
                              onClick={() => toggleMedicationStatus(originalIndex)}
                              title="Mark as inactive"
                            >
                              <i className="fas fa-check-circle"></i>
                            </button>
                          </div>
                          <div className="medication-details">
                            <div className="detail-row">
                              <i className="fas fa-weight"></i>
                              <span>Dosage: {med.dosage || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <i className="fas fa-clock"></i>
                              <span>Frequency: {med.frequency || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <i className="fas fa-calendar"></i>
                              <span>Duration: {med.duration || 'Ongoing'}</span>
                            </div>
                            {med.startDate && (
                              <div className="detail-row">
                                <i className="fas fa-calendar-plus"></i>
                                <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {med.endDate && (
                              <div className="detail-row">
                                <i className="fas fa-calendar-check"></i>
                                <span>Ends: {new Date(med.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <i className="fas fa-prescription-bottle"></i>
                      <p>No active medications</p>
                      <span>Add medications via prescription management</span>
                    </div>
                  )}
                </div>

                {/* Past Medications Tab */}
                <div className={`tab-content ${medicationTab === 'past' ? 'active' : ''}`}>
                  {inactiveMedications.length ? (
                    <div className="medications-grid">
                      {inactiveMedications.map((med, idx) => {
                        const originalIndex = currentMedications.findIndex(m => m === med);
                        return (
                        <div key={idx} className="medication-item inactive-med">
                          <div className="medication-header">
                            <h4 className="medication-name">{med.name || 'Unknown Medication'}</h4>
                            <button
                              className="status-toggle-btn inactive"
                              onClick={() => toggleMedicationStatus(originalIndex)}
                              title="Mark as active"
                            >
                              <i className="fas fa-times-circle"></i>
                            </button>
                          </div>
                          <div className="medication-details">
                            <div className="detail-row">
                              <i className="fas fa-weight"></i>
                              <span>Dosage: {med.dosage || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <i className="fas fa-clock"></i>
                              <span>Frequency: {med.frequency || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                              <i className="fas fa-calendar"></i>
                              <span>Duration: {med.duration || 'Ongoing'}</span>
                            </div>
                            {med.startDate && (
                              <div className="detail-row">
                                <i className="fas fa-calendar-plus"></i>
                                <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {med.endDate && (
                              <div className="detail-row">
                                <i className="fas fa-calendar-times"></i>
                                <span>Ended: {new Date(med.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="inactive-badge">
                            <i className="fas fa-history"></i>
                            Discontinued
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <i className="fas fa-history"></i>
                      <p>No past medications</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="content-column-right">
            {/* Medical Conditions */}
            <section className="modern-card conditions-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <h3>Medical Conditions</h3>
              </div>

              <div className="conditions-tabs">
                <div className="tab-header">
                  <button
                    className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => handleTabClick('current')}
                  >
                    Current ({currentConditions.length})
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => handleTabClick('past')}
                  >
                    Past ({pastConditions.length})
                  </button>
                </div>

                <div className={`tab-content ${activeTab === 'current' ? 'active' : ''}`}>
                  {currentConditions.length ? (
                    <div className="conditions-list">
                      {currentConditions.map((condition, i) => (
                        <div key={i} className="condition-item current">
                          <div className="condition-indicator"></div>
                          <span className="condition-text">{condition}</span>
                          <span className="condition-badge">Active</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <p>No current conditions recorded</p>
                    </div>
                  )}
                </div>

                <div className={`tab-content ${activeTab === 'past' ? 'active' : ''}`}>
                  {pastConditions.length ? (
                    <div className="conditions-list">
                      {pastConditions.map((condition, i) => (
                        <div key={i} className="condition-item past">
                          <div className="condition-indicator"></div>
                          <span className="condition-text">{condition}</span>
                          <span className="condition-badge">Resolved</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <p>No past conditions recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Allergies */}
            <section className="modern-card allergies-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <h3>Allergies & Reactions</h3>
                <div className="header-actions">
                  <span className="allergy-count">{allergies.length} known</span>
                </div>
              </div>

              {allergies.length ? (
                <div className="allergies-list">
                  {allergies.map((allergy, i) => (
                    <div key={i} className="allergy-item">
                      <div className="allergy-icon">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <span className="allergy-text">{allergy}</span>
                      <span className="severity-indicator high">High Risk</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-check-circle"></i>
                  <p>No known allergies</p>
                  <span>Patient has no recorded allergic reactions</span>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Edit Profile</h3>
            <div className="modal-contents">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" className="modal-input" value={editForm.fullName} onChange={onEditChange} />
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" className="modal-input" value={editForm.phone} onChange={onEditChange} />
              <label htmlFor="specialization">Specialization</label>
              <input id="specialization" className="modal-input" value={editForm.specialization} onChange={onEditChange} />
              <label htmlFor="qualifications">Qualifications</label>
              <input id="qualifications" className="modal-input" value={editForm.qualifications!} onChange={onEditChange} />
              <label htmlFor="experienceYears">Years of Experience</label>
              <input id="experienceYears" type="number" className="modal-input" value={editForm.experienceYears!} onChange={onEditChange} />
              <label htmlFor="age">Age</label>
              <input id="age" type="number" className="modal-input" value={editForm.age} onChange={onEditChange} />
              <label htmlFor="gender">Gender</label>
              <select id="gender" className="modal-input" value={editForm.gender} onChange={onEditChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <label htmlFor="profileImage">Profile Image</label>
              <input id="profileImage" type="file" accept="image/*" className="modal-input" onChange={onEditChange} />
              {editForm.profileImage && <img src={editForm.profileImage} alt="Preview" style={{ width: 80, marginTop: 8 }} />}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="modal-btn confirm-btn" onClick={handleEditSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Edit/Delete Modal */}
      {showNoteModal && selectedNote && (
        <div className="modal-overlay">
          <div className="modal-box note-modal-box">
            <h3 className="modal-title">Edit Note</h3>
            <textarea className="modal-input note-modal-input" rows={8} value={editText} onChange={e => setEditText(e.target.value)} />
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowNoteModal(false)}>Cancel</button>
              <button className="modal-btn confirm-btn" onClick={handleSaveEdit}>Save</button>
              <button className="modal-btn delete-btn" onClick={handleDeleteNote}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* DDI Alerts Modal */}
      {showAlertsModal && patientId && patientBio && (
        <div className="modal-overlay" onClick={() => setShowAlertsModal(false)}>
          <div className="modal-box alerts-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAlertsModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="modal-title">
              <i className="fas fa-shield-alt" style={{ marginRight: '0.75rem' }}></i>
              Interaction Alerts
            </h3>
            <div className="modal-contents alerts-modal-content">
              <DDIAlertSystem
                patientId={patientId}
                currentMedications={activeMedications}
                conditions={[...currentConditions, ...pastConditions]}
                allergies={allergies}
                patientAge={calculateAgeFromDOB(patientBio.dob)}
                patientGender={patientBio.gender}
                onAlertsUpdate={(alerts) => setActiveAlertsCount(alerts.length)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Usage Indicator */}
      <DoctorUsageIndicator
        hasOwnKey={apiUsage.hasOwnKey}
        remaining={apiUsage.remaining}
        limit={apiUsage.limit}
        usage={apiUsage.usage}
        onSettingsClick={() => setShowSettings(true)}
      />

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
              return userData?._id || userData?.id || '';
            })()} />
          </div>
        </div>
      )}

      {/* Exhausted Modal */}
      {showExhaustedModal && (
        <ExhaustedModal
          onClose={() => setShowExhaustedModal(false)}
          onAddKey={() => {
            setShowExhaustedModal(false);
            setShowSettings(true);
          }}
          isFreeTier={isFreeTierExhausted}
        />
      )}

      {/* Chatbot Button - Same as Doctor Portal */}
      <div className="chatbot-container">
        <div className="chatbot-button" onClick={() => navigate('/chatbot')}>
          <i className="fas fa-robot"></i>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
