import type { AuditLog, Provider, Patient } from '@/types';

/**
 * Service for managing audit logs of patient record access
 */

// In-memory storage for this exercise (in production, this would be a database)
const auditLogs: AuditLog[] = [];

/**
 * Logs an access event when a provider views a patient record
 *
 * TODO: Update this function to accept an access reason parameter
 * TODO: Store the access reason in the audit log
 * TODO: Consider validation - what if the reason is empty or invalid?
 *
 * @param patient - The patient whose record is being accessed
 * @param provider - The provider accessing the record
 * @returns The created audit log entry
 */
export function logPatientAccess(
  patient: Patient,
  provider: Provider
): AuditLog {
  // TODO: Add parameter for access reason

  const auditLog: AuditLog = {
    id: generateId(),
    patientId: patient.id,
    providerId: provider.id,
    providerName: provider.name,
    providerRole: provider.role,
    timestamp: new Date().toISOString(),
    actionType: 'view',
    ipAddress: getMockIpAddress(),
    // TODO: Include access reason in the audit log object
  };

  auditLogs.push(auditLog);

  return auditLog;
}

/**
 * Retrieves audit logs for a specific patient
 *
 * @param patientId - The ID of the patient
 * @returns Array of audit log entries for the patient
 */
export function getAuditLogsForPatient(patientId: string): AuditLog[] {
  return auditLogs.filter(log => log.patientId === patientId);
}

/**
 * Retrieves all audit logs (for compliance review)
 *
 * @param filters - Optional filters for the logs
 * @returns Array of all audit log entries
 */
export function getAllAuditLogs(filters?: {
  startDate?: string;
  endDate?: string;
  providerId?: string;
  patientId?: string;
}): AuditLog[] {
  let filtered = [...auditLogs];

  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
  }
  if (filters?.providerId) {
    filtered = filtered.filter(log => log.providerId === filters.providerId);
  }
  if (filters?.patientId) {
    filtered = filtered.filter(log => log.patientId === filters.patientId);
  }

  return filtered.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Helper functions

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getMockIpAddress(): string {
  // Mock IP address for this exercise
  return '192.168.1.' + Math.floor(Math.random() * 255);
}
