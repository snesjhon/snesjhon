---
description: Tell me about an important architectural decision you've made
---
# Important Architectural Decisions

#interview-question #experience/architecture 

## The Question

"Tell me about an important architectural decision you made" or "Describe a time when you had to choose between competing technical approaches"

## Primary Example

**[[2024-unified-analytics]]** - Gradual Migration vs. Big-Bang Rewrite

### Quick Summary (30 seconds)

Decided to support both legacy and new analytics systems simultaneously through hybrid endpoints rather than a big-bang migration. Added complexity but reduced risk and allowed teams to migrate on their own timeline. Decision validated by successful cross-team adoption.

### Detailed Walkthrough (2-3 minutes)

**The Decision**
How to migrate from legacy analytics to unified system across multiple teams?

**Competing Options**

**Option 1: Big-Bang Migration**

- Pros: Cleaner, simpler codebase afterwards
- Cons: High risk, requires all teams ready simultaneously, all-or-nothing

**Option 2: Gradual Migration (Chosen)**

- Pros: Lower risk, teams migrate on their timeline, learn from early adopters
- Cons: Hybrid endpoint complexity, maintain two systems temporarily

**How I Evaluated Tradeoffs**

_Scalability_

- Gradual approach scales better across multiple teams
- Each team can optimize for their timeline

_Maintainability_

- Short-term: More complex (hybrid mode)
- Long-term: Same end state, but lower risk getting there

_Team Expertise_

- Not all teams had same readiness level
- Early adopters could pave path for others

_Risk Management_

- Gradual approach contained failures
- Could course-correct based on feedback

**Who Was Involved**

- Frontend team (component library design)
- Backend team (endpoint orchestration)
- Section leads (Marketing, Product, Home)
- Data team (migration readiness)

**Factors That Influenced Decision**

1. **Uncertain timeline**: Didn't know when all data would be ready
2. **Team readiness**: Varied across sections
3. **Learning opportunity**: Early adopters could inform later migrations
4. **Risk tolerance**: Couldn't afford big-bang failure

**How It Held Up**
✅ Successful adoption across teams
✅ Early adopter learnings smoothed path for others
✅ No major outages or rollbacks
⚠️ Hybrid mode complexity as expected, but managed

## Key Points to Emphasize

### Decision-Making Process

- Systematic evaluation of options
- Clear tradeoff analysis
- Stakeholder involvement

### Technical Depth

- Hybrid endpoint architecture
- Supporting two systems simultaneously
- Migration automation

### Leadership

- Cross-team coordination
- Risk management
- Long-term thinking over short-term simplicity

## Follow-up Questions to Prepare For

### "What would you do differently?"

- Earlier timeline clarity from data team
- More automated testing for hybrid mode
- Earlier prototyping with 2nd-tier adopters

### "Who disagreed with your decision?"

- Some engineers preferred cleaner big-bang approach
- Had to make case for risk reduction over code simplicity
- Validated decision through successful execution

### "How did you know when to move away from the hybrid approach?"

- When all sections completed migration
- Automated tracking of migration status
- Planned deprecation timeline

### "What was the technical complexity you added?"

- Hybrid endpoints supporting both report types
- Routing logic to determine which system to use
- Maintenance tasks for automated migration

### "How did this decision impact the timeline?"

- Longer overall calendar time
- But lower risk and parallelizable across teams
- Each team could move at their own pace

## Related Experiences

- [[full-stack-feature]] - Full context of the migration
- [[technical-debt]] - Managing temporary complexity

---

**Practice tip**: Architecture questions want to see your decision-making process, not just the decision. Walk through how you evaluated options.
