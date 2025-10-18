import React, { useState, useEffect } from 'react';
import './PatientProfileView.css';

interface PatientProfile {
  _id?: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    bloodType: string;
    profilePicture?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      prescribedBy: string;
    }>;
  };
  lifestyle: {
    height: number;
    weight: number;
    activityLevel: string;
    sleepHours: number;
    smokingStatus: string;
    alcoholConsumption: string;
  };
}

interface Props {
  onClose: () => void;
}

const PatientProfileView: React.FC<Props> = ({ onClose }) => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';
      const response = await fetch(`http://localhost:5000/api/patient-profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    try {
      const response = await fetch(`http://localhost:5000/api/patient-profile/${editedProfile.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile)
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="profile-modal">
        <div className="profile-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${profile.personalInfo.firstName[0]}${profile.personalInfo.lastName[0]}`;

  return (
    <div className="profile-modal" onClick={onClose}>
      <div className="profile-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <div className="profile-avatar-large">{initials}</div>
          <h2>{profile.personalInfo.firstName} {profile.personalInfo.lastName}</h2>
          <p className="profile-id">Patient ID: {profile._id?.slice(-6).toUpperCase()}</p>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>
                <i className="fas fa-check"></i> Save
              </button>
              <button className="cancel-btn" onClick={() => { setIsEditing(false); setEditedProfile(profile); }}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-sections">
          {/* Personal Info */}
          <div className="profile-section">
            <h3><i className="fas fa-user"></i> Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    value={editedProfile?.personalInfo.firstName}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, personalInfo: {...prev.personalInfo, firstName: e.target.value}} : null)}
                  />
                ) : (
                  <p>{profile.personalInfo.firstName}</p>
                )}
              </div>
              <div className="info-item">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    value={editedProfile?.personalInfo.lastName}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, personalInfo: {...prev.personalInfo, lastName: e.target.value}} : null)}
                  />
                ) : (
                  <p>{profile.personalInfo.lastName}</p>
                )}
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <p>{new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <p>{profile.personalInfo.gender}</p>
              </div>
              <div className="info-item">
                <label>Blood Type</label>
                <p>{profile.personalInfo.bloodType || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="profile-section">
            <h3><i className="fas fa-phone"></i> Contact Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    value={editedProfile?.contactInfo.phone}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, contactInfo: {...prev.contactInfo, phone: e.target.value}} : null)}
                  />
                ) : (
                  <p>{profile.contactInfo.phone}</p>
                )}
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{profile.contactInfo.email}</p>
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                {isEditing ? (
                  <input
                    value={editedProfile?.contactInfo.address}
                    onChange={(e) => setEditedProfile(prev => prev ? {...prev, contactInfo: {...prev.contactInfo, address: e.target.value}} : null)}
                  />
                ) : (
                  <p>{profile.contactInfo.address || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="profile-section">
            <h3><i className="fas fa-heartbeat"></i> Medical Information</h3>
            <div className="info-item">
              <label>Allergies</label>
              <div className="tags">
                {profile.medicalInfo.allergies.length > 0 ? (
                  profile.medicalInfo.allergies.map((allergy, idx) => (
                    <span key={idx} className="tag allergy">{allergy}</span>
                  ))
                ) : (
                  <p>None reported</p>
                )}
              </div>
            </div>
            <div className="info-item">
              <label>Chronic Conditions</label>
              <div className="tags">
                {profile.medicalInfo.chronicConditions.length > 0 ? (
                  profile.medicalInfo.chronicConditions.map((condition, idx) => (
                    <span key={idx} className="tag condition">{condition}</span>
                  ))
                ) : (
                  <p>None reported</p>
                )}
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="profile-section">
            <h3><i className="fas fa-running"></i> Lifestyle</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Height</label>
                <p>{profile.lifestyle.height} cm</p>
              </div>
              <div className="info-item">
                <label>Weight</label>
                <p>{profile.lifestyle.weight} kg</p>
              </div>
              <div className="info-item">
                <label>Activity Level</label>
                <p>{profile.lifestyle.activityLevel}</p>
              </div>
              <div className="info-item">
                <label>Sleep Hours</label>
                <p>{profile.lifestyle.sleepHours} hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileView;
