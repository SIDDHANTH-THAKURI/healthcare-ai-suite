import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientProfileSetup.css';
import CustomDatePicker from './CustomDatePicker';
import { BASE_URL_1 } from '../base';


interface ProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodType: string;
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
  };
  lifestyle: {
    height: string;
    weight: string;
    activityLevel: string;
    sleepHours: string;
    smokingStatus: string;
    alcoholConsumption: string;
  };
}

const PatientProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      bloodType: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    medicalInfo: {
      allergies: [],
      chronicConditions: []
    },
    lifestyle: {
      height: '',
      weight: '',
      activityLevel: '',
      sleepHours: '',
      smokingStatus: '',
      alcoholConsumption: ''
    }
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const validateStep = () => {
    if (step === 1) {
      if (!profileData.personalInfo.firstName || !profileData.personalInfo.lastName ||
        !profileData.personalInfo.dateOfBirth || !profileData.personalInfo.gender) {
        alert('Please fill in all required fields (marked with *)');
        return false;
      }
    }
    if (step === 2) {
      if (!profileData.contactInfo.phone || !profileData.contactInfo.email ||
        !profileData.contactInfo.emergencyContact.name ||
        !profileData.contactInfo.emergencyContact.relationship ||
        !profileData.contactInfo.emergencyContact.phone) {
        alert('Please fill in all required fields (marked with *)');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep() && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Get user ID from localStorage or use demo
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';

      // Convert string values to numbers for backend
      const submissionData = {
        userId,
        personalInfo: {
          ...profileData.personalInfo,
          dateOfBirth: new Date(profileData.personalInfo.dateOfBirth).toISOString()
        },
        contactInfo: profileData.contactInfo,
        medicalInfo: profileData.medicalInfo,
        lifestyle: {
          ...profileData.lifestyle,
          height: profileData.lifestyle.height ? parseFloat(profileData.lifestyle.height) : undefined,
          weight: profileData.lifestyle.weight ? parseFloat(profileData.lifestyle.weight) : undefined,
          sleepHours: profileData.lifestyle.sleepHours ? parseFloat(profileData.lifestyle.sleepHours) : undefined
        },
        onboardingCompleted: true
      };


      const API_URL = BASE_URL_1;
      const response = await fetch(`${API_URL}/api/patient-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });


      if (response.ok) {
        const data = await response.json();
        // Use React Router navigation instead of window.location.href
        navigate('/patient-portal');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Error saving profile: ${errorData.message || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save profile. Please check if the backend is running.'}`);
      setIsSubmitting(false);
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setProfileData({
        ...profileData,
        medicalInfo: {
          ...profileData.medicalInfo,
          allergies: [...profileData.medicalInfo.allergies, allergyInput.trim()]
        }
      });
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setProfileData({
      ...profileData,
      medicalInfo: {
        ...profileData.medicalInfo,
        allergies: profileData.medicalInfo.allergies.filter((_, i) => i !== index)
      }
    });
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setProfileData({
        ...profileData,
        medicalInfo: {
          ...profileData.medicalInfo,
          chronicConditions: [...profileData.medicalInfo.chronicConditions, conditionInput.trim()]
        }
      });
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    setProfileData({
      ...profileData,
      medicalInfo: {
        ...profileData.medicalInfo,
        chronicConditions: profileData.medicalInfo.chronicConditions.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="profile-setup">
      <div className="setup-container">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        <div className="setup-header">
          <h1>Welcome! Let's set up your profile</h1>
          <p>Step {step} of {totalSteps}</p>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="setup-step">
            <h2>📋 Personal Information</h2>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={profileData.personalInfo.firstName}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, firstName: e.target.value }
                })}
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={profileData.personalInfo.lastName}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, lastName: e.target.value }
                })}
                placeholder="Enter your last name"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <CustomDatePicker
                id="dateOfBirth"
                label="Date of Birth *"
                value={profileData.personalInfo.dateOfBirth}
                onChange={(date) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, dateOfBirth: date }
                })}
                maxDate={new Date().toISOString().split('T')[0]}
                placeholder="Select your date of birth"
              />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select
                value={profileData.personalInfo.gender}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, gender: e.target.value }
                })}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <select
                value={profileData.personalInfo.bloodType}
                onChange={(e) => setProfileData({
                  ...profileData,
                  personalInfo: { ...profileData.personalInfo, bloodType: e.target.value }
                })}
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <div className="setup-step">
            <h2>📞 Contact Information</h2>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={profileData.contactInfo.phone}
                onChange={(e) => setProfileData({
                  ...profileData,
                  contactInfo: { ...profileData.contactInfo, phone: e.target.value }
                })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={profileData.contactInfo.email}
                onChange={(e) => setProfileData({
                  ...profileData,
                  contactInfo: { ...profileData.contactInfo, email: e.target.value }
                })}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={profileData.contactInfo.address}
                onChange={(e) => setProfileData({
                  ...profileData,
                  contactInfo: { ...profileData.contactInfo, address: e.target.value }
                })}
                placeholder="Street address, City, State, ZIP"
                rows={3}
              />
            </div>
            <h3>Emergency Contact</h3>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={profileData.contactInfo.emergencyContact.name}
                onChange={(e) => setProfileData({
                  ...profileData,
                  contactInfo: {
                    ...profileData.contactInfo,
                    emergencyContact: { ...profileData.contactInfo.emergencyContact, name: e.target.value }
                  }
                })}
                placeholder="Emergency contact name"
              />
            </div>
            <div className="form-group">
              <label>Relationship *</label>
              <input
                type="text"
                value={profileData.contactInfo.emergencyContact.relationship}
                onChange={(e) => setProfileData({
                  ...profileData,
                  contactInfo: {
                    ...profileData.contactInfo,
                    emergencyContact: { ...profileData.contactInfo.emergencyContact, relationship: e.target.value }
                  }
                })}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={profileData.contactInfo.emergencyContact.phone}
                onChange={(e) => setProfileData({
                  ...profileData,
                  contactInfo: {
                    ...profileData.contactInfo,
                    emergencyContact: { ...profileData.contactInfo.emergencyContact, phone: e.target.value }
                  }
                })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        )}

        {/* Step 3: Medical Information */}
        {step === 3 && (
          <div className="setup-step">
            <h2>💊 Medical Information</h2>
            <div className="form-group">
              <label>Allergies</label>
              <div className="tag-input">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  placeholder="Type and press Enter"
                />
                <button type="button" onClick={addAllergy} className="add-btn">Add</button>
              </div>
              <div className="tags">
                {profileData.medicalInfo.allergies.map((allergy, index) => (
                  <span key={index} className="tag">
                    {allergy}
                    <button onClick={() => removeAllergy(index)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Chronic Conditions</label>
              <div className="tag-input">
                <input
                  type="text"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  placeholder="Type and press Enter"
                />
                <button type="button" onClick={addCondition} className="add-btn">Add</button>
              </div>
              <div className="tags">
                {profileData.medicalInfo.chronicConditions.map((condition, index) => (
                  <span key={index} className="tag">
                    {condition}
                    <button onClick={() => removeCondition(index)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Lifestyle */}
        {step === 4 && (
          <div className="setup-step">
            <h2>🏃 Lifestyle Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  value={profileData.lifestyle.height}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    lifestyle: { ...profileData.lifestyle, height: e.target.value }
                  })}
                  placeholder="170"
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.lifestyle.weight}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    lifestyle: { ...profileData.lifestyle, weight: e.target.value }
                  })}
                  placeholder="70"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              <select
                value={profileData.lifestyle.activityLevel}
                onChange={(e) => setProfileData({
                  ...profileData,
                  lifestyle: { ...profileData.lifestyle, activityLevel: e.target.value }
                })}
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
                <option value="very-active">Very Active (intense exercise daily)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Average Sleep Hours</label>
              <input
                type="number"
                value={profileData.lifestyle.sleepHours}
                onChange={(e) => setProfileData({
                  ...profileData,
                  lifestyle: { ...profileData.lifestyle, sleepHours: e.target.value }
                })}
                placeholder="7-8"
                min="0"
                max="24"
              />
            </div>
            <div className="form-group">
              <label>Smoking Status</label>
              <select
                value={profileData.lifestyle.smokingStatus}
                onChange={(e) => setProfileData({
                  ...profileData,
                  lifestyle: { ...profileData.lifestyle, smokingStatus: e.target.value }
                })}
              >
                <option value="">Select status</option>
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alcohol Consumption</label>
              <select
                value={profileData.lifestyle.alcoholConsumption}
                onChange={(e) => setProfileData({
                  ...profileData,
                  lifestyle: { ...profileData.lifestyle, alcoholConsumption: e.target.value }
                })}
              >
                <option value="">Select frequency</option>
                <option value="none">None</option>
                <option value="occasional">Occasional (1-2 times/month)</option>
                <option value="moderate">Moderate (1-2 times/week)</option>
                <option value="frequent">Frequent (3+ times/week)</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="setup-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={handleBack}>
              ← Back
            </button>
          )}
          {step < totalSteps ? (
            <button className="btn-primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Complete Setup ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfileSetup;
