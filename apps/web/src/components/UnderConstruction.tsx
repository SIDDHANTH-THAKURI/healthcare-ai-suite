import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UnderConstruction.css';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
}

const UnderConstruction: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [email, setEmail] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [epicMode, setEpicMode] = useState(false);
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  const phases = [
    { icon: '🎨', text: 'Designing Interface', color: '#667eea' },
    { icon: '⚙️', text: 'Building Features', color: '#764ba2' },
    { icon: '🧪', text: 'Testing Systems', color: '#f093fb' },
    { icon: '🚀', text: 'Preparing Launch', color: '#4facfe' }
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 50);

    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  useEffect(() => {
    if (!epicMode) return;

    const colors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec'];

    const createFirework = () => {
      const newFirework: Firework = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      setFireworks(prev => [...prev, newFirework]);

      setTimeout(() => {
        setFireworks(prev => prev.filter(fw => fw.id !== newFirework.id));
      }, 2000);
    };

    // Create massive fireworks show
    const interval = setInterval(createFirework, 100);

    // Initial burst
    for (let i = 0; i < 50; i++) {
      setTimeout(createFirework, i * 50);
    }

    // Stop after 15 seconds
    const timeout = setTimeout(() => {
      setEpicMode(false);
      setClickCount(0);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [epicMode]);

  const handleIconClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 10) {
      setEpicMode(true);
    }
  };

  const handleNotify = () => {
    if (email) {
      alert(`We'll notify you at ${email} when we launch!`);
      setEmail('');
    }
  };

  return (
    <div className={`uc-container ${epicMode ? 'epic-mode' : ''}`}>
      <div className="uc-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {epicMode && (
        <div className="epic-overlay">
          <div className="epic-text">🎆 EPIC FIREWORKS MODE! 🎆</div>
        </div>
      )}

      {fireworks.map(fw => (
        <div
          key={fw.id}
          className="firework"
          style={{
            left: `${fw.x}%`,
            top: `${fw.y}%`,
            '--firework-color': fw.color
          } as React.CSSProperties}
        >
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="firework-particle"
              style={{ '--angle': `${i * 15}deg` } as React.CSSProperties}
            />
          ))}
        </div>
      ))}

      <button className="back-button" onClick={() => navigate('/DrugNexusAIDoctorPortal')}>
        <i className="fas fa-arrow-left"></i>
        <span>Back to Portal</span>
      </button>

      <div className="uc-content">
        <div className="icon-container" onClick={handleIconClick} style={{ cursor: 'pointer' }}>
          <div className="rotating-ring"></div>
          <div className="phase-icon">{phases[currentPhase].icon}</div>
          {clickCount > 0 && clickCount < 10 && (
            <div className="click-counter">{clickCount}/10</div>
          )}
        </div>

        <h1 className="uc-title">
          <span className="title-word">We're</span>
          <span className="title-word gradient-text">Building</span>
          <span className="title-word">Something</span>
          <span className="title-word gradient-text">Amazing</span>
        </h1>

        <p className="uc-subtitle">{phases[currentPhase].text}</p>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${phases[currentPhase].color}, ${phases[(currentPhase + 1) % phases.length].color})`
              }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="card-icon">💊</div>
            <h3>Smart Analysis</h3>
            <p>AI-powered drug interaction detection</p>
          </div>
          <div className="feature-card">
            <div className="card-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your health data stays protected</p>
          </div>
          <div className="feature-card">
            <div className="card-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Instant results when you need them</p>
          </div>
        </div>

        <div className="notify-section">
          <p className="notify-text">Get notified when we launch</p>
          <div className="email-input-group">
            <input
              type="email"
              placeholder="Enter your email"
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNotify()}
            />
            <button className="notify-button" onClick={handleNotify}>
              <span>Notify Me</span>
              <span className="button-shine"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="floating-elements">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UnderConstruction;
