import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, registerUser, loginUser } from "../api/authApi";
import { toast } from "react-toastify";
import CustomModal from "./CustomModal";
import "./Authentication.css";

type UserType = "patient" | "doctor" | "";
type LocationState = {
  isSignUp: boolean;
};



const MIN_PASSWORD_STRENGTH = 80;

const Authentication: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode =
    (location.state as LocationState)?.isSignUp !== undefined
      ? (location.state as LocationState).isSignUp
      : false;

  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode);
  const [userType, setUserType] = useState<UserType>("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<(() => void) | null>(null);
  const [modalCancelCallback, setModalCancelCallback] = useState<(() => void) | null>(null);

  const openModal = (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm || null);
    setModalCancelCallback(() => onCancel || null);
    setModalOpen(true);
  };

  // A helper to close the modal
  const closeModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalMessage("");
    setModalConfirmCallback(null);
    setModalCancelCallback(null);
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setErrorMessage("");
  };

  // Basic password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 30;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 30;
    return Math.min(strength, 100);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const toggleSignUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsSignUp(true);
    setFormData({ email: "", password: "", confirmPassword: "" });
    setPasswordStrength(0);
  };

  const toggleSignIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsSignUp(false);
    setFormData({ email: "", password: "", confirmPassword: "" });
    setPasswordStrength(0);
  };

  const handleSignUp = async () => {
    if (!userType) {
      openModal(
        "Role Required",
        "Please select either 'Patient' or 'Healthcare Pro' before proceeding."
      );
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      openModal("Password Mismatch", "Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (passwordStrength < MIN_PASSWORD_STRENGTH) {
      openModal(
        "Weak Password",
        "Please use a stronger password. It needs at least 8 characters, including one uppercase letter, one number, and one special character."
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const data = await registerUser(
        formData.email,
        formData.password,
        userType,
        false
      );
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ ...data.user, role: userType }));
      toast.success("Signup successful!");

      // Redirect based on user type
      if (userType === "patient") {
        navigate("/patient-profile-setup");
      } else {
        navigate("/ProfileSetup", {
          state: { role: userType }
        });
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.body.error || err.message : err.message;
      toast.error(msg || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogin = async () => {
    if (!userType) {
      openModal(
        "Role Required",
        "Please select either 'Patient' or 'Healthcare Pro' before logging in."
      );
      setIsLoading(false);
      return;
    }

    try {
      const data = await loginUser(formData.email, formData.password, userType);

      // Check if this account has the selected role
      if (!data.user.roles.includes(userType)) {
        toast.error(
          `This account is registered as a ${data.user.roles[0]}. Please select the correct role or sign up with a different email for ${userType} access.`
        );
        setIsLoading(false);
        return;
      }

      // Login successful
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ ...data.user, role: userType }));
      toast.success("Login successful!");

      // Redirect based on user type
      if (userType === "patient") {
        navigate("/patient-portal");
      } else {
        navigate("/DrugNexusAIDoctorPortal");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || error.message || "An unknown error occurred."
      );
    }
  };


  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleLogin();
    }
    setIsLoading(false);
  };

  return (
    <div className="authentication">
      <button 
        className="back-button" 
        onClick={() => navigate(-1)}
        title="Go back"
      >
        <span>&larr; Back</span>
      </button>
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="form-header">
            <h1>DrugNexusAI</h1>
            <p>Your Gateway to Safe Medication Management</p>
          </div>

          {/* User Role Selection */}
          <div className="user-type-selector">
            <div
              className={`user-type-card ${userType === "patient" ? "selected" : ""
                }`}
              onClick={() => handleUserTypeSelect("patient")}
            >
              <h3>Patient</h3>
              <p>Access personalized insights</p>
            </div>
            <div
              className={`user-type-card ${userType === "doctor" ? "selected" : ""
                }`}
              onClick={() => handleUserTypeSelect("doctor")}
            >
              <h3>Healthcare Pro</h3>
              <p>Advanced tools & analytics</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder=" "
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <label className="floating-label">
                {isSignUp ? "Professional Email" : "Email Address"}
              </label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <label className="floating-label">
                {isSignUp ? "Create Password" : "Password"}
              </label>
              <div className="password-strength">
                <div
                  className="strength-bar"
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>
            </div>
            {isSignUp && (
              <div className="input-group">
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder=" "
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <label className="floating-label">Confirm Password</label>
              </div>
            )}
            {errorMessage && (
              <div className="error-message" id="errorMessage">
                {errorMessage}
              </div>
            )}

            <button type="submit" disabled={isLoading}>
              {!isLoading && (
                <span className="button-text">
                  {isSignUp ? "Create Secure Account" : "Secure Sign In"}
                </span>
              )}
              {isLoading && <div className="loading-spinner"></div>}
            </button>
          </form>

          <div className="toggle-form">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <span className="toggle-link" onClick={toggleSignIn}>
                  Sign In
                </span>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <span className="toggle-link" onClick={toggleSignUp}>
                  Sign Up
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => {
          if (modalConfirmCallback) {
            modalConfirmCallback();
          }
          closeModal();
        }}
        onCancel={() => {
          if (modalCancelCallback) {
            modalCancelCallback();
          }
          closeModal();
        }}
      />
    </div>
  );
};

export default Authentication;
