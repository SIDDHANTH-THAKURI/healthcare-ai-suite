import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { Layout } from './styles/common';
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from './components/HomePage';
import Authentication from './components/Authentication';
import PatientPortal from "./components/PatientPortal";
import HowItWorks from './components/HowItWorks';
import DrugNexusAIDoctorPortal from "./components/DrugNexusAIDoctorPortal";
import ProfileSetup from "./components/ProfileSetup";
import NotFound from "./components/NotFound";
import Chatbot from "./components/Chatbot";
import './App.css';
import PatientDetails from "./components/PatientDetails";
import PatientLabResults from "./components/PatientLabResult";
import CreatePrescription from "./components/CreatePrescription";
import UnderConstruction from "./components/UnderConstruction";
import ModelsPlayground from "./components/ModelsPlayground";
import PatientProfileSetup from "./components/PatientProfileSetup";
import PatientPortalNew from "./components/PatientPortal";
import MobileNotSupported from "./components/MobileNotSupported";
import MaintenancePage from "./components/MaintenancePage";
import { MAINTENANCE_MODE } from "./config/maintenance";


function App() {
  // If maintenance mode is enabled, show maintenance page for all routes
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/Authentication" element={<Layout><Authentication /></Layout>} />
        
        {/* Patient Routes - Require patient role */}
        <Route path="/PatientPortal" element={<ProtectedRoute requiredRole="patient"><PatientPortal /></ProtectedRoute>} />
        <Route path="/patient-profile-setup" element={<ProtectedRoute requiredRole="patient"><PatientProfileSetup /></ProtectedRoute>} />
        <Route path="/patient-portal-new" element={<ProtectedRoute requiredRole="patient"><PatientPortalNew /></ProtectedRoute>} />
        <Route path="/patient-portal" element={<ProtectedRoute requiredRole="patient"><PatientPortalNew /></ProtectedRoute>} />
        
        {/* Doctor Routes - Require doctor role */}
        <Route path="/DrugNexusAIDoctorPortal" element={<ProtectedRoute requiredRole="doctor"><Layout><DrugNexusAIDoctorPortal /></Layout></ProtectedRoute>} />
        <Route path="/patient-details/:patientId" element={<ProtectedRoute requiredRole="doctor"><Layout><PatientDetails /></Layout></ProtectedRoute>} />
        <Route path="/create-prescription" element={<ProtectedRoute requiredRole="doctor"><Layout><CreatePrescription /></Layout></ProtectedRoute>} />
        <Route path="/ProfileSetup" element={<ProtectedRoute requiredRole="doctor"><Layout><ProfileSetup /></Layout></ProtectedRoute>} />
        <Route path="/patientLabResults" element={<ProtectedRoute requiredRole="doctor"><Layout><PatientLabResults /></Layout></ProtectedRoute>} />
        
        {/* Chatbot - Doctor only */}
        <Route path="/Chatbot" element={<ProtectedRoute requiredRole="doctor"><Layout><Chatbot /></Layout></ProtectedRoute>} />
        
        {/* Public Routes */}
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/UnderConstruction" element={<Layout><UnderConstruction /></Layout>} />
        <Route path="/ModelsPlayground" element={<Layout><ModelsPlayground /></Layout>} />
        <Route path="/mobile-not-supported" element={<MobileNotSupported />} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />

      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
