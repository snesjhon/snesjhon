# Handling Production Incidents

#interview-question 

## The Question

"Tell me about a time you handled a production incident" or "How do you approach production debugging?"

## Primary Example

**[[2024-promise-debugging]]** - Aborted Promise Errors

### Quick Summary (30 seconds)
Production error logs flooded with "Error was aborted" messages. Developed systematic approach to batch and categorize errors, identified that most were expected behavior from normal user navigation patterns. Reduced noise and focused team on actual issues.

### Detailed Walkthrough (2-3 minutes)

**The Incident**
- Error logs showing many "Error was aborted" messages
- Minimal context in error messages
- User impact unclear
- Couldn't reproduce locally

**My Response Process**

**1. Triage**
- Assessed severity (was this affecting users?)
- Checked error frequency and patterns
- Determined it wasn't causing user-facing failures

**2. Investigation**
- Standard debugging approaches failed
- Shifted to pattern recognition
- Batched errors by source and type

**3. Root Cause**
- Promises not resolving due to page navigation
- Users navigating away before async operations complete
- Expected browser behavior, not a bug

**4. Resolution**
- Categorized errors into expected vs. unexpected
- Filtered out expected navigation-related errors
- Reduced noise for team to focus on real issues

**5. Prevention**
- Better error categorization
- Improved logging context
- Team understanding of expected vs. unexpected errors

## Key Points to Emphasize

### Incident Response Skills
- Triage and prioritization
- Systematic investigation
- Clear communication with team
- Root cause analysis

### Technical Skills
- Production debugging without local reproduction
- Error log analysis
- Understanding async behavior and browser lifecycle

### Outcome
- Reduced false positives
- Improved team focus
- Better error handling strategy

## Follow-up Questions to Prepare For

### "How did you communicate with stakeholders?"
- Kept team updated on investigation progress
- Clear about impact (or lack thereof)
- Explained when "errors" were expected behavior

### "What was your timeline to resolution?"
- *Be honest about how long investigation took*
- Emphasize systematic approach
- Highlight when you changed tactics

### "How did you prevent this from happening again?"
- Better error categorization from the start
- Improved logging with more context
- Team education on expected vs. unexpected errors

### "What would you have done if it was user-facing?"
- Immediate mitigation (rollback if needed)
- Faster escalation
- Clear user communication
- Post-incident review

### "How did you know when it was resolved?"
- Error rate reduction
- Confirmed expected errors were now filtered
- Team could focus on real issues

## Related Experiences
- [[debugging-challenges]] - Similar systematic debugging approach
- [[performance-optimization]] - Production analysis without local reproduction

---

**Practice tip**: Production incident questions assess your crisis management and debugging under pressure. Emphasize your systematic approach and clear thinking.
