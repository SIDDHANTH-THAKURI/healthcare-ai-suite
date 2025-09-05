import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './MedMatchDoctorPortal.css';
import './PatientDetails.css';
import { DocSidebar } from './PortalSidebar';
import { BASE_URL_1, BASE_URL_2 } from '../base';
import { decodePatientId, isValidPatientIdFormat } from '../utils/patientSecurity';
import { logger } from '../utils/logger';

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
  status?: string;
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

interface LocationState {
  alerts?: { ddi: string[], pdi: string[] };
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
  const location = useLocation() as { state?: LocationState };
  const [initialAlertsShown, setInitialAlertsShown] = useState(false);

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

  const [alertData, setAlertData] = useState<{ ddi: string[], pdi: string[] }>({ ddi: [], pdi: [] });
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!patientId || !isValidPatientIdFormat(patientId)) {
      logger.patientValidation(patientId || 'null', false, 'Invalid patient ID format');
      setError('Invalid patient ID');
      navigate('/MedMatchDoctorPortal');
      return;
    }

    logger.patientValidation(patientId, true, 'Patient ID format valid');

    if (!initialAlertsShown && location.state?.alerts) {
      setAlertData(location.state.alerts);
      setShowAlertModal(true);
      setInitialAlertsShown(true);
      window.history.replaceState({}, document.title);
    }

    if (!location.state?.alerts) {
      fetch(`${BASE_URL_2}/api/check-alerts?patientId=${patientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.ddi.length || data.pdi.length) {
            setAlertData(data);
          }
        })
        .catch(err => console.error("Alert fetch failed:", err));
    }

    // Fetch doctor profile
    fetch(`${BASE_URL_1}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.doctorProfile) {
          setDoctorProfile(data.doctorProfile);
          setEditForm(data.doctorProfile);
        }
      })
      .catch(() => setError('Failed to fetch doctor profile'));

    // Validate patient access first
    fetch(`${BASE_URL_1}/api/patients/${patientId}/validate`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Access validation failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.hasAccess && data.patient) {
          setPatientBio(data.patient);
          setHasAccess(true);
          logger.patientDataFetch(patientId, 'validate', true, { patientName: data.patient.name });
        } else {
          throw new Error('Access denied - no patient data returned');
        }
      })
      .catch((error) => {
        logger.patientDataFetch(patientId, 'validate', false, { error: error.message });

        // Try to fetch patient data directly from the patients list as fallback
        fetch(`${BASE_URL_1}/api/patients`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            if (data.patients) {
              const patient = data.patients.find((p: Patient) => p.id === patientId);
              if (patient) {
                setPatientBio(patient);
                setHasAccess(true);
                setError(null);
                return;
              }
            }
            throw new Error('Patient not found in fallback');
          })
          .catch(() => {
            setError('Patient not found or access denied');
            setTimeout(() => {
              navigate('/MedMatchDoctorPortal');
            }, 3000);
          });
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
        if (data.prescription?.medicines) {
          setCurrentMedications(data.prescription.medicines);
          logger.patientDataFetch(patientId, 'prescriptions', true, {
            medicineCount: data.prescription.medicines.length
          });
        }
      })
      .catch((error) => {
        logger.patientDataFetch(patientId, 'prescriptions', false, { error: error.message });
        setError('Failed to fetch prescriptions');
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
          // Apply latest structured data
          const latest = sortedNotes[0];
          if (latest?.structured) {
            setCurrentMedications(latest.structured.medications || []);
            setCurrentConditions(latest.structured.conditions?.current || []);
            setPastConditions(latest.structured.conditions?.past || []);
            setAllergies(latest.structured.allergies || []);
          }
        }
      })
      .catch(() => setError('Failed to fetch patient history'));

    return () => {
      setAlertData({ ddi: [], pdi: [] });
      setInitialAlertsShown(false);
    };
  }, [patientId]);



  const handleSaveNote = async () => {
    if (!noteInput.trim()) return;
    setError(null);
    setIsLoading(true); // 🔄 Show loading
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL_2}/api/patient-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId, notes: noteInput })
      });

      const result = await res.json();
      if (res.ok && result.note) {
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
      } else {
        setError('Failed to save note');
      }
    } catch (err) {
      setError('Error saving note');
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
      } else {
        setError('Failed to delete note');
      }
    } catch (err) {
      setError('Error deleting note');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;
    setError(null);
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
      } else {
        setError('Failed to update note');
      }
    } catch (err) {
      setError('Error updating note');
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
              onClick={() => navigate('/MedMatchDoctorPortal')}
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
      <div className="loading-page-container">
        <div className="loading-content-page">
          <div className="loading-spinner-page">
            <div className="spinner-ring-page"></div>
            <div className="spinner-ring-page"></div>
            <div className="spinner-ring-page"></div>
          </div>
          <h3>Loading Patient Details</h3>
          <p>Please wait while we securely fetch the patient information...</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
          <p className="patient-id-info">
            Patient ID: {patientId || 'Validating...'}
          </p>
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
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>Loading... Please wait.</p>
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
                  <span className="meta-value">{patientBio.age} years</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-venus-mars"></i>
                  <span className="meta-label">Gender</span>
                  <span className="meta-value">{patientBio.gender}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span className="meta-label">Date of Birth</span>
                  <span className="meta-value">{patientBio.dob}</span>
                </div>
              </div>
            </div>
            <div className="patient-actions">
              <button className="alert-btn-modern" onClick={() => setShowAlertModal(true)}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>Alerts</span>
                {alertData.ddi.length + alertData.pdi.length > 0 && (
                  <span className="alert-badge">{alertData.ddi.length + alertData.pdi.length}</span>
                )}
              </button>
              <button className="prescription-btn" onClick={() => navigate('/create-prescription', { state: { patientId } })}>
                <i className="fas fa-prescription-bottle-alt"></i>
                <span>Manage Prescription</span>
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

            {/* Current Medications */}
            <section className="modern-card medications-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <h3>Current Medications</h3>
                <div className="header-actions">
                  <span className="medication-count">{currentMedications.length} active</span>
                </div>
              </div>

              {currentMedications.length ? (
                <div className="medications-grid">
                  {currentMedications.map((med, idx) => (
                    <div key={idx} className="medication-item">
                      <div className="medication-header">
                        <h4 className="medication-name">{med.name || 'Unknown Medication'}</h4>
                        <span className={`medication-status ${(med.status || 'active').toLowerCase()}`}>
                          {med.status || 'Active'}
                        </span>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-prescription-bottle"></i>
                  <p>No current medications</p>
                  <span>Add medications via prescription management</span>
                </div>
              )}
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

      {showAlertModal && (
        <div className="modal-backdrop">
          <div className="alert-modal">
            <div className="alert-modal-header">
              <div className="alert-modal-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Interaction & History Alerts</h2>
            </div>

            <div className="alert-modal-content">
              {alertData.ddi.length === 0 && alertData.pdi.length === 0 ? (
                <div className="no-alerts-state">
                  <i className="fas fa-shield-alt"></i>
                  <h3>All Clear!</h3>
                  <p>No drug interactions or contraindications detected for this patient.</p>
                </div>
              ) : (
                <>
                  <div className="alert-card">
                    <div className="alert-card-header">
                      <div className="alert-card-icon">
                        <i className="fas fa-pills"></i>
                      </div>
                      <h3>Drug–Drug Interaction Alerts</h3>
                    </div>
                    {alertData.ddi.length ? alertData.ddi.map((a, i) => <p key={i}>{a}</p>) : <p>No DDI alerts detected.</p>}
                  </div>

                  <div className="alert-card">
                    <div className="alert-card-header">
                      <div className="alert-card-icon">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <h3>Patient History Alerts</h3>
                    </div>
                    {alertData.pdi.length ? alertData.pdi.map((a, i) => <p key={i}>{a}</p>) : <p>No contraindication alerts detected.</p>}
                  </div>
                </>
              )}
            </div>

            <div className="alert-modal-footer">
              <button className="close-btn" onClick={() => setShowAlertModal(false)}>
                <i className="fas fa-check"></i>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;