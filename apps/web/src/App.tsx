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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/Authentication" element={<Layout><Authentication /></Layout>} />
        <Route path="/PatientPortal" element={<ProtectedRoute><Layout><PatientPortal /></Layout></ProtectedRoute>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/patientLabResults" element={<ProtectedRoute><Layout><PatientLabResults /></Layout></ProtectedRoute>} />
        <Route path="/patient-details/:patientId" element={<ProtectedRoute><Layout><PatientDetails /></Layout></ProtectedRoute>} />
        <Route path="/create-prescription" element={<ProtectedRoute><Layout><CreatePrescription /></Layout></ProtectedRoute>} />
        <Route path="/DrugNexusAIDoctorPortal" element={<ProtectedRoute><Layout><DrugNexusAIDoctorPortal /></Layout></ProtectedRoute>} />
        <Route path="/ProfileSetup" element={<ProtectedRoute><Layout><ProfileSetup /></Layout></ProtectedRoute>} />
        <Route path="/Chatbot" element={<ProtectedRoute><Layout><Chatbot /></Layout></ProtectedRoute>} />
        <Route path="/UnderConstruction" element={<Layout><UnderConstruction /></Layout>} />
        <Route path="/ModelsPlayground" element={<Layout><ModelsPlayground /></Layout>} />
        <Route path="/patient-profile-setup" element={<PatientProfileSetup />} />
        <Route path="/patient-portal-new" element={<PatientPortalNew />} />
        <Route path="/patient-portal" element={<PatientPortalNew />} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />

      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
