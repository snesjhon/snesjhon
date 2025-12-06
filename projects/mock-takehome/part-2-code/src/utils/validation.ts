/**
 * Validation utilities for the application
 */

/**
 * Validates that a string is not empty or just whitespace
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates that a string is within a certain length range
 */
export function isWithinLength(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * TODO: Create a validation function for access reasons
 *
 * Consider:
 * - What makes a valid access reason?
 * - Should there be a minimum length?
 * - Should there be a maximum length?
 * - Should certain characters be disallowed?
 * - Should we check for common "meaningless" entries like "test" or "..."?
 *
 * Example signature:
 * export function isValidAccessReason(reason: string): boolean {
 *   // Your implementation
 * }
 *
 * Or if you want to return an error message:
 * export function validateAccessReason(reason: string): { valid: boolean; error?: string } {
 *   // Your implementation
 * }
 */
