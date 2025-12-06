# Performance Issue Identification & Resolution

#interview-question #performance

## The Question

"Tell me about a time you identified and resolved a performance issue" or "How do you approach performance optimization?"

## Primary Example

**[[2024-performance-optimization]]** - Large Merchant Performance Issues

### Quick Summary (30 seconds)
Identified performance issues that only appeared for large-scale merchants. Used profiling and heap snapshot analysis to discover visualization failures at 10k+ nodes. Optimized TanStack Query patterns to achieve millisecond improvements that significantly impacted user experience at scale.

### Detailed Walkthrough (2-3 minutes)

**How I Identified the Problem**
- Performance varied dramatically by customer size
- Small merchants: no issues
- Large to massive merchants: significant slowdowns
- Required testing across different customer tiers to even see the problem

**Diagnosis Approach**
- Front-end profiling for user-reported issues we couldn't initially replicate
- Heap snapshot analysis using error logger
- Dev-tools deep dives to identify patterns
- **Key discovery**: 10k+ node threshold where visualizations failed

**Solution Strategy**
- Deep-dive into TanStack Query optimization opportunities
- Used AI (Claude) to validate ideas before implementing
- Focused on millisecond improvements that mattered at scale

**Results**
- Measurable load time improvements for large merchants
- Better visualization performance at scale
- More targeted optimization approach based on customer tier

## Key Points to Emphasize

### Before/After Metrics
- Specific load time improvements
- Node count thresholds identified
- Customer tier impact analysis

### Diagnostic Process
- Couldn't replicate locally - had to use production data
- Systematic profiling approach
- Pattern recognition across different scenarios

### Technical Depth
- Heap snapshot analysis
- TanStack Query optimization patterns
- Understanding scale-dependent performance issues

### Tradeoffs Balanced
- Which customer tiers to prioritize
- Complexity vs. performance gains
- When to optimize vs. accept current performance

## Follow-up Questions to Prepare For

### "How did you measure the problem?"
- Heap snapshots from production
- Front-end profiling tools
- Error logging analysis
- Customer tier comparison

### "What were the before/after metrics?"
- Millisecond improvements at scale
- Visualization node count thresholds (10k+)
- User experience improvements for large merchants

### "How did you diagnose it?"
- Multi-tier customer testing
- Production data analysis (couldn't replicate locally)
- Dev-tools profiling
- Pattern identification

### "Did you need to balance tradeoffs?"
- Yes - complexity vs. performance
- Prioritizing which customer tiers to optimize for
- Understanding which optimizations provided best ROI

### "How did you roll out the improvement safely?"
- *Add details if you did staged rollout*
- Monitoring impact across customer tiers
- Validating improvements with production data

## Related Experiences
- [[debugging-challenges]] - Similar diagnostic approaches
- [[2024-unified-analytics]] - Performance considerations during migration

---

**Practice tip**: Be ready to discuss specific metrics and tooling in depth. Interviewers love concrete numbers.
