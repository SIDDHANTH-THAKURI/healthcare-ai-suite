interface LogData {
    [key: string]: any;
}

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    action: string;
    details: any;
    userAgent?: string;
    url?: string;
    userId?: string;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    private log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, data?: LogData) {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            action: message,
            details: data || {},
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location?.href : undefined
        };

        this.logs.push(logEntry);

        // Keep only the most recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        if (this.isDevelopment) {
            console.log(`[${level}] ${message}`, data || '');
        }
    }

    info(message: string, data?: LogData) {
        this.log('INFO', message, data);
    }

    error(message: string, data?: LogData) {
        this.log('ERROR', message, data);
    }

    warn(message: string, data?: LogData) {
        this.log('WARN', message, data);
    }

    debug(message: string, data?: LogData) {
        this.log('DEBUG', message, data);
    }

    getRecentLogs(count: number = 100): LogEntry[] {
        return this.logs.slice(-count);
    }

    downloadLogs() {
        const logsJson = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearLogs() {
        this.logs = [];
    }

    patientValidation(patientId: string, isValid: boolean, message: string) {
        this.info('PATIENT_VALIDATION', {
            patientId,
            isValid,
            message,
            timestamp: new Date().toISOString()
        });
    }

    patientDataFetch(patientId: string, operation: string, success: boolean, data?: LogData) {
        this.info('PATIENT_DATA_FETCH', {
            patientId,
            operation,
            success,
            timestamp: new Date().toISOString(),
            ...data
        });
    }
}

export const logger = new Logger();