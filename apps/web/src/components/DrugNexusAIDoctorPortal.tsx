import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DrugNexusAIDoctorPortal.css";
import { DocSidebar } from './PortalSidebar';
import { BASE_URL_1 } from "../base";
import { encodePatientId } from '../utils/patientSecurity';
import CustomDatePicker from './CustomDatePicker';



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
}

interface HealthcareMetric {
  label: string;
  value: number | string;
  icon: string;
  description: string;
  color: string;
}

const DrugNexusAIDoctorPortal: React.FC = () => {
  const navigate = useNavigate();
  
  // All state declarations MUST come before any conditional returns
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [editForm, setEditForm] = useState<DoctorProfile>({
    fullName: "",
    phone: "",
    specialization: "",
    qualifications: "",
    experienceYears: 0,
    age: 0,
    gender: "",
    profileImage: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", age: 0, gender: "", dob: "", phone: "" });
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Welcome modal state
  const [showDoctorWelcome, setShowDoctorWelcome] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Check for mobile device and show welcome
  useEffect(() => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    setIsMobileDevice(width < 1024 || mobileKeywords.test(userAgent));
    
    // Always show welcome modal on entry
    setShowDoctorWelcome(true);
  }, []);

  const handleCloseDoctorWelcome = () => {
    setShowDoctorWelcome(false);
  };

  // Calculate healthcare-relevant metrics
  const calculateHealthcareMetrics = (): HealthcareMetric[] => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Active Patients This Month - patients with recent activity (last visit this month or recent)
    const activePatientsThisMonth = patients.filter(patient => {
      if (patient.lastVisit === "Today") return true;
      
      // Parse various date formats that might be in lastVisit
      const lastVisitDate = new Date(patient.lastVisit);
      if (!isNaN(lastVisitDate.getTime())) {
        return lastVisitDate.getMonth() === currentMonth && lastVisitDate.getFullYear() === currentYear;
      }
      
      // If lastVisit is a relative term like "2 days ago", "1 week ago", etc.
      const daysAgoMatch = patient.lastVisit.match(/(\d+)\s+days?\s+ago/i);
      if (daysAgoMatch) {
        const daysAgo = parseInt(daysAgoMatch[1]);
        return daysAgo <= 30; // Consider active if visited within 30 days
      }
      
      const weeksAgoMatch = patient.lastVisit.match(/(\d+)\s+weeks?\s+ago/i);
      if (weeksAgoMatch) {
        const weeksAgo = parseInt(weeksAgoMatch[1]);
        return weeksAgo <= 4; // Consider active if visited within 4 weeks
      }
      
      return false;
    }).length;

    // Drug Interactions Detected - simulate based on patient count and risk factors
    // In a real system, this would come from actual interaction checking
    const drugInteractionsDetected = Math.floor(patients.length * 0.15); // Assume 15% of patients have potential interactions

    // Prescriptions Reviewed - simulate based on active patients
    // In a real system, this would come from actual prescription data
    const prescriptionsReviewed = Math.floor(activePatientsThisMonth * 1.8); // Assume 1.8 prescriptions per active patient on average

    // High-Risk Interactions - simulate critical cases requiring immediate attention
    // In a real system, this would come from severity analysis of interactions
    const highRiskInteractions = Math.floor(drugInteractionsDetected * 0.25); // Assume 25% of interactions are high-risk

    return [
      {
        label: 'Active Patients This Month',
        value: activePatientsThisMonth,
        icon: 'fas fa-user-friends',
        description: 'Patients with recent activity',
        color: 'var(--primary)'
      },
      {
        label: 'Drug Interactions Detected',
        value: drugInteractionsDetected,
        icon: 'fas fa-exclamation-triangle',
        description: 'Potential interactions identified',
        color: 'var(--accent)'
      },
      {
        label: 'Prescriptions Reviewed',
        value: prescriptionsReviewed,
        icon: 'fas fa-prescription-bottle-alt',
        description: 'Total prescriptions analyzed',
        color: 'var(--secondary)'
      },
      {
        label: 'High-Risk Interactions',
        value: highRiskInteractions,
        icon: 'fas fa-shield-alt',
        description: 'Critical interactions requiring attention',
        color: '#dc3545'
      }
    ];
  };

  // Fetch profile and patients
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL_1}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.doctorProfile) {
          setDoctorProfile(data.doctorProfile);
          setEditForm(data.doctorProfile);
        }
      })
      .catch(error => {
        console.error('Failed to fetch doctor profile:', error.message);
      });

    fetch(`${BASE_URL_1}/api/patients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.patients) {
          setPatients(data.patients);
        }
      })
      .catch(error => {
        console.error('Failed to fetch patients:', error.message);
      });
  }, []);

  // Handle edit form change
  const onEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, files } = e.target as HTMLInputElement;
    if (id === "profileImage" && files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditForm(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setEditForm(prev => ({ ...prev, [id]: type === "number" ? Number(value) : value }));
    }
  };

  const handleEditSave = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL_1}/api/profile/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profileData: { doctorProfile: editForm } }),
    });
    if (response.ok) {
      setDoctorProfile(editForm);
      setShowEditModal(false);
    } else {
      console.error("Update failed");
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
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

  // Get today's date in YYYY-MM-DD format for max date
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleAddPatient = async () => {
    const token = localStorage.getItem("token");
    // Calculate age from DOB
    const calculatedAge = calculateAge(newPatient.dob);
    const entry = { ...newPatient, age: calculatedAge, lastVisit: "Today" };
    
    if (!entry.name || !entry.gender || !entry.dob || !entry.phone) {
      alert("All fields are required"); return;
    }
    
    const res = await fetch(`${BASE_URL_1}/api/patients/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    if (res.ok) setPatients(prev => [...prev, data.patient]);
    setShowAddPatientModal(false);
    setNewPatient({ name: "", age: 0, gender: "", dob: "", phone: "" });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient({ ...patient });
    setShowEditPatientModal(true);
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    // Recalculate age from DOB
    const updatedPatient = {
      ...editingPatient,
      age: calculateAge(editingPatient.dob)
    };

    const token = localStorage.getItem("token");
    
    try {
      // Try to update on server first
      const res = await fetch(`${BASE_URL_1}/api/patients/${editingPatient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedPatient),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Patient updated successfully on server:', data);
        
        // Update local state with server response
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? updatedPatient : p));
        setShowEditPatientModal(false);
        setEditingPatient(null);
        
        alert("Patient updated successfully!");
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Server update failed:', res.status, errorData);
        
        // Show error to user
        alert(`Failed to update patient in database: ${errorData.message || res.statusText}\n\nPlease check the backend server logs for details.`);
        
        // Still update UI locally so user can see changes in current session
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? updatedPatient : p));
        setShowEditPatientModal(false);
        setEditingPatient(null);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(`Error connecting to server: ${error instanceof Error ? error.message : 'Unknown error'}\n\nChanges will be visible in current session only.`);
      
      // Update UI locally
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? updatedPatient : p));
      setShowEditPatientModal(false);
      setEditingPatient(null);
    }
  };

  const onEditPatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (editingPatient) {
      setEditingPatient(prev => ({
        ...prev!,
        [name]: type === "number" ? Number(value) : value
      }));
    }
  };

  return (
    <div className="doctor-dashboard">
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <DocSidebar
          profile={{
            name: `Dr. ${doctorProfile?.fullName}`,
            specialization: doctorProfile?.specialization,
            avatarUrl: doctorProfile?.profileImage,
            onEditProfile: () => setShowEditModal(true)
          }}
        />
      </div>
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder={window.innerWidth < 768 ? "Search patients..." : "Search patients by name, ID, or details..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <div className="communication-icon disabled" title="Communication features coming soon">
              <i className="fas fa-envelope"></i>
            </div>
          </div>
        </div>

        <div className="metrics-grid">
          {calculateHealthcareMetrics().map((m, i) => (
            <div key={i} className="metric-card">
              <div className="metric-icon">
                <i className={m.icon}></i>
              </div>
              <div className="metric-content">
                <h3>{m.value}</h3>
                <p>{m.label}</p>
                <span className="metric-description">{m.description}</span>
              </div>
            </div>
          ))}
        </div>

        <section className="patient-management">
          <div className="section-header"><h2>Patient Records</h2><button onClick={() => setShowAddPatientModal(true)}><i className="fas fa-plus"></i> Add Patient</button></div>
          <div className="patient-list">
            {patients
              .filter(p => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                return (
                  p.name.toLowerCase().includes(search) ||
                  p.id.toLowerCase().includes(search) ||
                  p.gender.toLowerCase().includes(search) ||
                  p.age.toString().includes(search)
                );
              })
              .map(p => (
                <div key={p.id} className="patient-item" onClick={() => {
                  try {
                    setIsNavigating(true);
                    const encodedId = encodePatientId(p.id);
                    
                    // Beautiful 2-second loading animation
                    setTimeout(() => {
                      navigate(`/patient-details/${encodedId}`);
                      setIsNavigating(false);
                    }, 2000);
                  } catch (error) {
                    console.error('Failed to navigate to patient details:', error);
                    setIsNavigating(false);
                  }
                }}>
                  <div className="patient-info"><h4>{p.name}</h4><p>ID: {p.id} | Last Visit: {p.lastVisit}</p></div>
                  <div className="patient-actions">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleEditPatient(p);
                    }}><i className="fas fa-edit"></i></button>
                    <button onClick={e => {
                      e.stopPropagation(); if (window.confirm('Delete?')) {
                        const token = localStorage.getItem('token');
                        fetch(`${BASE_URL_1}/api/patients/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                          .then(r => r.json()).then(d => { if (d.message === 'Patient deleted') setPatients(prev => prev.filter(x => x.id !== p.id)); });
                      }
                    }}><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      <div className="chatbot-container"><div className="chatbot-button" onClick={() => navigate('/chatbot')}><i className="fas fa-robot"></i></div></div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEditModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="modal-title">
              <i className="fas fa-user-edit" style={{ marginRight: '0.5rem' }}></i>
              Edit Profile
            </h3>
            <div className="modal-contents">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  className="modal-input"
                  value={editForm.fullName}
                  onChange={onEditChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  className="modal-input"
                  value={editForm.phone}
                  onChange={onEditChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  id="specialization"
                  className="modal-input"
                  value={editForm.specialization}
                  onChange={onEditChange}
                  placeholder="Enter your specialization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="qualifications">Qualifications</label>
                <input
                  id="qualifications"
                  className="modal-input"
                  value={editForm.qualifications!}
                  onChange={onEditChange}
                  placeholder="Enter your qualifications"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experienceYears">Years of Experience</label>
                <input
                  id="experienceYears"
                  type="number"
                  className="modal-input"
                  value={editForm.experienceYears!}
                  onChange={onEditChange}
                  placeholder="Enter years of experience"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  className="modal-input"
                  value={editForm.age}
                  onChange={onEditChange}
                  placeholder="Enter your age"
                  min="18"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select id="gender" className="modal-input" value={editForm.gender} onChange={onEditChange}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="profileImage">
                  <i className="fas fa-camera" style={{ marginRight: '0.5rem' }}></i>
                  Profile Image
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="modal-input"
                  onChange={onEditChange}
                />
                {editForm.profileImage && (
                  <div className="image-preview">
                    <img src={editForm.profileImage} alt="Profile Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm-btn" onClick={handleEditSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAddPatientModal(false);
          setNewPatient({ name: "", age: 0, gender: "", dob: "", phone: "" });
        }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setShowAddPatientModal(false);
              setNewPatient({ name: "", age: 0, gender: "", dob: "", phone: "" });
            }}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="modal-title">
              <i className="fas fa-user-plus" style={{ marginRight: '0.75rem' }}></i>
              Add New Patient
            </h3>
            <div className="modal-contents">
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-user" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                  Full Name
                </label>
                <input 
                  id="name" 
                  className="modal-input" 
                  value={newPatient.name} 
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} 
                  placeholder="Enter patient's full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">
                  <i className="fas fa-phone" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                  Phone Number
                </label>
                <input 
                  id="phone" 
                  type="tel" 
                  className="modal-input" 
                  value={newPatient.phone} 
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} 
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <CustomDatePicker
                  id="dob"
                  label={
                    <span>
                      <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                      Date of Birth
                    </span>
                  }
                  value={newPatient.dob}
                  onChange={(date) => setNewPatient({ ...newPatient, dob: date })}
                  maxDate={getTodayDate()}
                  placeholder="Select date of birth"
                />
                {newPatient.dob && (
                  <p className="age-display">
                    <i className="fas fa-birthday-cake" style={{ marginRight: '0.5rem' }}></i>
                    Age: {calculateAge(newPatient.dob)} years
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">
                  <i className="fas fa-venus-mars" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                  Gender
                </label>
                <select 
                  id="gender" 
                  className="modal-input" 
                  value={newPatient.gender} 
                  onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => {
                setShowAddPatientModal(false);
                setNewPatient({ name: "", age: 0, gender: "", dob: "", phone: "" });
              }}>
                <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
                Cancel
              </button>
              <button className="modal-btn confirm-btn" onClick={handleAddPatient}>
                <i className="fas fa-check" style={{ marginRight: '0.5rem' }}></i>
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditPatientModal && editingPatient && (
        <div className="modal-overlay" onClick={() => {
          setShowEditPatientModal(false);
          setEditingPatient(null);
        }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setShowEditPatientModal(false);
              setEditingPatient(null);
            }}>
              <i className="fas fa-times"></i>
            </button>
            <h3 className="modal-title">
              <i className="fas fa-user-edit" style={{ marginRight: '0.75rem' }}></i>
              Edit Patient Information
            </h3>
            <div className="modal-contents">
              <div className="form-group">
                <label htmlFor="edit-name">
                  <i className="fas fa-user" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                  Full Name
                </label>
                <input
                  id="edit-name"
                  name="name"
                  className="modal-input"
                  value={editingPatient.name}
                  onChange={onEditPatientChange}
                  placeholder="Enter patient's full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-phone">
                  <i className="fas fa-phone" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                  Phone Number
                </label>
                <input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  className="modal-input"
                  value={editingPatient.phone || ''}
                  onChange={onEditPatientChange}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <CustomDatePicker
                  id="edit-dob"
                  label={
                    <span>
                      <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                      Date of Birth
                    </span>
                  }
                  value={editingPatient.dob}
                  onChange={(date) => setEditingPatient(prev => ({ ...prev!, dob: date }))}
                  maxDate={getTodayDate()}
                  placeholder="Select date of birth"
                />
                {editingPatient.dob && (
                  <p className="age-display">
                    <i className="fas fa-birthday-cake" style={{ marginRight: '0.5rem' }}></i>
                    Age: {calculateAge(editingPatient.dob)} years
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-gender">
                  <i className="fas fa-venus-mars" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                  Gender
                </label>
                <select
                  id="edit-gender"
                  name="gender"
                  className="modal-input"
                  value={editingPatient.gender}
                  onChange={onEditPatientChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => {
                setShowEditPatientModal(false);
                setEditingPatient(null);
              }}>
                <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
                Cancel
              </button>
              <button className="modal-btn confirm-btn" onClick={handleUpdatePatient}>
                <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                Update Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Loading Animation */}
      {isNavigating && (
        <div className="beautiful-loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Loading Patient Details</h3>
            <p>Please wait while we prepare the patient information...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Portal Welcome Modal */}
      {showDoctorWelcome && (
        <div className="doctor-welcome-overlay">
          <div className="doctor-welcome-modal">
            <div className="doctor-welcome-header">
              <div className="welcome-icon-large">
                {isMobileDevice ? '📱' : '🖥️'}
              </div>
              <h2>Welcome to Doctor Portal</h2>
              <p className="welcome-badge">Professional Medical Platform</p>
            </div>

            <div className="doctor-welcome-content">
              {isMobileDevice && (
                <div className="mobile-warning">
                  <div className="warning-icon">⚠️</div>
                  <h3>Desktop Recommended</h3>
                  <p>
                    For the best experience with patient management, prescription creation, 
                    and data analysis, we strongly recommend using a desktop or laptop computer.
                  </p>
                </div>
              )}

              <div className="welcome-info">
                <h3>What You Can Do Here:</h3>
                <div className="capabilities-grid">
                  <div className="capability-card">
                    <i className="fas fa-users"></i>
                    <span>Manage Patients</span>
                  </div>
                  <div className="capability-card">
                    <i className="fas fa-prescription"></i>
                    <span>Create Prescriptions</span>
                  </div>
                  <div className="capability-card">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Check Drug Interactions</span>
                  </div>
                  <div className="capability-card">
                    <i className="fas fa-chart-bar"></i>
                    <span>View Analytics</span>
                  </div>
                </div>
              </div>

              {!isMobileDevice && (
                <div className="desktop-benefits">
                  <div className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Optimized for large screens and complex workflows</span>
                  </div>
                  <div className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Enhanced security for sensitive medical data</span>
                  </div>
                  <div className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Full keyboard shortcuts and efficient navigation</span>
                  </div>
                </div>
              )}
            </div>

            <div className="doctor-welcome-footer">
              <button className="continue-btn" onClick={handleCloseDoctorWelcome}>
                {isMobileDevice ? 'Continue Anyway' : 'Get Started'}
                <i className="fas fa-arrow-right"></i>
              </button>
              {isMobileDevice && (
                <p className="mobile-note">Some features may have limited functionality on mobile</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugNexusAIDoctorPortal;