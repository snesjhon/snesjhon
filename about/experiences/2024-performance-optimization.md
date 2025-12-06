# Performance Optimization for Large Merchants

#experience/performance #experience/frontend #profiling
#tech/tanstack-query #tech/react

**Answers Interview Questions:**
- [[performance-optimization]] - Performance issue identification and resolution
- [[debugging-challenges]] - Diagnostic approach and measurement

## Context

Performance issues weren't uniform across all customers - small merchants had no issues, but large to massive merchants experienced significant slowdowns.

## The Problem

Performance issues manifested differently across customer tiers:
- Small merchants: No noticeable issues
- Large merchants: Noticeable slowdowns
- Massive merchants: Significant performance degradation

## How I Identified the Issue

### Multi-level Customer Analysis
- Recognized that performance must be evaluated across different customer sizes
- Small customer testing wouldn't reveal issues that massive customers faced
- Needed to test with real-world large datasets

### Profiling Approach
- Front-end profiling for user-reported slowdowns we couldn't initially replicate
- Deep dives on heap snapshots using error logger
- Dev-tools analysis to identify patterns
- **Discovery**: Visualizations loaded fine up to a certain threshold, but failed with 10k+ nodes

## My Solution

### Technology Deep-Dive
- Worked extensively with [[tanstack-query]] to understand optimization opportunities
- Used AI (Claude) as a validation tool - validating multiple ideas before implementing
- Focused on understanding the underlying technology we had already chosen

### Optimization Strategy
- Targeted improvements that would benefit large to massive merchants
- Even millisecond improvements had noticeable impact at scale
- Prioritized changes based on customer tier impact

## Technologies Used
- [[tanstack-query]] - Query optimization and caching strategies
- React DevTools - Profiling and performance analysis
- Error logging system - Heap snapshot analysis

## Interview Talking Points

### For Performance Questions
- **Diagnosis**: Multi-tier customer testing revealed scale-dependent issues
- **Measurement**: Heap snapshots, profiling, and identifying node count thresholds
- **Approach**: Deep-dive into existing technology (TanStack Query) rather than adding new tools
- **Metrics**: Millisecond improvements at scale = noticeable user experience gains

### For Problem-Solving Questions
- Couldn't replicate locally - had to use production data analysis
- Pattern identification through systematic profiling
- Understanding when problems manifest (10k+ nodes threshold)

### For Technical Depth Questions
- Heap snapshot analysis
- Understanding query optimization patterns
- Using AI as a validation tool for ideas

## Tradeoffs Considered
- Complexity vs. performance gains
- Which customer tiers to optimize for
- When to optimize vs. when to accept current performance

## Impact
- Improved load times for large merchants
- Better visualization performance at scale
- More targeted approach to performance optimization based on customer tier
