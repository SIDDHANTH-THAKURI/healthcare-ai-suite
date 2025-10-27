import React, { useState, useEffect } from 'react';
import './DDIAlertSystem.css';
import { BASE_URL_1 } from '../base';

interface DDIAlert {
  id: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  message: string;
  drugs: string[];
  recommendation: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

interface DDIAlertSystemProps {
  patientId: string;
  currentMedications: Array<{ name: string; dosage: string; frequency?: string }>;
  conditions: string[];
  allergies: string[];
  patientAge?: number;
  patientGender?: string;
  onAlertsUpdate?: (alerts: DDIAlert[]) => void;
  onExhausted?: () => void;
}

const DDIAlertSystem: React.FC<DDIAlertSystemProps> = ({
  patientId,
  currentMedications,
  conditions,
  allergies,
  patientAge,
  patientGender,
  onAlertsUpdate,
  onExhausted
}) => {
  const [activeAlerts, setActiveAlerts] = useState<DDIAlert[]>([]);
  const [oldAlerts, setOldAlerts] = useState<DDIAlert[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [showOldAlerts, setShowOldAlerts] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  // Load alerts from database on mount
  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoadingAlerts(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${BASE_URL_1}/api/ddi-alerts/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveAlerts(data.activeAlerts || []);
          setOldAlerts(data.oldAlerts || []);
          setLastCheckTime(data.lastCheckTime || null);
          setIsInitialLoad(false); // Mark initial load as complete
        }
      } catch (error) {
        console.error('Failed to load DDI alerts:', error);
        // Fallback to localStorage if database fails
        const savedAlerts = localStorage.getItem(`ddi_alerts_${patientId}`);
        if (savedAlerts) {
          const parsed = JSON.parse(savedAlerts);
          setActiveAlerts(parsed.active || []);
          setOldAlerts(parsed.old || []);
          setLastCheckTime(parsed.lastCheck || null);
        }
        setIsInitialLoad(false); // Mark initial load as complete even on error
      } finally {
        setIsLoadingAlerts(false);
      }
    };
    
    loadAlerts();
  }, [patientId]);

  // Track if initial load is complete
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Save alerts to database whenever they change (but not on initial load)
  useEffect(() => {
    if (isInitialLoad) {
      return; // Skip saving on initial load
    }

    const saveAlerts = async () => {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${BASE_URL_1}/api/ddi-alerts/${patientId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            activeAlerts,
            oldAlerts,
            lastCheckTime
          })
        });
        
        // Also save to localStorage as backup
        localStorage.setItem(`ddi_alerts_${patientId}`, JSON.stringify({
          active: activeAlerts,
          old: oldAlerts,
          lastCheck: lastCheckTime
        }));
        
        onAlertsUpdate?.(activeAlerts);
      } catch (error) {
        console.error('Failed to save DDI alerts to database:', error);
        // Fallback to localStorage only
        localStorage.setItem(`ddi_alerts_${patientId}`, JSON.stringify({
          active: activeAlerts,
          old: oldAlerts,
          lastCheck: lastCheckTime
        }));
      }
    };

    saveAlerts();
  }, [activeAlerts, oldAlerts, lastCheckTime, patientId, onAlertsUpdate, isInitialLoad]);

  const checkDDI = async () => {
    if (currentMedications.length === 0) {
      return;
    }

    setIsChecking(true);
    const token = localStorage.getItem('token');

    try {
      // Extract just the medication names for the DDI check
      const medicineNames = currentMedications.map(med => med.name);
      
      // First, check drug-drug interactions (only if 2+ medications)
      let data: any = { interactions: [], safe: true };
      
      if (medicineNames.length >= 2) {
        
        const response = await fetch(`${BASE_URL_1}/api/interactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
          body: JSON.stringify({
            medicines: medicineNames
          })
        });

        if (!response.ok) {
          console.error('❌ DDI check failed with status:', response.status);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        } else {
          const interactions = await response.json();
          // Check if we need to simplify the interactions
          if (Array.isArray(interactions) && interactions.length > 0) {
            // Simplify the interactions
            const simplifyResponse = await fetch(`${BASE_URL_1}/api/simplify_interactions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ interactions })
            });
            
            if (simplifyResponse.ok) {
              const simplified = await simplifyResponse.json();
              
              data = {
                safe: false,
                interactions: simplified.map((item: any) => ({
                  severity: 'major', // Default severity, could be enhanced
                  drugs: item.pair.split(' and '),
                  message: item.shortDescription,
                  recommendation: 'Consult with healthcare provider before combining these medications.'
                }))
              };
              
            } else {
              console.error('❌ Simplify failed with status:', simplifyResponse.status);
              const errorText = await simplifyResponse.text();
              console.error('Error details:', errorText);
              
              // Fallback: Use original descriptions if simplification fails
              data = {
                safe: false,
                interactions: interactions.map((item: any) => ({
                  severity: 'major',
                  drugs: item.pair.split(' and '),
                  message: item.description.length > 200 ? item.description.substring(0, 200) + '...' : item.description,
                  recommendation: 'Consult with healthcare provider before combining these medications.'
                }))
              };
              
            }
          } else {
            console.log('✅ No drug-drug interactions found in database');
          }
        }
      } else {
        console.log('⚠️ Skipping drug-drug interaction check (need 2+ medications, have', medicineNames.length, ')');
      }

      // Second, check drug-condition contraindications
      let conditionAlerts: any[] = [];
      if (conditions.length > 0 || allergies.length > 0) {
        try {
          
          const contraindicationResponse = await fetch(`${BASE_URL_1}/api/check-contraindications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              medications: currentMedications,
              conditions,
              allergies,
              patientAge,
              patientGender
            })
          });

          if (contraindicationResponse.ok) {
            const contraindicationData = await contraindicationResponse.json();
            
            if (contraindicationData.contraindications && contraindicationData.contraindications.length > 0) {
              conditionAlerts = contraindicationData.contraindications.map((item: any) => ({
                severity: item.severity || 'major',
                drugs: [item.medication],
                message: item.message,
                recommendation: item.recommendation
              }));
              
            } else {
              console.log('✅ No drug-condition contraindications found');
            }
          } else {
            console.error('❌ Contraindication check failed with status:', contraindicationResponse.status);
            const errorText = await contraindicationResponse.text();
            console.error('Error details:', errorText);
          }
        } catch (error: any) {
          console.error('❌ Contraindication check error:', error);
          // Check if it's a usage limit error
          if (error.response?.status === 429 || error.response?.data?.exhausted) {
            throw error; // Re-throw to be caught by outer catch
          }
          // Continue without contraindication data for other errors
        }
      } else {
        console.log('⚠️ Skipping contraindication check (no conditions or allergies)');
      }

      const timestamp = new Date().toISOString();

      // Combine drug-drug interactions and drug-condition contraindications
      const allInteractions = [...(data.interactions || []), ...conditionAlerts];

      // If safe (no interactions or contraindications), move all active alerts to old
      if (allInteractions.length === 0) {
        const resolvedAlerts = activeAlerts.map(a => ({
          ...a,
          status: 'resolved' as const,
          timestamp
        }));
        setActiveAlerts([]);
        setOldAlerts(prev => [...resolvedAlerts, ...prev].slice(0, 20));
        setLastCheckTime(timestamp);
        return;
      }

      // Process new alerts
      const newAlerts: DDIAlert[] = allInteractions.map((interaction: any) => ({
        id: `${Date.now()}-${Math.random()}`,
        severity: interaction.severity,
        drugs: interaction.drugs,
        message: interaction.message,
        recommendation: interaction.recommendation,
        timestamp,
        status: 'active' as const
      }));

      // Compare with existing active alerts to find resolved ones
      const existingAlertKeys = new Set(
        activeAlerts.map(a => `${a.drugs.sort().join('-')}-${a.message}`)
      );
      const newAlertKeys = new Set(
        newAlerts.map(a => `${a.drugs.sort().join('-')}-${a.message}`)
      );

      // Move resolved alerts to old
      const resolvedAlerts = activeAlerts
        .filter(a => !newAlertKeys.has(`${a.drugs.sort().join('-')}-${a.message}`))
        .map(a => ({ ...a, status: 'resolved' as const, timestamp }));

      setActiveAlerts(newAlerts);
      setOldAlerts(prev => [...resolvedAlerts, ...prev].slice(0, 20));
      setLastCheckTime(timestamp);
    } catch (error: any) {
      console.error('DDI check error:', error);
      
      // Check if it's a usage limit error
      if (error.response?.status === 429 || error.response?.data?.exhausted) {
        onExhausted?.();
      }
    } finally {
      setIsChecking(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'fa-exclamation-circle';
      case 'major':
        return 'fa-exclamation-triangle';
      case 'moderate':
        return 'fa-info-circle';
      case 'minor':
        return 'fa-check-circle';
      default:
        return 'fa-info-circle';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc3545';
      case 'major':
        return '#fd7e14';
      case 'moderate':
        return '#ffc107';
      case 'minor':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="ddi-alert-system">
      <div className="ddi-header">
        <div className="ddi-title">
          <i className="fas fa-shield-alt"></i>
          <h3>Safety Alerts</h3>
          {activeAlerts.length > 0 && (
            <span className="alert-badge">{activeAlerts.length}</span>
          )}
        </div>
        <button
          className="check-ddi-btn"
          onClick={checkDDI}
          disabled={isChecking || currentMedications.length === 0}
        >
          {isChecking ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Checking...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i>
              Check Interactions
            </>
          )}
        </button>
      </div>

      {lastCheckTime && (
        <div className="last-check-time">
          Last checked: {formatTimestamp(lastCheckTime)}
        </div>
      )}

      {isLoadingAlerts && (
        <div className="ddi-info-message">
          <i className="fas fa-spinner fa-spin"></i>
          Loading alerts...
        </div>
      )}

      {!isLoadingAlerts && currentMedications.length === 0 && (
        <div className="ddi-info-message">
          <i className="fas fa-info-circle"></i>
          Add medications to check for:
          <ul style={{ marginTop: '8px', paddingLeft: '20px', textAlign: 'left' }}>
            <li>Drug-drug interactions</li>
            <li>Drug-condition contraindications</li>
            <li>Allergy conflicts</li>
          </ul>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="alerts-section active-section">
          <h4 className="section-title">
            <i className="fas fa-exclamation-triangle"></i>
            Active Alerts ({activeAlerts.length})
          </h4>
          <div className="alerts-list">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`alert-card ${alert.severity} ${expandedAlert === alert.id ? 'expanded' : ''}`}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="alert-header">
                  <div className="alert-icon" style={{ color: getSeverityColor(alert.severity) }}>
                    <i className={`fas ${getSeverityIcon(alert.severity)}`}></i>
                  </div>
                  <div className="alert-content">
                    <div className="alert-severity">{alert.severity.toUpperCase()}</div>
                    <div className="alert-drugs">
                      {alert.drugs.join(' + ')}
                    </div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                  <i className={`fas fa-chevron-${expandedAlert === alert.id ? 'up' : 'down'} expand-icon`}></i>
                </div>
                {expandedAlert === alert.id && (
                  <div className="alert-details">
                    <div className="detail-section">
                      <strong>Recommendation:</strong>
                      <p>{alert.recommendation}</p>
                    </div>
                    <div className="alert-timestamp">
                      Detected: {formatTimestamp(alert.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Active Alerts */}
      {activeAlerts.length === 0 && currentMedications.length >= 1 && lastCheckTime && (
        <div className="no-alerts-message">
          <i className="fas fa-check-circle"></i>
          <p>No interactions or contraindications detected</p>
          <span>All medications appear safe with current conditions, allergies, and other medications</span>
        </div>
      )}

      {/* Old/Resolved Alerts */}
      {oldAlerts.length > 0 && (
        <div className="alerts-section old-section">
          <button
            className="section-toggle"
            onClick={() => setShowOldAlerts(!showOldAlerts)}
          >
            <i className={`fas fa-chevron-${showOldAlerts ? 'up' : 'down'}`}></i>
            <h4 className="section-title">
              <i className="fas fa-history"></i>
              Resolved Alerts ({oldAlerts.length})
            </h4>
          </button>
          {showOldAlerts && (
            <div className="alerts-list old-alerts-list">
              {oldAlerts.map(alert => (
                <div key={alert.id} className="alert-card resolved">
                  <div className="alert-header">
                    <div className="alert-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="alert-content">
                      <div className="alert-drugs">{alert.drugs.join(' + ')}</div>
                      <div className="alert-message">{alert.message}</div>
                      <div className="resolved-badge">Resolved</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DDIAlertSystem;
