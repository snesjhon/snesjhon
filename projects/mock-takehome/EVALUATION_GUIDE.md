# Evaluation Guide

This document outlines how your take-home exercise will be evaluated. Use this to understand what we're looking for and to self-assess your work before submission.

## Overall Criteria

Your submission will be evaluated across five main dimensions:

1. **Technical Execution** (30%)
2. **Communication & Documentation** (25%)
3. **Product Thinking** (20%)
4. **Code Quality** (15%)
5. **Time Management** (10%)

---

## Part 1: Design Document (40 minutes)

### What We're Evaluating

#### Communication Clarity (Critical)
- ✅ Can a non-technical stakeholder understand your decisions?
- ✅ Do you explain trade-offs in plain language?
- ✅ Is the user impact clearly articulated?
- ❌ Avoid excessive technical jargon
- ❌ Don't assume everyone knows terms like "middleware" or "state management"

#### Decision Quality
- ✅ Do you consider multiple options for each decision?
- ✅ Are your trade-offs realistic and thoughtful?
- ✅ Do you acknowledge what you're optimizing for (speed vs. data quality, etc.)?
- ❌ Don't propose solutions without explaining why other options were rejected
- ❌ Don't claim a solution has no downsides

#### User Empathy
- ✅ Do you consider the provider's workflow (busy, time-pressured)?
- ✅ Do you think about different user roles (doctors vs. nurses vs. admin)?
- ✅ Do you balance compliance requirements with usability?
- ❌ Don't optimize only for compliance without considering UX
- ❌ Don't propose flows that would frustrate busy healthcare providers

#### Completeness
- ✅ Did you address all the required sections?
- ✅ Did you include success metrics?
- ✅ Did you identify risks and open questions?
- ❌ Don't leave sections blank or with placeholder text

### Example: Strong vs. Weak Responses

**Decision: When to prompt for access reason**

❌ **Weak Response:**
> "We'll use a modal popup. Modals are a common UX pattern and work well."

✅ **Strong Response:**
> "We'll show an inline prompt above the patient record with suggested reasons (dropdown) plus a free-text field.
>
> **Why not a blocking modal?** Healthcare providers often need urgent access to records. A blocking modal could delay care in emergencies. An inline prompt lets them see critical info (name, DOB, allergies) while still capturing the reason.
>
> **Trade-off:** Some providers might skip the reason field if it's not blocking. We'll address this by:
> 1. Making it highly visible (bright yellow background)
> 2. Setting the input focus automatically
> 3. Tracking skip rates and showing providers their completion % monthly
>
> **User impact:** Providers can access critical info in <2 seconds while still documenting properly. For non-urgent access, the suggested reasons make it a 1-click action."

---

## Part 2: Implementation (70 minutes)

### What We're Evaluating

#### Functional Completeness (Critical)
- ✅ Does the feature work end-to-end?
- ✅ Can you capture an access reason?
- ✅ Is it stored in the audit log?
- ✅ Can you view it in the audit log viewer?
- ❌ Don't leave critical TODOs unfinished
- ❌ Don't implement half the feature (e.g., capture the reason but don't display it)

#### TypeScript Quality
- ✅ Are types used correctly and consistently?
- ✅ Is type inference leveraged where appropriate?
- ✅ Are there any `any` types? (There shouldn't be)
- ✅ Do types accurately reflect the data model?
- ❌ Don't use overly complex types when simple ones work
- ❌ Don't use `any` or `@ts-ignore` to bypass type errors

#### Code Readability
- ✅ Is your code easy to understand?
- ✅ Are variable and function names descriptive?
- ✅ Is the code structure logical?
- ✅ Would another developer understand this in 6 months?
- ❌ Don't write overly clever code
- ❌ Don't use abbreviations that aren't obvious

#### Comments & Documentation
- ✅ Did you document your assumptions?
- ✅ Did you explain non-obvious decisions in comments?
- ✅ Did you note what you'd do differently with more time?
- ✅ Are comments helpful, not just restating code?
- ❌ Don't over-comment obvious code
- ❌ Don't leave TODO comments for things you could have done in the time allotted

#### Edge Case Handling
- ✅ What happens if the reason is empty?
- ✅ What happens with very long text?
- ✅ What about old audit logs without a reason?
- ✅ Did you handle or document these cases?
- ❌ Don't ignore obvious edge cases
- ❌ Don't over-engineer for unlikely scenarios

#### User Experience
- ✅ Is the flow intuitive?
- ✅ Are loading states handled?
- ✅ Is the UI accessible (basic considerations)?
- ✅ Does it fit the provider's workflow?
- ❌ Don't create confusing or multi-step flows for simple tasks
- ❌ Don't forget about error states

### Example: Strong vs. Weak Implementation

**Capturing the Access Reason**

❌ **Weak Implementation:**
```typescript
// Just added a text input somewhere
<input type="text" onChange={(e) => setReason(e.target.value)} />
```

✅ **Strong Implementation:**
```typescript
/**
 * Access reason capture component
 *
 * Shown inline above patient record to capture why the provider
 * is accessing this record. Uses suggested reasons for common
 * cases to speed up entry, with free-text fallback.
 *
 * Design decision: Not blocking access because providers need
 * to see critical info (allergies, medications) immediately in
 * emergencies. Instead, this uses visual prominence and auto-focus
 * to encourage completion.
 */
function AccessReasonPrompt({ onSubmit }: Props) {
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'suggested' | 'custom'>('suggested');

  const commonReasons = [
    'Scheduled appointment',
    'Emergency care',
    'Follow-up visit',
    'Medication refill',
    'Lab results review',
  ];

  const handleSubmit = () => {
    // Validation: require at least 3 characters
    if (reason.trim().length < 3) {
      // Show error state
      return;
    }
    onSubmit(reason.trim());
  };

  // ... rest of implementation with proper UX, validation, etc.
}
```

---

## Time Management Assessment

### Part 1 (40 minutes)
- ✅ 0-5 min: Read the prompt carefully, understand all sections
- ✅ 5-30 min: Write your responses, focus on the "why"
- ✅ 30-38 min: Review, polish, ensure non-technical clarity
- ✅ 38-40 min: Final read-through

### Part 2 (70 minutes)
- ✅ 0-10 min: Read all the code, understand the structure
- ✅ 10-15 min: Plan your approach, identify files to modify
- ✅ 15-50 min: Implement the core feature (types → service → components)
- ✅ 50-60 min: Add validation, error handling, polish
- ✅ 60-68 min: Test, review, add comments
- ✅ 68-70 min: Final check, run type-check

### Red Flags for Time Management
- ❌ Spending 20+ minutes on Part 1 design doc without writing anything
- ❌ Implementing complex features not in the requirements
- ❌ Getting stuck on one small issue for 15+ minutes
- ❌ Not leaving time to review and test
- ❌ Leaving the main feature incomplete while polishing minor details

---

## Self-Assessment Checklist

Before submitting, ask yourself:

### Part 1: Design Document
- [ ] Would a product manager understand my decisions?
- [ ] Would a compliance officer understand the HIPAA implications?
- [ ] Have I explained the "why" for each decision?
- [ ] Have I been specific about user impact (not just "better UX")?
- [ ] Have I acknowledged trade-offs honestly?
- [ ] Are there any sections left blank?

### Part 2: Implementation
- [ ] Can I capture an access reason from the user?
- [ ] Is it stored in the audit log?
- [ ] Can I see it in the audit log viewer?
- [ ] Does `npm run type-check` pass without errors?
- [ ] Have I handled (or documented) edge cases?
- [ ] Is my code readable by someone who hasn't seen it before?
- [ ] Have I commented my assumptions and non-obvious decisions?
- [ ] If I ran out of time, did I document what I would do next?

### Overall
- [ ] Did I stay within the time limits?
- [ ] Is my submission complete (both parts finished)?
- [ ] Would I be proud to show this to my team?

---

## Common Pitfalls to Avoid

1. **Over-engineering**: Adding features not requested (e.g., full RBAC system, complex validation rules)
2. **Under-communicating**: Not explaining your reasoning
3. **Ignoring constraints**: Forgetting this is for busy healthcare providers
4. **Incomplete solutions**: Implementing capture but not display (or vice versa)
5. **Poor time management**: Spending 60 minutes on Part 1 and rushing Part 2
6. **Skipping the basics**: Leaving TypeScript errors, not testing the flow
7. **Overconfidence**: Proposing solutions without acknowledging downsides

---

## What "Good" Looks Like

A strong submission will:

- **Part 1**: Read like a real product spec that both engineers and PMs can act on
- **Part 2**: Work correctly, handle edge cases, and be maintainable
- **Both**: Show clear thinking, good communication, and attention to real-world constraints

Remember: We're not looking for perfection. We're looking for:
- How you think about problems
- How you make trade-offs
- How you communicate technical decisions
- How you write code that others will maintain

Good luck! 🚀
