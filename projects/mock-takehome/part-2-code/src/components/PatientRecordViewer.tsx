import { useState } from 'react';
import type { Patient, Provider } from '@/types';
import { logPatientAccess } from '@/services/auditService';

/**
 * Component for viewing patient medical records
 *
 * This component is shown when a provider clicks on a patient to view their details.
 * Currently, it logs the access immediately when the component loads, but doesn't
 * capture WHY the provider is accessing the record.
 *
 * TODO: Modify this component to prompt for an access reason
 * TODO: Integrate the access reason into the audit logging flow
 *
 * Consider:
 * - When should you ask for the reason? (before showing the record? after? modal? inline?)
 * - How do you balance security (getting the reason) with UX (not blocking urgent access)?
 * - What if the provider needs to see the record IMMEDIATELY in an emergency?
 */

interface PatientRecordViewerProps {
  patient: Patient;
  currentProvider: Provider;
  onClose: () => void;
}

export function PatientRecordViewer({
  patient,
  currentProvider,
  onClose
}: PatientRecordViewerProps) {
  const [hasLoggedAccess, setHasLoggedAccess] = useState(false);

  // TODO: Add state for managing the access reason flow
  // TODO: Consider: Do you need loading states? Error states?

  /**
   * Currently, we log access immediately when the component mounts.
   * This doesn't capture the access reason.
   *
   * TODO: Modify this to include the access reason
   */
  const handleAccessLogging = () => {
    if (!hasLoggedAccess) {
      // TODO: This needs to be updated to include the access reason
      logPatientAccess(patient, currentProvider);
      setHasLoggedAccess(true);
    }
  };

  /**
   * TODO: Create a function to handle the access reason submission
   *
   * Example:
   * const handleAccessReasonSubmit = (reason: string) => {
   *   // Validate the reason
   *   // Log the access with the reason
   *   // Update state to show the patient record
   * };
   */

  // Currently auto-logging on first render - you may want to change this flow
  if (!hasLoggedAccess) {
    handleAccessLogging();
  }

  /**
   * TODO: Add UI for capturing the access reason
   *
   * You might want to:
   * - Show a modal/dialog before displaying the patient record
   * - Show an inline form
   * - Use a combination of structured (dropdown) and free-text input
   *
   * Consider the provider's workflow:
   * - They're busy and seeing many patients
   * - They need quick access, but also need to document properly
   * - Common reasons might include: "Scheduled appointment", "Emergency", "Follow-up", etc.
   */

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Patient Record</h2>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
          <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
          <p><strong>MRN:</strong> {patient.medicalRecordNumber}</p>
          {patient.insuranceProvider && (
            <p><strong>Insurance:</strong> {patient.insuranceProvider}</p>
          )}
          {patient.primaryCarePhysician && (
            <p><strong>Primary Care:</strong> {patient.primaryCarePhysician}</p>
          )}
        </div>

        <div style={styles.section}>
          <h3>Medical History</h3>
          <p><em>Medical history details would appear here...</em></p>
          <p><em>This is sensitive HIPAA-protected information</em></p>
        </div>

        <div style={styles.section}>
          <h3>Recent Visits</h3>
          <p><em>Recent visit information would appear here...</em></p>
        </div>

        <div style={styles.accessInfo}>
          <small>
            Accessed by: {currentProvider.name} ({currentProvider.role})
          </small>
          {/* TODO: Display the access reason here once captured */}
        </div>
      </div>
    </div>
  );
}

// Simple inline styles for the exercise (in production, use a proper styling solution)
const styles = {
  container: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '800px',
    margin: '20px auto',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  content: {
    lineHeight: '1.6',
  },
  section: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  accessInfo: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#fff3cd',
    borderLeft: '4px solid #ffc107',
    fontSize: '12px',
  },
} as const;
