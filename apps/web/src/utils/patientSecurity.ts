/**
 * Security utilities for patient ID handling
 */

/**
 * Encodes a patient ID for URL usage
 * Uses base64 encoding to obfuscate the actual patient ID
 */
export const encodePatientId = (patientId: string): string => {
  try {
    return btoa(patientId);
  } catch (error) {
    throw new Error('Failed to encode patient ID');
  }
};

/**
 * Decodes a patient ID from URL
 * Returns null if decoding fails
 */
export const decodePatientId = (encodedId: string): string | null => {
  try {
    return atob(encodedId);
  } catch (error) {
    return null;
  }
};

/**
 * Validates if a patient ID format is valid
 * Supports both old format (P1234) and new format (P-A1B2C3D4-E5F6)
 */
export const isValidPatientIdFormat = (patientId: string): boolean => {
  // New secure format: P-{8-char-hex}-{4-char-hex}
  const newFormat = /^P-[A-F0-9]{8}-[A-F0-9]{4}$/.test(patientId);
  // Old format for backward compatibility: P followed by numbers
  const oldFormat = /^P\d+$/.test(patientId);
  
  return newFormat || oldFormat;
};