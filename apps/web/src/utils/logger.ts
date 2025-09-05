interface LogData {
    [key: string]: any;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private log(level: string, message: string, data?: LogData) {
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