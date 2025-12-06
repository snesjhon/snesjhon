---
description: Tell me about a challenging bug you debugged
---
# Debugging Challenging Issues

#interview-question #experience/debugging 

## The Question

"Tell me about a challenging bug you debugged" or "Describe a difficult technical problem you solved"

## Primary Example

**[[2024-promise-debugging]]** - Promise Cancellation Production Issue

### Quick Summary (30 seconds)
Faced production errors with minimal information - just "Error was aborted" messages. Developed a batching and categorization approach to separate signal from noise, discovering that most "errors" were expected behavior from users navigating away quickly. Reduced false positives and focused team on actual issues.

### Detailed Walkthrough (2-3 minutes)

**The Challenge**
- Generic error messages: "Error was aborted"
- No clear stack traces
- Couldn't reproduce locally
- Unclear which errors were real vs. noise

**Standard Debugging Attempts (All Failed)**
1. Try to reproduce → couldn't
2. Analyze stack trace → minimal info
3. Check if others can reproduce → no
4. Review recent releases → nothing related

**My Approach When Standard Methods Failed**
- Shifted to pattern recognition
- Batched and categorized errors by source
- Separated which errors deserved attention vs. which were noise

**The Discovery**
- Frontend promises being called but not resolving
- Root cause: users navigating away before completion
- This was expected behavior, not a bug

**Solution**
- Ignored certain categories of expected "errors"
- Reduced overall error noise
- Focused team attention on actual issues

## Alternative Example

**[[2024-performance-optimization]]** - Profiling at Scale
- Issues that only appeared for large merchants
- Systematic profiling to identify 10k+ node threshold

## Key Points to Emphasize

### Problem-Solving Approach
- Standard debugging checklist
- What to do when standard approaches fail
- Creative pattern recognition

### Technical Skills
- Error log analysis
- Understanding promise lifecycle
- Production debugging without reproduction

### Impact
- Noise reduction in error logs
- Team focus on real issues
- Better understanding of system behavior

## Follow-up Questions to Prepare For

### "How did you know it wasn't a real bug?"
- Pattern analysis showed correlation with quick navigation
- Expected behavior given browser lifecycle
- Promises can't resolve if page unloads

### "What would you have done if you couldn't solve it?"
- Escalate to team with more context
- Add more logging/instrumentation
- Create reproduction environment with customer data (if possible)

### "How did you prevent this in the future?"
- Better error categorization
- Understanding what's expected vs. unexpected
- Improved error logging with context

### "What did you learn?"
- Not all errors are bugs - some are expected system behavior
- Batching and categorization reveal patterns
- Error logging needs context to be useful

### "How long did this take?"
- *Be honest about timeline*
- Emphasize the systematic approach
- Highlight when you knew to try different tactics

## Related Experiences
- [[performance-optimization]] - Similar diagnostic approaches
- [[production-incidents]] - Production debugging patterns

---

**Practice tip**: Emphasize your systematic approach and what you tried when standard methods failed. Interviewers want to see problem-solving process.
