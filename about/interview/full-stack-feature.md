# Complex Feature Built End-to-End

#interview-question #experience/full-stack

## The Question

"Tell me about a complex feature you built end-to-end" or "Describe a time when you worked on both frontend and backend"

## Primary Example

**[[2024-unified-analytics]]** - Analytics Platform Migration

### Quick Summary (30 seconds)
Led the migration of our legacy analytics platform to a unified system. Built a component library as the "source of truth" on the frontend, and orchestrated hybrid endpoints on the backend to support gradual migration. Coordinated across multiple teams to ensure smooth adoption.

### Detailed Walkthrough (2-3 minutes)

**Context**
- Legacy analytics platform with components being heavily customized by each team
- Each section (Marketing, Product, Home) had their own variations

**Frontend Work**
- Created internal component library as source of truth
- Defined clear migration paths for each section
- Iterated based on early adopter feedback to smooth path for larger teams

**Backend Work**
- Designed hybrid endpoints supporting both legacy and new systems
- Single report endpoint handling both architectures
- Implemented automated maintenance tasks for seamless migration

**Impact**
- Unified analytics across all sections
- Reduced custom implementations
- Established sustainable migration pattern

## Alternative Examples
- *Add more as you build them*

## Key Points to Emphasize

### Full-Stack Ownership
- Owned both frontend architecture and backend orchestration
- Understood how changes on one side affected the other
- Made tradeoff decisions considering entire stack

### Complexity Handled
- **Frontend**: Component library design, migration strategy, team adoption
- **Backend**: Hybrid mode for gradual rollout, data coordination
- **Process**: Cross-team coordination, iterative refinement

### Technical Depth
- Source of truth pattern
- Hybrid endpoint architecture
- Automated migration tooling

## Follow-up Questions to Prepare For

### "What would you do differently?"
- Earlier visibility into data migration timeline
- More automated testing for hybrid mode
- Earlier engagement with "2nd tier" adopters

### "What was the biggest challenge?"
- Supporting both systems simultaneously without frontend being designed for it
- Coordinating frontend readiness with uncertain backend timeline
- Managing adoption pace across teams with different priorities

### "How did you handle backwards compatibility?"
- Hybrid endpoints supporting both legacy and new reports
- Gradual migration rather than big-bang
- Automated tasks to migrate custom reports when base reports moved

### "What were the tradeoffs?"
- **Complexity vs. Risk**: Hybrid mode added complexity but reduced migration risk
- **Speed vs. Quality**: Slower adoption but better experience for later adopters
- **Flexibility vs. Standards**: Internal library allows extensions but maintains consistency

## Related Experiences
- [[2024-performance-optimization]] - Could mention optimization work done during migration
- [[architectural-decisions]] - Decision to use hybrid approach

---

**Practice tip**: Time yourself explaining this in 2-3 minutes. Have both 30-second and 3-minute versions ready.
