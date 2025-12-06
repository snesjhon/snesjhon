# Part 1: Design Document (40 minutes)

## The Challenge

Design a feature that allows providers to add a **reason** when accessing patient records. This reason should be:
- Easy for providers to enter (they're busy and won't fill out lengthy forms)
- Detailed enough to be useful for auditing and patient requests
- Compliant with HIPAA audit requirements
- Visible to appropriate stakeholders when reviewing access logs

## Your Task

Write a design document that addresses the following sections. Remember: your audience includes both technical team members and non-technical stakeholders (product managers, compliance officers).

---

## Design Document Template

### 1. Problem Summary
*In 2-3 sentences, describe the problem we're solving and why it matters to our users (medical practices).*

[Your response here]

---

### 2. Proposed Solution
*Describe your approach at a high level. What will the user experience look like? What will happen technically?*

[Your response here]

---

### 3. Key Design Decisions

*For each decision below, explain:*
- *What options you considered*
- *Which you chose and why*
- *The trade-offs involved*
- *Impact on user experience*

#### Decision 1: When to prompt for access reason
*Should we ask for a reason before showing the patient record, after, or somewhere else in the workflow?*

**Options considered:**
[Your response here]

**Decision:**
[Your response here]

**Trade-offs:**
[Your response here]

**User impact:**
[Your response here]

---

#### Decision 2: How structured should the reason be?
*Free text? Dropdown menu? Combination? How do we balance ease of use with data quality?*

**Options considered:**
[Your response here]

**Decision:**
[Your response here]

**Trade-offs:**
[Your response here]

**User impact:**
[Your response here]

---

#### Decision 3: What happens if a provider skips entering a reason?
*Can we make it optional? Required? Required only for certain types of access?*

**Options considered:**
[Your response here]

**Decision:**
[Your response here]

**Trade-offs:**
[Your response here]

**User impact:**
[Your response here]

---

### 4. Alternative Approaches
*What other solutions did you consider? Why did you decide against them?*

[Your response here]

---

### 5. Success Metrics
*How would you measure if this feature is successful? What would indicate we need to revisit the design?*

[Your response here]

---

### 6. Risks & Open Questions
*What concerns do you have? What would you want to validate with users or stakeholders?*

[Your response here]

---

### 7. Implementation Considerations
*Brief technical notes: What parts of the system will need to change? Any technical constraints or dependencies we should be aware of?*

[Your response here]

---

## Tips for Success

- ✅ Use plain language - avoid jargon where possible
- ✅ Focus on the "why" behind each decision
- ✅ Consider the provider's workflow (they're seeing 20+ patients per day)
- ✅ Think about different user roles (doctors, nurses, admin staff)
- ✅ Remember that compliance officers will need to pull reports from this data
- ✅ Be specific about user impact - don't just say "better UX"
- ❌ Don't propose a solution you can't explain the trade-offs for
- ❌ Don't skip the non-technical explanation (compliance officers aren't engineers)
