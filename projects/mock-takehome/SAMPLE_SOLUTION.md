# Sample Solution Guide

⚠️ **IMPORTANT: Only review this AFTER completing your own attempt!**

This document shows one possible solution to the exercise. Your solution may be different and that's OK! There are many valid approaches to this problem.

---

## Part 1: Design Document - Sample Response

### 1. Problem Summary

Medical providers currently access patient records without documenting why, making it difficult to investigate privacy breaches, respond to patient data requests, and identify training opportunities. We need to capture the access reason in a way that's fast enough for busy clinical workflows while providing meaningful data for HIPAA compliance and security auditing.

### 2. Proposed Solution

**User Experience:**
When a provider clicks to open a patient record, they'll see the critical patient information (name, DOB, allergies) immediately, with a prominent inline form above the full record asking "Why are you accessing this record?" The form will show 5 common reasons as one-click buttons ("Scheduled appointment", "Emergency", "Follow-up visit", "Medication refill", "Other") with a text field that appears if they select "Other".

**Technical Flow:**
- Provider clicks patient → Patient viewer loads with basic info visible
- Auto-focused reason capture form appears inline (not blocking)
- Provider selects or enters reason → Form submits via `logPatientAccess(patient, provider, reason)`
- Access is logged to audit database with timestamp, provider info, and reason
- Full patient record becomes available (it was always accessible, just visually de-emphasized)

### 3. Key Design Decisions

#### Decision 1: When to prompt for access reason

**Options considered:**
1. **Blocking modal before access** - Provider must enter reason before seeing any patient data
2. **Inline prompt with immediate access** - Critical info visible, full record slightly delayed
3. **Post-access prompt** - Show record first, ask for reason after
4. **No prompt, just audit** - Log access without asking for reason

**Decision:** Option 2 - Inline prompt with immediate critical info visible

**Trade-offs:**
- **Pro:** Doesn't delay emergency care (providers can see allergies, active meds immediately)
- **Pro:** Still captures reason for >90% of cases (based on similar healthcare UX patterns)
- **Con:** Not 100% enforceable - providers could skip the prompt
- **Con:** Slightly more complex UI than a simple modal

**Why not blocking modal?** In healthcare, seconds matter. If a patient is having an allergic reaction, the provider needs to see the allergy list NOW, not after filling out a form. We can't let compliance requirements endanger patient safety.

**Why not post-access?** Providers are less likely to fill it out after they've already seen what they need. Completion rates would be <50%.

**User impact:**
Providers in emergency situations can access critical info in under 2 seconds. For routine access (80%+ of cases), they can click a suggested reason in under 3 seconds. Overall, this adds ~2-3 seconds to the workflow, which is acceptable given the compliance value.

---

#### Decision 2: How structured should the reason be?

**Options considered:**
1. **Free text only** - Provider types whatever they want
2. **Dropdown only** - Provider selects from predefined list
3. **Hybrid: Suggested buttons + "Other" free text** - Common reasons as buttons, uncommon reasons as text
4. **Structured categories with subcategories** - e.g., "Clinical" → "Emergency", "Administrative" → "Billing inquiry"

**Decision:** Option 3 - Hybrid approach with suggested buttons and "Other" text field

**Trade-offs:**
- **Pro:** Fast for common cases (80% of access is routine - appointment, follow-up, refill)
- **Pro:** Flexible for uncommon cases (investigation, peer review, education)
- **Pro:** Provides structured data for reporting while allowing nuance
- **Con:** Requires maintaining a list of "common" reasons
- **Con:** Slightly more UI complexity than a single input

**Why not free text only?** We'd get inconsistent data ("appt", "appointment", "scheduled visit" are all the same). Hard to aggregate for compliance reports.

**Why not dropdown only?** Healthcare is too complex for a fixed list. There are legitimate reasons we can't predict. We need flexibility.

**User impact:**
For a doctor seeing 20 patients/day: 16 patients are scheduled appointments (1 click, <1 second), 3 are follow-ups (1 click), 1 might be an emergency or unusual case (5-10 seconds to type). Daily time cost: ~20 seconds. Monthly time cost: 6-7 minutes. This is acceptable given that it saves hours of investigation time when a privacy concern arises.

**Implementation note:**
The suggested reasons would be configurable per organization. A cardiology practice might want "Cardiac event" as a suggested reason, while a pediatrics practice might want "Well-child visit".

---

#### Decision 3: What happens if a provider skips entering a reason?

**Options considered:**
1. **Strictly required** - Cannot access record without entering reason
2. **Soft required** - Can access, but get nagged and manager gets notified
3. **Optional with tracking** - Can skip, but skip rate is tracked and reviewed
4. **Required for certain roles only** - Admins must explain, doctors don't have to

**Decision:** Option 3 - Optional with aggressive tracking and nudging

**Implementation:**
- Access is logged even without a reason, but flagged as "no reason provided"
- Prominent visual reminder stays visible until reason is entered
- Provider's monthly "compliance score" includes reason completion rate
- If completion rate drops below 70%, their manager is notified
- Audit reports highlight "no reason" entries for investigation

**Trade-offs:**
- **Pro:** Never blocks urgent patient care
- **Pro:** Creates social pressure to comply without technical enforcement
- **Pro:** Allows investigation of patterns (is one doctor never entering reasons?)
- **Con:** Not 100% compliant in the strictest interpretation
- **Con:** Requires building compliance dashboards
- **Con:** Relies on organizational culture, not just technical enforcement

**Why not strictly required?** Patient safety trumps data completeness. We cannot create a system that could delay life-saving care.

**Why not purely optional with no tracking?** Compliance rates would be <30%. The feature would provide almost no value.

**User impact:**
Providers feel trusted (not locked out) but accountable (their completion rate is visible). In practice, most providers comply because it takes 2 seconds and they don't want to be the one person with a low compliance score in the monthly report.

**Risk mitigation:**
- First 30 days are "grace period" - track but don't report to managers
- Provide training on why this matters (real breach investigation stories)
- Make it so easy that there's no excuse not to do it

---

### 4. Alternative Approaches

**Voice dictation for reasons:**
- Considered using speech-to-text for hands-free reason entry
- Rejected because: Privacy concerns (might be overheard), accuracy issues, not all providers work in private spaces
- Could revisit for specific settings (e.g., surgical areas where hands aren't free)

**AI-inferred reasons based on context:**
- Considered auto-filling reason based on: time of day, patient's appointment schedule, provider's calendar
- Example: If patient has appointment scheduled for 2pm and accessed at 1:58pm, suggest "Scheduled appointment"
- Rejected for initial version because: Complex to implement, could be wrong (doctor might be looking at records before an emergency), would need manual override anyway
- Good candidate for v2 enhancement

**Integration with EHR appointment system:**
- Considered pulling reason from appointment notes automatically
- Rejected because: Not all access is appointment-based, would require deep EHR integration (3-6 month project)
- Would be ideal long-term solution

---

### 5. Success Metrics

**Primary metrics:**
- **Completion rate**: % of patient record accesses with a reason entered (target: >85% within 3 months)
- **Time to access**: Median time from click to full record view (target: <5 seconds, current: ~2 seconds)
- **Provider satisfaction**: Survey score on "this feature doesn't slow me down" (target: >4/5)

**Secondary metrics:**
- **Audit usefulness**: When investigating privacy concerns, % of cases where the reason helps determine legitimacy (target: >70%)
- **Reason quality**: Manual review of sample reasons to ensure they're meaningful (not "n/a", "test", etc.)
- **Compliance officer time saved**: Hours saved per month on breach investigations (baseline TBD)

**Failure signals (indicating we need to revisit design):**
- Completion rate <70% after 3 months (means UX is too difficult)
- Time to access >10 seconds (means we're slowing providers down too much)
- Provider complaints about "clicking through prompts" in emergencies
- High "Other" usage (>40%) indicating our suggested reasons aren't relevant

---

### 6. Risks & Open Questions

**Risks:**
1. **Provider resistance**: Doctors may see this as "more bureaucracy" and resist adoption
   - Mitigation: Involve physicians in design, emphasize patient safety and practice protection
2. **Emergency access delays**: Even with inline design, might delay critical access
   - Mitigation: Monitor time-to-access metrics closely, have override for true emergencies
3. **Gaming the system**: Providers might always click "Other" or type "routine"
   - Mitigation: Periodic audits, dashboards showing reason distribution by provider

**Open Questions:**
- Should we allow bulk reason entry? (e.g., doctor reviews 10 patients, enters reason once)
- How do we handle automated systems accessing records? (e.g., nightly backup jobs)
- Should patients be able to see the access reasons when they request their access logs?
- What's the retention period for access reasons? (HIPAA minimum is 6 years)

**Validation needed:**
- Shadow 3-5 providers for a day to understand workflow timing
- Interview compliance officers about what makes a "useful" reason
- Review actual breach investigation cases to see what info would have helped

---

### 7. Implementation Considerations

**Database changes:**
- Add `access_reason` text field to `audit_logs` table (nullable for backwards compatibility)
- Add `reason_category` enum field for structured reporting
- Add indexes on reason fields for faster compliance reporting

**API changes:**
- Update `POST /api/patient/:id/access` endpoint to accept optional `reason` parameter
- Add `GET /api/audit/compliance-report` for manager dashboards
- Ensure audit log writes are idempotent (don't double-log if network retry)

**Frontend changes:**
- New `AccessReasonPrompt` component
- Update `PatientRecordViewer` to integrate the prompt
- Update `AuditLogViewer` to display reasons
- Add provider compliance dashboard page

**Dependencies:**
- Needs user role system to be in place (for manager notifications)
- Needs analytics infrastructure for tracking completion rates
- May need messaging system for notifications (could start with email)

**Timeline considerations:**
- Phase 1 (MVP): Capture and display reasons (2-3 weeks)
- Phase 2: Compliance dashboards (2 weeks)
- Phase 3: Manager notifications and reports (1 week)
- Total: ~6 weeks for full rollout

**Rollout plan:**
- Week 1: Deploy to one small practice (3-5 providers) for beta testing
- Week 3: Expand to 20% of organization
- Week 6: Full rollout with monitoring
- Week 12: Review metrics and iterate

---

## Part 2: Implementation - Sample Code

### File: `src/types/index.ts`

```typescript
export interface AuditLog {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  providerRole: Provider['role'];
  timestamp: string;
  actionType: 'view' | 'edit' | 'create' | 'delete';
  ipAddress: string;

  /**
   * Reason for accessing the patient record
   *
   * Optional because:
   * 1. Backwards compatibility - logs created before this feature won't have it
   * 2. Feature design - we don't block access if reason isn't provided
   *
   * When undefined, it means either:
   * - Old log entry (before feature launch)
   * - Provider skipped entering a reason (which we track separately)
   */
  accessReason?: string;

  /**
   * Category of the access reason (for structured reporting)
   * Undefined if custom reason was entered or if old log entry
   */
  reasonCategory?: 'scheduled_appointment' | 'emergency' | 'follow_up' | 'medication_refill' | 'other';
}
```

### File: `src/services/auditService.ts`

```typescript
export function logPatientAccess(
  patient: Patient,
  provider: Provider,
  accessReason?: string,
  reasonCategory?: AuditLog['reasonCategory']
): AuditLog {
  const auditLog: AuditLog = {
    id: generateId(),
    patientId: patient.id,
    providerId: provider.id,
    providerName: provider.name,
    providerRole: provider.role,
    timestamp: new Date().toISOString(),
    actionType: 'view',
    ipAddress: getMockIpAddress(),
    // Include reason if provided
    // Note: We're allowing undefined here because the feature design
    // permits access without a reason (though we track and discourage it)
    accessReason: accessReason?.trim() || undefined,
    reasonCategory,
  };

  auditLogs.push(auditLog);

  return auditLog;
}
```

### File: `src/components/PatientRecordViewer.tsx`

```typescript
export function PatientRecordViewer({
  patient,
  currentProvider,
  onClose
}: PatientRecordViewerProps) {
  const [accessReason, setAccessReason] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<AuditLog['reasonCategory']>();
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [hasLoggedAccess, setHasLoggedAccess] = useState(false);

  /**
   * Common access reasons as quick-click buttons
   * In production, these would be configurable per organization
   */
  const commonReasons: Array<{ label: string; category: AuditLog['reasonCategory'] }> = [
    { label: 'Scheduled Appointment', category: 'scheduled_appointment' },
    { label: 'Emergency', category: 'emergency' },
    { label: 'Follow-up Visit', category: 'follow_up' },
    { label: 'Medication Refill', category: 'medication_refill' },
  ];

  const handleQuickReason = (reason: string, category: AuditLog['reasonCategory']) => {
    // Log access with the selected reason
    logPatientAccess(patient, currentProvider, reason, category);
    setHasLoggedAccess(true);
    setAccessReason(reason);
    setReasonCategory(category);
  };

  const handleCustomReason = () => {
    // Validation: Require at least 3 characters for custom reasons
    // This prevents meaningless entries like "ok", "x", etc.
    if (accessReason.trim().length < 3) {
      alert('Please enter a reason (at least 3 characters)');
      return;
    }

    logPatientAccess(patient, currentProvider, accessReason, 'other');
    setHasLoggedAccess(true);
    setReasonCategory('other');
  };

  /**
   * Allow providers to skip the reason prompt
   * This is intentional per the design - we don't block access
   * But we track it and create social pressure to comply
   */
  const handleSkip = () => {
    // Log access without a reason - this will be flagged in compliance reports
    logPatientAccess(patient, currentProvider);
    setHasLoggedAccess(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Patient Record</h2>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>

      {/* Critical patient info - always visible immediately */}
      <div style={styles.criticalInfo}>
        <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
        <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
        <p><strong>MRN:</strong> {patient.medicalRecordNumber}</p>
      </div>

      {/* Access reason prompt - shown until reason is provided */}
      {!hasLoggedAccess && (
        <div style={styles.reasonPrompt}>
          <h3>Why are you accessing this record?</h3>

          {!showCustomReason ? (
            <>
              <div style={styles.reasonButtons}>
                {commonReasons.map(({ label, category }) => (
                  <button
                    key={category}
                    onClick={() => handleQuickReason(label, category)}
                    style={styles.reasonButton}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomReason(true)}
                  style={styles.reasonButtonOther}
                >
                  Other reason...
                </button>
              </div>
              <button onClick={handleSkip} style={styles.skipButton}>
                Skip (not recommended)
              </button>
            </>
          ) : (
            <div style={styles.customReasonForm}>
              <input
                type="text"
                placeholder="Enter reason for access..."
                value={accessReason}
                onChange={(e) => setAccessReason(e.target.value)}
                style={styles.textInput}
                autoFocus
                maxLength={200}
              />
              <div style={styles.formButtons}>
                <button onClick={handleCustomReason} style={styles.submitButton}>
                  Submit
                </button>
                <button
                  onClick={() => setShowCustomReason(false)}
                  style={styles.backButton}
                >
                  Back to suggestions
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full patient record - de-emphasized until reason is entered */}
      <div style={hasLoggedAccess ? styles.content : styles.contentBlurred}>
        {/* ... rest of patient record display ... */}

        {hasLoggedAccess && accessReason && (
          <div style={styles.accessInfo}>
            <small>
              Accessed by: {currentProvider.name} ({currentProvider.role})
              <br />
              Reason: {accessReason}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

// Additional styles
const additionalStyles = {
  criticalInfo: {
    backgroundColor: '#fff3cd',
    padding: '15px',
    borderRadius: '4px',
    borderLeft: '4px solid #ffc107',
    marginBottom: '20px',
  },
  reasonPrompt: {
    backgroundColor: '#d1ecf1',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #0c5460',
    marginBottom: '20px',
  },
  reasonButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '15px',
  },
  reasonButton: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  contentBlurred: {
    filter: 'blur(3px)',
    pointerEvents: 'none' as const,
    opacity: 0.6,
  },
};
```

### File: `src/components/AuditLogViewer.tsx`

```typescript
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
      <td style={styles.td}>
        {log.accessReason ? (
          <span style={styles.reason}>
            {log.accessReason}
          </span>
        ) : (
          <span style={styles.noReason}>
            No reason provided
          </span>
        )}
      </td>
    </tr>
  );
}

// Add table header
<th style={styles.th}>Access Reason</th>

// Additional styles for the reason column
const reasonStyles = {
  reason: {
    color: '#155724',
    fontSize: '13px',
  },
  noReason: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '11px',
    fontStyle: 'italic' as const,
  },
};
```

---

## Key Takeaways from This Sample

1. **Design doc focuses on "why"**: Every decision explains the reasoning and trade-offs
2. **User empathy throughout**: Constant consideration of busy healthcare providers
3. **Acknowledges trade-offs**: Doesn't claim the solution is perfect
4. **Implementation is complete**: Works end-to-end with proper types
5. **Comments explain decisions**: Code includes context for future maintainers
6. **Handles edge cases**: Old logs, empty reasons, validation
7. **Balances simplicity and completeness**: Not over-engineered, but handles the requirements

Your solution doesn't need to match this exactly! This is just one possible approach. The important parts are:
- Clear reasoning
- Complete implementation
- Good communication
- Thoughtful trade-offs

