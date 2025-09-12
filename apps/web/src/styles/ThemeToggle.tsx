import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  // TEMPORARILY DISABLED - Dark mode functionality disabled for consistency
  // Always show light mode and disable functionality
  const [darkMode] = useState(false); // Always false, no setter
  
  // Disabled useEffect - no theme switching
  useEffect(() => {
    // Ensure we're always in light mode
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <button
      // TEMPORARILY DISABLED - No functionality, just visual
      onClick={() => {
        // No action - button is disabled
      }}
      style={{
        background: "var(--accent)",
        color: "white",
        border: "none",
        borderRadius: "20px",
        padding: "12px 15px",
        cursor: "not-allowed", // Show disabled cursor
        fontWeight: 600,
        transition: "all 0.3s",
        opacity: 0.6, // Dimmed to indicate it's disabled
      }}
      title="Dark mode temporarily disabled"
      disabled
    >
      🌙 Dark Mode
    </button>
  );
};

export default ThemeToggle;
