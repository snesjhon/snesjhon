# Promise Cancellation Debugging

#experience #debugging #production #frontend
#tech/react

**Answers Interview Questions:**
- [[debugging-challenges]] - Challenging debugging scenarios
- [[production-incidents]] - Handling production issues

## Context

Error logging showed "Error was aborted" messages with no clear indication of root cause - a particularly challenging debugging scenario.

## The Problem

Error logs provided minimal information:
- Generic "Error was aborted" messages
- No clear stack traces
- Difficult to reproduce
- Unclear which errors deserved attention vs. which were noise

## My Debugging Process

### Standard Debugging Checklist
1. Try to reproduce the issue
2. Analyze the stack trace
3. Check if others can reproduce
4. Review recent releases for related changes

### When Standard Approaches Failed
When all standard approaches came up empty, I needed a different strategy.

## The Investigation

### Root Cause Discovery
- Front-end wasn't properly resolving promises
- Promises were being called and put on the stack
- Not resolving due to multiple reasons
- Most commonly: users navigating away before promises could complete

### My Approach

**1. Identify and Batch**
- Categorized errors by source
- Determined which errors actually deserved attention
- Separated signal from noise

**2. Noise Reduction**
- Recognized that quick browser navigation naturally prevents promise resolution
- We don't have enough time to cancel these promises when users navigate away quickly
- This is expected behavior, not a bug

**3. Implementation**
- Ignored certain categories of noise
- Reduced overall error count by filtering out expected failures
- Focused team attention on actual issues

## Technologies Used
- [[react]] - Promise handling and lifecycle
- Error logging system
- Browser DevTools

## Interview Talking Points

### For Debugging Questions
- **Challenge**: Minimal error information with generic messages
- **Process**: Systematic elimination of standard debugging approaches
- **Innovation**: Categorization and batching to identify patterns
- **Outcome**: Separated signal from noise, reducing false positives

### For Problem-Solving Questions
- When standard debugging fails, need creative approaches
- Pattern recognition across multiple error instances
- Understanding expected vs. unexpected behavior

### For Production Incident Questions
- Error logging limitations and how to work around them
- Prioritization of errors based on actual impact
- Noise reduction to focus team effort

## Key Learnings

### About Error Handling
- Not all errors are equal - some are expected system behavior
- Error logging needs context to be useful
- Batching and categorization reveal patterns

### About Promises
- User navigation patterns affect promise resolution
- Quick navigation creates "errors" that aren't really bugs
- Need to account for normal user behavior in error handling

## Impact
- Reduced noise in error logs
- Team could focus on actual issues
- Better understanding of what constitutes a real error vs. expected behavior
