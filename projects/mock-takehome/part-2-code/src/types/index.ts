/**
 * Core type definitions for the patient records system
 */

/**
 * Represents a patient in the system
 */
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  insuranceProvider?: string;
  primaryCarePhysician?: string;
}

/**
 * Represents a medical provider (doctor, nurse, admin staff)
 */
export interface Provider {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin' | 'specialist';
  credentials?: string;
}

/**
 * Represents an entry in the audit log
 *
 * TODO: Add a field to store the reason for accessing the patient record.
 * Consider: What type should this be? Optional or required?
 * How will this be used by compliance officers reviewing logs?
 */
export interface AuditLog {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  providerRole: Provider['role'];
  timestamp: string;
  actionType: 'view' | 'edit' | 'create' | 'delete';
  ipAddress: string;
  // TODO: Add access reason field here
}

/**
 * Represents the full details of a patient record access event
 * (combines patient data, provider data, and audit information)
 */
export interface PatientAccessEvent {
  patient: Patient;
  provider: Provider;
  auditLog: AuditLog;
}

/**
 * Configuration for how to handle access reasons
 * (you may or may not need this depending on your design)
 */
export interface AccessReasonConfig {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  suggestedReasons?: string[];
}
