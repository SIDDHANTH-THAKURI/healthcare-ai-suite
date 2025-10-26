import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './PortalSidebar.css';
import './DrugNexusAIDoctorPortal.css';

type NavItem = {
  to: string;
  icon: string;
  label: string;
};

interface ProfileData {
  name: string;
  specialization?: string;
  avatarUrl?: string;
  onEditProfile?: () => void;
}

interface SidebarProps {
  navItems: NavItem[];
  profile: ProfileData;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, profile }) => {
  return (
    <aside className="dashboard-sidebar sidebar">

      <div className="doctor-profile">
        {profile.avatarUrl && <img src={profile.avatarUrl} alt="Doctor" />}
        <h3>{profile.name}</h3>
        {profile.specialization && <p>{profile.specialization}</p>}
        {profile.onEditProfile && (
          <button className="btn-edit" onClick={profile.onEditProfile}>
            Edit Profile
          </button>
        )}
      </div>


      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <i className={`fas ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export const patientNavItems: NavItem[] = [
  { to: '/PatientPortal', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/UnderConstruction?feature=medical-history', icon: 'fa-notes-medical', label: 'Medical History' },
  { to: '/UnderConstruction?feature=lab-results', icon: 'fa-flask', label: 'Lab Results' },
  { to: '/UnderConstruction?feature=prescriptions', icon: 'fa-pills', label: 'Prescriptions' },
  { to: '/UnderConstruction?feature=appointments', icon: 'fa-calendar-alt', label: 'Appointments' }
];

export const doctorNavItems: NavItem[] = [
  { to: '/DrugNexusAIDoctorPortal', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/UnderConstruction?feature=patients', icon: 'fa-users', label: 'Patients' },
  { to: '/UnderConstruction?feature=doctor-appointments', icon: 'fa-calendar-check', label: 'Appointments' },
  { to: '/UnderConstruction?feature=lab-requests', icon: 'fa-vial', label: 'Lab Requests' },
  { to: '/UnderConstruction?feature=prescriptions-review', icon: 'fa-prescription-bottle-alt', label: 'Prescriptions Review' }
];

export const PatientSidebar: React.FC<{ profile: ProfileData }> = ({ profile }) => (
  <Sidebar navItems={patientNavItems} profile={profile} />
);

export const DocSidebar: React.FC<{ profile: ProfileData }> = ({ profile }) => (
  <Sidebar navItems={doctorNavItems} profile={profile} />
);

export default Sidebar;
