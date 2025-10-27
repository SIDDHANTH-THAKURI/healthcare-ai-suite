import React, { useState, useEffect } from 'react';
import { BASE_URL_1 } from '../base';

import './MedicationsPage.css';

interface Medication {
  _id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  frequencyType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customFrequency?: string;
  timesOfDay?: string[];
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  medicationImage?: string;
  formType?: string;
  timesPerDay?: number;
  instructions?: string;
  schedules: Array<{
    time: string;
    timeOfDay?: string;
    taken: boolean;
    takenAt?: Date;
    skipped: boolean;
    skipReason?: string;
  }>;
}

interface Props {
  onClose: () => void;
}

const MedicationsPage: React.FC<Props> = ({ onClose }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [newMed, setNewMed] = useState({
    medicationName: '',
    dosage: '',
    frequencyType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    customFrequency: '',
    timesOfDay: [] as string[],
    formType: 'tablet',
    prescribedBy: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';
      const response = await fetch(`${BASE_URL_1}/api/medication-schedule/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      } else {
        console.error('Failed to fetch medications');
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medId: string, time: string) => {
    try {
      const response = await fetch(`${BASE_URL_1}/api/medication-schedule/${medId}/take`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time })
      });
      if (response.ok) {
        fetchMedications();
      }
    } catch (error) {
      console.error('Error marking medication:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMedication = async () => {
    if (!newMed.medicationName || !newMed.dosage || !newMed.startDate || newMed.timesOfDay.length === 0) {
      showToast('Please fill in medication name, dosage, start date, and select at least one time of day', 'warning');
      return;
    }

    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';
      
      // Map times of day to actual times
      const timeMapping: { [key: string]: string } = {
        'Morning': '08:00',
        'Afternoon': '14:00',
        'Evening': '18:00',
        'Night': '22:00'
      };
      
      const scheduleArray = newMed.timesOfDay.map(timeOfDay => ({
        time: timeMapping[timeOfDay],
        timeOfDay: timeOfDay,
        taken: false,
        skipped: false
      }));

      // Generate a unique medication ID
      const medicationId = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const frequencyDisplay = newMed.frequencyType === 'custom' 
        ? newMed.customFrequency 
        : newMed.frequencyType.charAt(0).toUpperCase() + newMed.frequencyType.slice(1);

      const response = await fetch(`${BASE_URL_1}/api/medication-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userId,
          medicationId: medicationId,
          medicationName: newMed.medicationName,
          dosage: newMed.dosage,
          frequency: frequencyDisplay,
          frequencyType: newMed.frequencyType,
          customFrequency: newMed.customFrequency,
          timesOfDay: newMed.timesOfDay,
          formType: newMed.formType,
          timesPerDay: newMed.timesOfDay.length,
          prescribedBy: newMed.prescribedBy || 'Self',
          instructions: newMed.instructions,
          startDate: new Date(newMed.startDate),
          endDate: newMed.endDate ? new Date(newMed.endDate) : undefined,
          medicationImage: imagePreview || undefined,
          date: new Date(newMed.startDate),
          schedules: scheduleArray,
          adherenceScore: 0
        })
      });

      if (response.ok) {
        showToast('Medication added successfully!', 'success');
        fetchMedications();
        setShowAddForm(false);
        setImagePreview('');
        setNewMed({
          medicationName: '',
          dosage: '',
          frequencyType: 'daily',
          customFrequency: '',
          timesOfDay: [],
          formType: 'tablet',
          prescribedBy: '',
          instructions: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: ''
        });
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        showToast('Failed to add medication. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      showToast('Error adding medication. Please try again.', 'error');
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const deleteMedication = async (medId: string) => {
    try {
      const response = await fetch(`${BASE_URL_1}/api/medication-schedule/${medId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showToast('Medication deleted successfully', 'success');
        fetchMedications();
      } else {
        showToast('Failed to delete medication', 'error');
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      showToast('Error deleting medication', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };



  const filteredMeds = medications.filter(med => {
    if (filter === 'active') return !med.endDate || new Date(med.endDate) > new Date();
    if (filter === 'completed') return med.endDate && new Date(med.endDate) <= new Date();
    return true;
  });

  const getAdherence = (med: Medication) => {
    const total = med.schedules.length;
    const taken = med.schedules.filter(s => s.taken).length;
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  };

  return (
    <div className="meds-modal" onClick={onClose}>
      <div className="meds-content" onClick={(e) => e.stopPropagation()}>
        <div className="meds-header">
          <div>
            <h2><i className="fas fa-pills"></i> My Medications</h2>
            <p>Manage your medication schedule</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="meds-toolbar">
          <div className="meds-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({medications.length})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
          <button className="add-med-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <i className="fas fa-plus"></i> Add Medication
          </button>
        </div>

        {showAddForm && (
          <div className="add-med-form">
            <h3>Add New Medication</h3>
            <div className="form-layout">
              <div className="image-upload-section">
                <div className="image-preview">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Medication" />
                  ) : (
                    <div className="placeholder">
                      <i className="fas fa-pills"></i>
                      <p>Upload Image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="med-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="med-image" className="upload-btn-label">
                  <i className="fas fa-camera"></i> Choose Image
                </label>
              </div>

              <div className="form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>Medication Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Aspirin"
                      value={newMed.medicationName}
                      onChange={(e) => setNewMed({...newMed, medicationName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dosage *</label>
                    <input
                      type="text"
                      placeholder="e.g., 500mg"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Form Type</label>
                    <select
                      value={newMed.formType}
                      onChange={(e) => setNewMed({...newMed, formType: e.target.value})}
                    >
                      <option value="tablet">Tablet</option>
                      <option value="capsule">Capsule</option>
                      <option value="liquid">Liquid</option>
                      <option value="injection">Injection</option>
                      <option value="cream">Cream/Ointment</option>
                      <option value="inhaler">Inhaler</option>
                      <option value="drops">Drops</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Frequency Type</label>
                    <select
                      value={newMed.frequencyType}
                      onChange={(e) => setNewMed({...newMed, frequencyType: e.target.value as any})}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {newMed.frequencyType === 'custom' && (
                  <div className="form-group full-width">
                    <label>Custom Frequency</label>
                    <input
                      type="text"
                      placeholder="e.g., Every 3 days"
                      value={newMed.customFrequency}
                      onChange={(e) => setNewMed({...newMed, customFrequency: e.target.value})}
                    />
                  </div>
                )}

                <div className="form-group full-width">
                  <label>Times of Day</label>
                  <div className="times-of-day-selector">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                      <label key={time} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newMed.timesOfDay.includes(time)}
                          onChange={(e) => {
                            const newTimes = e.target.checked
                              ? [...newMed.timesOfDay, time]
                              : newMed.timesOfDay.filter(t => t !== time);
                            setNewMed({...newMed, timesOfDay: newTimes});
                          }}
                        />
                        <span>{time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prescribed By</label>
                    <input
                      type="text"
                      placeholder="Doctor's name"
                      value={newMed.prescribedBy}
                      onChange={(e) => setNewMed({...newMed, prescribedBy: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={newMed.startDate}
                      onChange={(e) => setNewMed({...newMed, startDate: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date (Optional)</label>
                    <input
                      type="date"
                      value={newMed.endDate}
                      onChange={(e) => setNewMed({...newMed, endDate: e.target.value})}
                    />
                  </div>
                </div>



                <div className="form-group full-width">
                  <label>Instructions</label>
                  <textarea
                    placeholder="e.g., Take with food, avoid alcohol"
                    value={newMed.instructions}
                    onChange={(e) => setNewMed({...newMed, instructions: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button className="submit-btn" onClick={addMedication}>
                    <i className="fas fa-check"></i> Add Medication
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setShowAddForm(false);
                    setImagePreview('');
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="meds-list">
          {loading ? (
            <div className="loading-state">Loading medications...</div>
          ) : filteredMeds.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <h3>No medications found</h3>
              <p>Start by adding your first medication</p>
            </div>
          ) : (
            filteredMeds.map((med) => (
              <div key={med._id} className="med-card">
                <div className="med-card-header">
                  <div className="med-image-container">
                    {med.medicationImage ? (
                      <img src={med.medicationImage} alt={med.medicationName} className="med-image" />
                    ) : (
                      <div className="med-icon">💊</div>
                    )}
                  </div>
                  <div className="med-main-info">
                    <h3>{med.medicationName}</h3>
                    <p className="med-dosage">{med.dosage} • {med.formType || 'Tablet'} • {med.frequency}</p>
                    <p className="med-doctor">Prescribed by {med.prescribedBy}</p>
                    {med.instructions && <p className="med-instructions">📝 {med.instructions}</p>}
                  </div>
                  <div className="med-adherence">
                    <div className="adherence-circle">
                      <span>{getAdherence(med)}%</span>
                    </div>
                    <p>Adherence</p>
                  </div>
                </div>

                <div className="med-schedule">
                  <h4>Today's Schedule</h4>
                  <div className="schedule-grid">
                    {med.schedules.map((schedule, idx) => (
                      <div key={idx} className={`schedule-item ${schedule.taken ? 'taken' : ''}`}>
                        <div className="schedule-time">
                          <i className="fas fa-clock"></i>
                          {schedule.time}
                        </div>
                        {!schedule.taken ? (
                          <button
                            className="take-btn"
                            onClick={() => markAsTaken(med._id, schedule.time)}
                          >
                            <i className="fas fa-check"></i> Take
                          </button>
                        ) : (
                          <div className="taken-badge">
                            <i className="fas fa-check-circle"></i> Taken
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="med-actions">
                  <button className="action-btn edit">
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="action-btn delete" onClick={() => setDeleteConfirm(med._id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`toast-notification toast-${toast.type}`}>
            <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}`}></i>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="confirm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Delete Medication?</h3>
              <p>Are you sure you want to delete this medication? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="confirm-btn delete" onClick={() => deleteMedication(deleteConfirm)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
                <button className="confirm-btn cancel" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationsPage;
