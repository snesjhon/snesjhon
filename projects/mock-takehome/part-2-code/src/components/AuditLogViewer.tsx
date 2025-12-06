import { useMemo, useState } from 'react';
import type { AuditLog } from '@/types';
import { getAllAuditLogs } from '@/services/auditService';

/**
 * Component for viewing audit logs
 *
 * This is used by compliance officers and administrators to review who
 * accessed patient records and when. This is critical for HIPAA compliance
 * and responding to patient requests about their data.
 *
 * TODO: Update this component to display access reasons in the audit log
 * TODO: Consider how to make the reason clearly visible and useful for auditing
 */

interface AuditLogViewerProps {
  patientId?: string; // If provided, show logs only for this patient
}

export function AuditLogViewer({ patientId }: AuditLogViewerProps) {
  const [dateFilter, setDateFilter] = useState<{
    start?: string;
    end?: string;
  }>({});

  const auditLogs = useMemo(() => {
    return getAllAuditLogs({
      patientId,
      startDate: dateFilter.start,
      endDate: dateFilter.end,
    });
  }, [patientId, dateFilter]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Access Audit Log</h2>
        <p style={styles.subtitle}>
          {patientId
            ? 'Patient-specific access history'
            : 'All patient record access events'}
        </p>
      </div>

      <div style={styles.filters}>
        <label>
          Start Date:
          <input
            type="date"
            value={dateFilter.start || ''}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, start: e.target.value })
            }
            style={styles.input}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateFilter.end || ''}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, end: e.target.value })
            }
            style={styles.input}
          />
        </label>
      </div>

      <div style={styles.logContainer}>
        {auditLogs.length === 0 ? (
          <p style={styles.emptyState}>No audit logs found</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Provider</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Patient ID</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>IP Address</th>
                {/* TODO: Add a column header for the access reason */}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/**
 * Individual row in the audit log table
 *
 * TODO: Update to display the access reason
 */
function AuditLogRow({ log }: { log: AuditLog }) {
  const formattedDate = new Date(log.timestamp).toLocaleString();

  return (
    <tr style={styles.row}>
      <td style={styles.td}>{formattedDate}</td>
      <td style={styles.td}>{log.providerName}</td>
      <td style={styles.td}>
        <span style={getRoleBadgeStyle(log.providerRole)}>
          {log.providerRole}
        </span>
      </td>
      <td style={styles.td}>
        <code>{log.patientId}</code>
      </td>
      <td style={styles.td}>
        <span style={getActionBadgeStyle(log.actionType)}>
          {log.actionType}
        </span>
      </td>
      <td style={styles.td}>
        <code style={styles.code}>{log.ipAddress}</code>
      </td>
      {/* TODO: Add a table cell to display the access reason */}
      {/* Consider: How should you handle logs that don't have a reason (from before the feature was implemented)? */}
    </tr>
  );
}

// Helper functions for styling

function getRoleBadgeStyle(role: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  };

  const roleColors: Record<string, React.CSSProperties> = {
    doctor: { backgroundColor: '#d1ecf1', color: '#0c5460' },
    nurse: { backgroundColor: '#d4edda', color: '#155724' },
    admin: { backgroundColor: '#fff3cd', color: '#856404' },
    specialist: { backgroundColor: '#e2e3e5', color: '#383d41' },
  };

  return { ...baseStyle, ...(roleColors[role] || roleColors.admin) };
}

function getActionBadgeStyle(action: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  };

  const actionColors: Record<string, React.CSSProperties> = {
    view: { backgroundColor: '#cfe2ff', color: '#084298' },
    edit: { backgroundColor: '#fff3cd', color: '#856404' },
    create: { backgroundColor: '#d1e7dd', color: '#0f5132' },
    delete: { backgroundColor: '#f8d7da', color: '#842029' },
  };

  return { ...baseStyle, ...(actionColors[action] || actionColors.view) };
}

// Simple inline styles for the exercise
const styles = {
  container: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '1200px',
    margin: '20px auto',
    backgroundColor: '#fff',
  },
  header: {
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '14px',
    margin: '5px 0 0 0',
  },
  filters: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  input: {
    marginLeft: '10px',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  logContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    fontWeight: 'bold',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
  },
  row: {
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  code: {
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6c757d',
  },
} as const;
