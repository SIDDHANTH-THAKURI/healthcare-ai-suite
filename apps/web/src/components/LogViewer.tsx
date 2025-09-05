import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import './LogViewer.css';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  action: string;
  details: any;
  userAgent?: string;
  url?: string;
  userId?: string;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLogs(logger.getRecentLogs(100));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    setLogs(logger.getRecentLogs(100));
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesText = filter === '' || 
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    
    return matchesText && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#ff4444';
      case 'WARN': return '#ffaa00';
      case 'INFO': return '#4444ff';
      case 'DEBUG': return '#888888';
      default: return '#000000';
    }
  };

  const downloadLogs = () => {
    logger.downloadLogs();
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <div className="log-viewer-toggle">
        <button 
          onClick={() => setIsVisible(true)}
          className="log-toggle-btn"
          title="Show Debug Logs"
        >
          🐛 Debug
        </button>
      </div>
    );
  }

  return (
    <div className="log-viewer-overlay">
      <div className="log-viewer">
        <div className="log-viewer-header">
          <h3>Debug Logs</h3>
          <div className="log-controls">
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="log-filter"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="log-level-filter"
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">Errors</option>
              <option value="WARN">Warnings</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
            <label className="auto-refresh-label">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto Refresh
            </label>
            <button onClick={downloadLogs} className="log-btn">Download</button>
            <button onClick={clearLogs} className="log-btn">Clear</button>
            <button onClick={() => setIsVisible(false)} className="log-btn close-btn">×</button>
          </div>
        </div>
        
        <div className="log-viewer-content">
          {filteredLogs.length === 0 ? (
            <div className="no-logs">No logs match the current filter</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="log-entry">
                <div className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div 
                  className="log-level"
                  style={{ color: getLevelColor(log.level) }}
                >
                  {log.level}
                </div>
                <div className="log-action">{log.action}</div>
                <div className="log-details">
                  {typeof log.details === 'object' 
                    ? JSON.stringify(log.details, null, 2)
                    : log.details
                  }
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="log-viewer-footer">
          <span>Total logs: {logs.length} | Filtered: {filteredLogs.length}</span>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;