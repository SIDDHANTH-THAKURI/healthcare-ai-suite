import React, { useState, useEffect } from 'react';
import './AppointmentsPage.css';
import { BASE_URL_1 } from '../base';


interface Appointment {
  _id: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  location: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Props {
  onClose: () => void;
}

const AppointmentsPage: React.FC<Props> = ({ onClose }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppt, setNewAppt] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';
      const response = await fetch(`${BASE_URL_1}/api/appointments/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async () => {
    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).email : 'demo-patient-001';
      const response = await fetch('${BASE_URL_1}/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAppt, patientId: userId, status: 'scheduled' })
      });
      if (response.ok) {
        fetchAppointments();
        setShowAddForm(false);
        setNewAppt({ doctorName: '', specialty: '', date: '', time: '', location: '', notes: '' });
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const cancelAppointment = async (apptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const response = await fetch(`${BASE_URL_1}/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const filteredAppts = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    const now = new Date();
    if (filter === 'upcoming') return apptDate >= now && appt.status === 'scheduled';
    if (filter === 'past') return apptDate < now || appt.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#667eea';
      case 'completed': return '#10B981';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="appts-modal" onClick={onClose}>
      <div className="appts-content" onClick={(e) => e.stopPropagation()}>
        <div className="appts-header">
          <div>
            <h2><i className="fas fa-calendar-check"></i> My Appointments</h2>
            <p>Manage your doctor appointments</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="appts-toolbar">
          <div className="appts-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <i className="fas fa-plus"></i> New Appointment
          </button>
        </div>

        {showAddForm && (
          <div className="add-form">
            <h3>Schedule New Appointment</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Doctor Name"
                value={newAppt.doctorName}
                onChange={(e) => setNewAppt({...newAppt, doctorName: e.target.value})}
              />
              <input
                type="text"
                placeholder="Specialty"
                value={newAppt.specialty}
                onChange={(e) => setNewAppt({...newAppt, specialty: e.target.value})}
              />
              <input
                type="date"
                value={newAppt.date}
                onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
              />
              <input
                type="time"
                value={newAppt.time}
                onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
              />
              <input
                type="text"
                placeholder="Location"
                value={newAppt.location}
                onChange={(e) => setNewAppt({...newAppt, location: e.target.value})}
                className="full-width"
              />
              <textarea
                placeholder="Notes (optional)"
                value={newAppt.notes}
                onChange={(e) => setNewAppt({...newAppt, notes: e.target.value})}
                className="full-width"
              />
            </div>
            <div className="form-actions">
              <button className="submit-btn" onClick={addAppointment}>
                <i className="fas fa-check"></i> Schedule
              </button>
              <button className="cancel-form-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="appts-list">
          {loading ? (
            <div className="loading-state">Loading appointments...</div>
          ) : filteredAppts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments found</h3>
              <p>Schedule your first appointment</p>
            </div>
          ) : (
            filteredAppts.map((appt) => (
              <div key={appt._id} className="appt-card">
                <div className="appt-date-badge">
                  <div className="date-day">{new Date(appt.date).getDate()}</div>
                  <div className="date-month">
                    {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
                <div className="appt-details">
                  <div className="appt-main">
                    <h3>{appt.doctorName}</h3>
                    <p className="appt-specialty">{appt.specialty}</p>
                  </div>
                  <div className="appt-info">
                    <div className="info-row">
                      <i className="fas fa-clock"></i>
                      <span>{appt.time}</span>
                    </div>
                    <div className="info-row">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{appt.location}</span>
                    </div>
                    {appt.notes && (
                      <div className="info-row">
                        <i className="fas fa-sticky-note"></i>
                        <span>{appt.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="appt-status">
                  <span className="status-badge" style={{ background: getStatusColor(appt.status) }}>
                    {appt.status}
                  </span>
                  {appt.status === 'scheduled' && (
                    <button className="cancel-btn-small" onClick={() => cancelAppointment(appt._id)}>
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
