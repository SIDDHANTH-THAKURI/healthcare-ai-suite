// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
  children: React.ReactNode;
  requiredRole?: 'doctor' | 'patient' | 'admin';
}

interface DecodedToken {
  exp: number;
  email?: string;
  role?: string;
}

interface UserData {
  email: string;
  role?: string; // Legacy single role
  roles?: string[]; // New multi-role support
}

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/Authentication" state={{ from: location }} replace />;
  }

  // Validate token
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/Authentication" state={{ from: location }} replace />;
    }

    // Check role-based access if requiredRole is specified
    if (requiredRole) {
      let userRoles: string[] = [];

      // Try to get roles from user data in localStorage
      if (userStr) {
        try {
          const userData: UserData = JSON.parse(userStr);
          
          // Support both roles array and legacy single role
          if (userData.roles && Array.isArray(userData.roles)) {
            userRoles = userData.roles;
          } else if (userData.role) {
            userRoles = [userData.role];
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Fallback to role from token (legacy)
      if (userRoles.length === 0 && decoded.role) {
        userRoles = [decoded.role];
      }

      // Check if user has the required role
      const hasRequiredRole = userRoles.includes(requiredRole);

      // If no roles found or user doesn't have required role, redirect
      if (userRoles.length === 0 || !hasRequiredRole) {
        console.warn(`Access denied: User roles [${userRoles.join(', ')}] do not include required role "${requiredRole}"`);
        
        return <Navigate 
          to="/Authentication" 
          state={{ 
            from: location,
            error: `Access denied. This page requires ${requiredRole} access.`
          }} 
          replace 
        />;
      }
    }
  } catch (error) {
    // If token is invalid/corrupt
    console.error('Token validation error:', error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/Authentication" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
