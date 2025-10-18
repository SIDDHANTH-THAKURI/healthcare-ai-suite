import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useMobileRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if already on mobile-not-supported page
    if (location.pathname === '/mobile-not-supported') {
      return;
    }

    // Check if user already allowed mobile access
    const allowMobileAccess = sessionStorage.getItem('allowMobileAccess');
    if (allowMobileAccess === 'true') {
      return;
    }

    // Detect mobile device
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    const isMobile = width < 1024 || mobileKeywords.test(userAgent);

    if (isMobile) {
      console.log('Mobile detected, redirecting to mobile-not-supported page');
      // Redirect to mobile not supported page
      navigate('/mobile-not-supported', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [navigate, location.pathname]);
};
