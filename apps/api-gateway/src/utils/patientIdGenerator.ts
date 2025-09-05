import { randomBytes } from 'crypto';

/**
 * Generates a secure, non-sequential patient ID
 * Format: P-{8-char-hex}-{4-char-hex}
 * Example: P-A1B2C3D4-E5F6
 */
export const generateSecurePatientId = (): string => {
  const part1 = randomBytes(4).toString('hex').toUpperCase();
  const part2 = randomBytes(2).toString('hex').toUpperCase();
  return `P-${part1}-${part2}`;
};

/**
 * Validates patient ID format
 * Supports both old format (P1234) and new format (P-A1B2C3D4-E5F6)
 */
export const isValidPatientId = (patientId: string): boolean => {
  // New secure format: P-{8-char-hex}-{4-char-hex}
  const newFormat = /^P-[A-F0-9]{8}-[A-F0-9]{4}$/.test(patientId);
  // Old format for backward compatibility: P followed by numbers
  const oldFormat = /^P\d+$/.test(patientId);
  
  return newFormat || oldFormat;
};