import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePrescription.css';
import { BASE_URL_1, BASE_URL_2 } from '../base';
import { encodePatientId } from '../utils/patientSecurity';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency?: string;
  frequencyType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | '';
  customFrequency?: string;
  timesOfDay?: string[];
  duration?: string;
  status?: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

interface LocationState {
  patientId: string;
}

interface MedicineFormProps {
  medicine: Medicine;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled: boolean;
  setMedicineName: (name: string) => void;
  availableMedicines: string[];
  filteredMedicines: string[];
  setShowDropdown: (show: boolean) => void;
  showDropdown: boolean;
}

const MedicineForm: React.FC<MedicineFormProps> = ({
  medicine,
  onChange,
  onSave,
  onCancel,
  saveDisabled,
  setMedicineName,
  availableMedicines,
  filteredMedicines,
  setShowDropdown,
  showDropdown
}) => {
  const [errors, setErrors] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });
  
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const frequencyDropdownRef = React.useRef<HTMLDivElement>(null);
  
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (frequencyDropdownRef.current && !frequencyDropdownRef.current.contains(event.target as Node)) {
        setShowFrequencyDropdown(false);
      }
    };

    if (showFrequencyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFrequencyDropdown]);

  const validateField = (field: string, value: string) => {
    let error = '';
    if (!value.trim()) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    // Removed strict validation for medicine name - allow any medicine name
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field: string, value: string) => {
    onChange(field, value);
    if (field === 'name') {
      setMedicineName(value);
      // Show dropdown when typing 3+ characters
      if (value.length >= 3) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }
    validateField(field, value);
  };

  const handleSelectMedicine = (medicine: string) => {
    onChange('name', medicine);
    setMedicineName(medicine);
    setShowDropdown(false);
    validateField('name', medicine);
  };

  return (
    <div className="medicine-form">
      <div className="form-group medicine-name-group">
        <label>Medicine Name *</label>
        <div className="dropdown-container">
          <input
            type="text"
            placeholder="e.g., Paracetamol (type 3+ letters to search)"
            value={medicine.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onFocus={() => {
              if (medicine.name.length >= 3 && filteredMedicines.length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
          />
          {showDropdown && filteredMedicines.length > 0 && (
            <ul className="dropdown-list">
              {filteredMedicines.slice(0, 10).map((med, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectMedicine(med);
                  }}
                >
                  {med}
                </li>
              ))}
            </ul>
          )}
          {showDropdown && medicine.name.length >= 3 && filteredMedicines.length === 0 && (
            <ul className="dropdown-list">
              <li className="dropdown-item no-results">
                No medicines found. You can still enter a custom name.
              </li>
            </ul>
          )}
        </div>
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>Dosage *</label>
        <input
          type="text"
          placeholder="e.g., 500 mg"
          value={medicine.dosage}
          onChange={(e) => handleInputChange('dosage', e.target.value)}
        />
        {errors.dosage && <span className="error-text">{errors.dosage}</span>}
      </div>
      <div className="form-group">
        <label>Frequency Type (Optional)</label>
        <div className="dropdown-container" ref={frequencyDropdownRef}>
          <div
            className="frequency-dropdown-trigger"
            onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
            style={{
              color: medicine.frequencyType ? undefined : 'rgba(43, 45, 66, 0.5)'
            }}
          >
            {medicine.frequencyType 
              ? frequencyOptions.find(opt => opt.value === medicine.frequencyType)?.label 
              : 'Select frequency type'}
          </div>
          {showFrequencyDropdown && (
            <ul className="dropdown-list">
              {frequencyOptions.map((option) => (
                <li
                  key={option.value}
                  className="dropdown-item"
                  onClick={() => {
                    onChange('frequencyType', option.value);
                    setShowFrequencyDropdown(false);
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="form-group">
        <label>Times of Day (Optional)</label>
        <div className="times-of-day-selector">
          {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
            <label key={time} className="checkbox-label">
              <input
                type="checkbox"
                checked={medicine.timesOfDay?.includes(time) || false}
                onChange={(e) => {
                  const currentTimes = medicine.timesOfDay || [];
                  const newTimes = e.target.checked
                    ? [...currentTimes, time]
                    : currentTimes.filter(t => t !== time);
                  onChange('timesOfDay', JSON.stringify(newTimes));
                }}
              />
              <span>{time}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Duration *</label>
        <input
          type="text"
          placeholder="e.g., 5 days"
          value={medicine.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
        />
        {errors.duration && <span className="error-text">{errors.duration}</span>}
      </div>
      <div className="form-actions">
        <button className="form-btn cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="form-btn save-btn"
          onClick={onSave}
          disabled={saveDisabled}
        >
          Save Medication
        </button>
      </div>
    </div>
  );
};

const CreatePrescription: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useLocation();
  const { patientId } = (state as LocationState) || { patientId: '' };

  const [currentMedicines] = useState<Medicine[]>([
    { id: 1, name: 'Morphine', dosage: '81 mg', frequency: 'Once daily', duration: '7 days' },
    { id: 2, name: 'Bivalirudin', dosage: '500 mg', frequency: 'Twice daily', duration: 'Ongoing' },
    { id: 3, name: 'Apixaban', dosage: '10 mg', frequency: 'Once daily', duration: '1 month' },
  ]);

  const [addedMedicines, setAddedMedicines] = useState<Medicine[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showNewMedicineForm, setShowNewMedicineForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    id: 0,
    name: '',
    dosage: '',
    frequencyType: undefined,
    customFrequency: '',
    timesOfDay: [],
    duration: ''
  });
  const [medicineName, setMedicineName] = useState('');
  const [availableMedicines, setAvailableMedicines] = useState<string[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Removed consultation note requirement - prescriptions can be saved independently


  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL_1}/api/medicines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableMedicines(
          response.data.map((drug: { name: string }) => drug.name)
        );
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setAvailableMedicines([]);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (medicineName.length >= 3) {
      const filtered = availableMedicines.filter(med =>
        med.toLowerCase().includes(medicineName.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines([]);
      setShowDropdown(false);
    }
  }, [medicineName, availableMedicines]);

  const handleAddChipClick = (med: Medicine) => {
    setEditingMedicine(med);
    setShowEditForm(true);
    setShowNewMedicineForm(false);
  };

  const isMedicineAdded = (id: number) => addedMedicines.some(med => med.id === id);

  const handleInputChange = (field: string, value: string) => {
    if (editingMedicine) {
      if (field === 'timesOfDay') {
        setEditingMedicine({ ...editingMedicine, timesOfDay: JSON.parse(value) });
      } else {
        setEditingMedicine({ ...editingMedicine, [field]: value });
      }
    }
  };

  const handleNewMedicineChange = (field: string, value: string) => {
    if (field === 'timesOfDay') {
      setNewMedicine({ ...newMedicine, timesOfDay: JSON.parse(value) });
    } else {
      setNewMedicine({ ...newMedicine, [field]: value });
    }
  };

  const validateMedicine = (med: Medicine) => {
    // Required fields: name, dosage, duration
    // Optional: frequency type, times of day
    return (
      med.name.trim() !== '' &&
      med.dosage.trim() !== '' &&
      med.duration?.trim() !== ''
    );
  };

  const calculateEndDate = (startDate: string, duration: string): string | undefined => {
    if (!duration || duration.toLowerCase() === 'ongoing') return undefined;

    const start = new Date(startDate);
    const durationMatch = duration.match(/(\d+)\s*(day|week|month|year)s?/i);

    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();

      switch (unit) {
        case 'day':
          start.setDate(start.getDate() + amount);
          break;
        case 'week':
          start.setDate(start.getDate() + (amount * 7));
          break;
        case 'month':
          start.setMonth(start.getMonth() + amount);
          break;
        case 'year':
          start.setFullYear(start.getFullYear() + amount);
          break;
      }

      return start.toISOString().split('T')[0];
    }

    return undefined;
  };

  const handleSaveMedicine = () => {
    if (!editingMedicine || !validateMedicine(editingMedicine)) return;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = calculateEndDate(startDate, editingMedicine.duration || '');

    const medicineWithStatus: Medicine = {
      ...editingMedicine,
      status: 'active',
      startDate,
      endDate
    };

    setAddedMedicines(prev => {
      const exists = prev.find(m => m.id === editingMedicine.id);
      return exists
        ? prev.map(m => (m.id === editingMedicine.id ? medicineWithStatus : m))
        : [...prev, medicineWithStatus];
    });
    setEditingMedicine(null);
    setShowEditForm(false);
    setMedicineName('');
  };

  const handleAddNewMedicine = () => {
    if (!validateMedicine(newMedicine)) return;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = calculateEndDate(startDate, newMedicine.duration || '');

    const newMed: Medicine = {
      ...newMedicine,
      id: Date.now(),
      status: 'active',
      startDate,
      endDate
    };

    setAddedMedicines(prev => [...prev, newMed]);
    setNewMedicine({
      id: 0,
      name: '',
      dosage: '',
      frequencyType: undefined,
      customFrequency: '',
      timesOfDay: [],
      duration: ''
    });
    setMedicineName('');
    setShowNewMedicineForm(false);
  };

  const handleEditMedicine = (id: number) => {
    const med = addedMedicines.find(m => m.id === id);
    if (med) {
      // Ensure timesOfDay is properly set
      const medToEdit = {
        ...med,
        timesOfDay: med.timesOfDay || [],
        frequencyType: med.frequencyType || 'daily',
        customFrequency: med.customFrequency || ''
      };
      setEditingMedicine(medToEdit);
      setMedicineName(med.name);
      setShowEditForm(true);
      setShowNewMedicineForm(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMedicine(null);
    setShowEditForm(false);
    setMedicineName('');
  };

  const handleCancelNewMedicine = () => {
    setNewMedicine({
      id: 0,
      name: '',
      dosage: '',
      frequencyType: undefined,
      customFrequency: '',
      timesOfDay: [],
      duration: ''
    });
    setMedicineName('');
    setShowNewMedicineForm(false);
  };

  const handleRemoveMedicine = (id: number) => {
    setAddedMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleSavePrescription = async () => {
    if (!patientId || addedMedicines.length === 0) return alert('Add medicines first.');

    const token = localStorage.getItem('token');
    setIsLoading(true);

    try {
      // Fetch existing prescriptions first
      const existingRes = await axios.get(`${BASE_URL_1}/api/prescriptions?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const existingMedicines = existingRes.data?.prescription?.medicines || [];

      // Merge: Keep all existing medicines and add new ones from addedMedicines
      // Create a map of existing medicines by a unique key (name + dosage)
      const existingMap = new Map<string, Medicine>(
        existingMedicines.map((m: Medicine) => [`${m.name}-${m.dosage}`, m])
      );

      // Add new medicines from addedMedicines (only if they don't exist)
      // If they exist, preserve the existing medication's status
      addedMedicines.forEach(med => {
        const key = `${med.name}-${med.dosage}`;
        const existing = existingMap.get(key);

        if (existing) {
          // Medicine already exists - preserve its status and other fields
          // Only update if it's truly a new prescription (different dates/details)
          existingMap.set(key, {
            ...existing,
            // Keep the existing status (active/inactive)
            status: existing.status || 'active',
            // Update other fields only if they're different
            frequency: med.frequency || existing.frequency,
            duration: med.duration || existing.duration,
            startDate: existing.startDate,
            endDate: existing.endDate
          });
        } else {
          // New medicine - add it with active status
          existingMap.set(key, med);
        }
      });

      // Convert map back to array
      const allMedicines = Array.from(existingMap.values());

      // Save merged prescription
      const response = await axios.post(`${BASE_URL_1}/api/prescriptions`, {
        patientId,
        medicines: allMedicines
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Prescription saved:', response.data);

      // Navigate back to patient details
      navigate(`/patient-details/${encodePatientId(patientId)}`);

    } catch (err: any) {
      console.error('Save error:', err);

      // If fetch fails (404), just save the new medicines
      if (err.response?.status === 404) {
        try {
          await axios.post(`${BASE_URL_1}/api/prescriptions`, {
            patientId,
            medicines: addedMedicines
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          navigate(`/patient-details/${encodePatientId(patientId)}`);
          return;
        } catch (retryErr) {
          console.error('Retry save error:', retryErr);
        }
      }

      alert(err.response?.data?.error || err.message || 'Could not save prescription.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {isLoading && (
        <div className="fullscreen-loader">
          <div className="loader-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Saving Prescription</h3>
            <p>Please wait while we process and save your prescription...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div className="prescription-container">
        <div className="prescription-wrapper">
          <div className="prescription-header">
            <div className="prescription-header-content">
              <div className="prescription-header-icon">
                <i className="fas fa-prescription-bottle-alt"></i>
              </div>
              <div className="prescription-header-text">
                <h2>Create New Prescription</h2>
                <p className="subtitle">Add medications for your patient with intelligent drug interaction checking</p>
              </div>
            </div>
          </div>

          <div className="prescription-content">
            <div className="medicine-section">
              <div className="section-header">
                <div className="section-icon">
                  <i className="fas fa-pills"></i>
                </div>
                <div className="section-header-text">
                  <h3>Suggested Medications</h3>
                  <p>Commonly prescribed medicines for this patient</p>
                </div>
              </div>
              <div className="medicine-chips">
                {currentMedicines.map(med => (
                  <button
                    key={med.id}
                    className={`medicine-chip ${isMedicineAdded(med.id) ? 'added' : ''}`}
                    onClick={() => handleAddChipClick(med)}
                    disabled={isMedicineAdded(med.id)}
                  >
                    <div className="chip-info">
                      <span className="chip-name">{med.name}</span>
                      <span className="chip-dosage">{med.dosage}</span>
                    </div>
                    <span className="chip-add">{isMedicineAdded(med.id) ? '✓' : '+'}</span>
                  </button>
                ))}
              </div>
            </div>

            {showEditForm && editingMedicine && (
              <div className="edit-form-container">
                <div className="form-header">
                  <h3>Edit Medication</h3>
                  <p>Adjust dosage and instructions</p>
                </div>
                <MedicineForm
                  medicine={editingMedicine}
                  onChange={handleInputChange}
                  onSave={handleSaveMedicine}
                  onCancel={handleCancelEdit}
                  saveDisabled={!validateMedicine(editingMedicine)}
                  setMedicineName={setMedicineName}
                  availableMedicines={availableMedicines}
                  filteredMedicines={filteredMedicines}
                  setShowDropdown={setShowDropdown}
                  showDropdown={showDropdown}
                />
              </div>
            )}

            <div className="medicine-section">
              <div className="section-header">
                <div className="section-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="section-header-text">
                  <h3>Custom Medication</h3>
                  <p>Add a medication not listed above</p>
                </div>
              </div>
              {!showNewMedicineForm && !showEditForm && (
                <button
                  className="add-custom-btn"
                  onClick={() => { setShowNewMedicineForm(true); setShowEditForm(false); }}
                >
                  <span>+</span> Add Custom Medication
                </button>
              )}
              {showNewMedicineForm && !showEditForm && (
                <div className="edit-form-container">
                  <div className="form-header">
                    <h3>Add New Medication</h3>
                    <p>Enter medication details</p>
                  </div>
                  <MedicineForm
                    medicine={newMedicine}
                    onChange={handleNewMedicineChange}
                    onSave={handleAddNewMedicine}
                    onCancel={handleCancelNewMedicine}
                    saveDisabled={!validateMedicine(newMedicine)}
                    setMedicineName={setMedicineName}
                    availableMedicines={availableMedicines}
                    filteredMedicines={filteredMedicines}
                    setShowDropdown={setShowDropdown}
                    showDropdown={showDropdown}
                  />
                </div>
              )}
            </div>

            <div className="medicine-section added-medicines">
              <div className="section-header">
                <div className="section-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="section-header-text">
                  <h3>Current Prescription</h3>
                  <p>{addedMedicines.length} medication{addedMedicines.length !== 1 ? 's' : ''} added</p>
                </div>
              </div>
              {addedMedicines.length === 0 ? (
                <div className="empty-state">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <p>No medications added yet</p>
                </div>
              ) : (
                <ul className="medicine-list">
                  {addedMedicines.map(med => {
                    const frequencyDisplay = med.frequencyType === 'custom'
                      ? med.customFrequency
                      : (med.frequencyType ? med.frequencyType.charAt(0).toUpperCase() + med.frequencyType.slice(1) : 'Daily');
                    const timesDisplay = med.timesOfDay?.join(', ') || '';

                    return (
                      <li key={med.id} className="medicine-item">
                        <div className="medicine-info">
                          <span className="medicine-name">{med.name}</span>
                          <span className="medicine-details">
                            {med.dosage} • {frequencyDisplay} • {timesDisplay} • {med.duration}
                          </span>
                        </div>
                        <div className="medicine-actions">
                          <button className="edit-btn" onClick={() => handleEditMedicine(med.id)}>
                            Edit
                          </button>
                          <button className="remove-btn" onClick={() => handleRemoveMedicine(med.id)}>
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="action-bar">
              <button className="secondary-btn" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleSavePrescription}
                disabled={addedMedicines.length === 0}
              >
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePrescription;