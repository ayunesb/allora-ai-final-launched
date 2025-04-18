
/**
 * Common validation utilities
 * 
 * This module provides reusable validation functions that can be used
 * across different parts of the application.
 */

/**
 * Validates if an email is in the correct format
 * @example
 * // Check if email is valid
 * if (!isValidEmail(userEmail)) {
 *   return errorResponse("Invalid email format");
 * }
 * 
 * @param email Email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string is not empty or undefined
 * @example
 * // Check if name is provided
 * if (!isNonEmptyString(name)) {
 *   return errorResponse("Name is required");
 * }
 * 
 * @param value String to validate
 * @returns Boolean indicating if the string is valid
 */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a valid UUID
 * @example
 * // Check if ID is a valid UUID
 * if (!isValidUuid(userId)) {
 *   return errorResponse("Invalid user ID format");
 * }
 * 
 * @param value Value to validate
 * @returns Boolean indicating if the value is a valid UUID
 */
export function isValidUuid(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates that a value meets all provided validation functions
 * @example
 * // Validate multiple conditions
 * if (!validateAll(
 *   userId,
 *   [isNonEmptyString, isValidUuid],
 *   "Invalid user ID"
 * )) {
 *   return errorResponse("Invalid user ID format");
 * }
 * 
 * @param value Value to validate
 * @param validationFns Array of validation functions to apply
 * @returns Boolean indicating if the value passes all validations
 */
export function validateAll(
  value: unknown, 
  validationFns: Array<(value: unknown) => boolean>
): boolean {
  return validationFns.every(fn => fn(value));
}

/**
 * Validates if a value is a valid URL
 * @param url URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export function isValidUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a date string is in ISO format
 * @param date Date string to validate
 * @returns Boolean indicating if the date string is valid
 */
export function isValidIsoDate(date: unknown): boolean {
  if (typeof date !== 'string') return false;
  
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  return isoDateRegex.test(date) && !isNaN(Date.parse(date));
}

/**
 * Validates if a value is a positive number
 * @param value Value to validate
 * @returns Boolean indicating if the value is a positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates if a value is within a specified range
 * @param value Value to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Boolean indicating if the value is within range
 */
export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates if a value is a valid phone number
 * Uses a basic regex that accepts common formats
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  
  // This is a simple regex for demonstration - production systems
  // should use a more robust solution like libphonenumber-js
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates a strong password
 * @param password Password to validate
 * @returns Boolean indicating if the password meets security requirements
 */
export function isStrongPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 8) return false;
  
  // Check for at least one uppercase letter, one lowercase letter,
  // one number, and one special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}
