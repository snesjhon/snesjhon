# Universal Technical Design Document Evaluation Framework

A comprehensive guide for evaluating technical design documents during take-home interviews.

---

## Core Principle: The Interviewer's Hidden Agenda

They're not testing if you can pick the "right" solution. They're testing:

1. **Can you identify what's important?** (Signal vs noise)
2. **Do you ask good questions?** (Clarity before opinions)
3. **Can you think like an owner?** (Business + technical + operational)
4. **Are you someone we want to work with?** (Collaborative, not combative)

---

## Phase 1: The First Read (5-7 minutes)

### Your Goal: Build a Mental Model

Don't read linearly - **skim strategically** in this order:

### Step 1: Understand the "Why" (2 min)

- What problem are we solving? For whom?
- Why now? (What changed? Why is this urgent?)
- What happens if we don't solve this?

**Red flags:**
- Solution in search of a problem
- Solving symptoms instead of root causes
- "We should use X because it's cool" (tech-driven vs user-driven)

### Step 2: Map the Constraints (2 min)

Look for the **constraint triangle**:
- **Time:** Hard deadline or flexible timeline?
- **Resources:** Team size, budget, expertise
- **Scope:** Must-haves vs nice-to-haves

**Red flags:**
- "We can do everything fast, cheap, and perfect"
- Missing information about any constraint
- Unrealistic expectations given constraints

### Step 3: Identify Stakeholders (1 min)

Who cares about this decision?
- Users (whose experience changes?)
- Business (revenue, costs, compliance, brand)
- Engineering (who builds it? who maintains it?)
- Operations (who gets paged at 3am?)
- Security/Legal/Data Privacy

**Red flags:**
- Major stakeholder not consulted (e.g., security for payments feature)
- Conflicting stakeholder needs not acknowledged

### Step 4: Spot What's Missing (1-2 min)

Every design doc has gaps. Common ones:
- Success metrics (how do we know it worked?)
- Failure modes (what breaks first under load?)
- Rollback plan (what if we're wrong?)
- Testing strategy
- Monitoring/observability
- Data migration plan
- Cost analysis (not just per-unit, but total TCO)

---

## Phase 2: Deep Evaluation (8-10 minutes)

Now read carefully and **leave comments**. Use this lens:

### Lens 1: Requirements Analysis

**Questions to ask yourself:**
- Are requirements actually requirements, or solutions disguised as requirements?
  - ❌ "Must use microservices" (that's a solution)
  - ✅ "Must handle 10k req/sec" (that's a requirement)
- Are non-functional requirements measurable?
  - ❌ "Fast response time"
  - ✅ "p95 latency < 200ms"
- What's not said? (Implicit requirements)
  - Data privacy? Compliance (GDPR, HIPAA)? Accessibility? Internationalization?

**Comment types:**
- "Is the 99.5% SLA measured per notification or aggregate across all users?"
- "Assumption: 'critical notifications' means password resets and fraud alerts. Correct?"
- "Are we legally required to retain notification history? For how long?"

### Lens 2: Option Evaluation

For **each proposed option**, assess:

#### A. Completeness

What's conveniently omitted from pros/cons?

**Common gaps:**
- **Infrastructure costs** (servers, databases, networking) vs just per-unit costs
- **Operational burden** (who maintains this? on-call load?)
- **Migration complexity** (how do we get from current state to this?)
- **Team learning curve** (do we have the skills? how long to ramp up?)
- **Vendor risks** (lock-in, price increases, SLA enforcement, data privacy)

#### B. Feasibility

Is this actually buildable given constraints?

**Reality checks:**
- Timeline: "3 engineers, 8 weeks, 5 microservices" = ~13 dev-weeks per service? Realistic?
- Dependencies: Does this assume other teams deliver on time?
- Unknown unknowns: How much is greenfield vs proven tech for this team?

#### C. Risk Assessment

What could go catastrophically wrong?

**Categories of risk:**
- **Technical:** Scaling bottlenecks, single points of failure, data loss
- **Operational:** Deployment complexity, debugging difficulty, on-call burden
- **Business:** Vendor lock-in, cost overruns, missing deadline
- **Team:** Knowledge silos ("only Sarah knows how this works"), morale (boring/frustrating work)

**Comment types:**
- "Option A: If RabbitMQ goes down, do all channels fail? Single point of failure?"
- "Option C: Current codebase has tech debt. Could new features introduce bugs in production email?"
- "What's our rollback strategy for each option?"

#### D. Second-Order Effects

What happens 6-12 months after we ship?

**Questions:**
- Does this create future flexibility or paint us into a corner?
- Are we building technical debt or paying it down?
- How does this scale? (Not just "can it scale" but "what's the effort to scale")
- What becomes easier/harder for the next project?

**Comment types:**
- "Option B: If we hit 10M notifications/day, can we renegotiate pricing or are we locked in?"
- "Will this decision make hiring easier (trendy tech stack) or harder (niche technology)?"

### Lens 3: Business Alignment

**The ultimate question:** Does this solve the actual business problem?

**Evaluate:**
- **User impact:** Does this improve user experience measurably?
- **Revenue/cost:** What's the business case? ROI?
- **Competitive positioning:** Does this keep us competitive or make us leaders?
- **Strategic fit:** Does this align with where the company is going?

**Red flags:**
- Over-engineering for current needs
- Under-engineering for stated goals
- Optimizing for wrong metric (e.g., "uses latest tech" vs "reduces user churn")

**Comment types:**
- "We're optimizing for low cost per notification, but is user trust/delivery reliability worth paying more?"
- "Is reducing tech debt more valuable than shipping new features right now?"

---

## Phase 3: Forming Your Recommendation (25 minutes)

### Step 1: State Your Assumptions (3 min)

Begin with what you're assuming, because you'll never have perfect info:

**Template:**
```
Based on the information provided, I'm making the following assumptions:
1. [Timeline assumption] - The 8-week deadline is driven by external customer commitment
2. [Team assumption] - The team has moderate experience with Docker but not Kubernetes
3. [Business assumption] - Cost per notification is a target, not a hard constraint
4. [Technical assumption] - Current database can handle 2x load with optimization

If any of these are incorrect, my recommendation may change.
```

**Why this matters:**
- Shows intellectual humility
- Gives interviewer chance to correct you
- Demonstrates you know what you don't know

### Step 2: Choose a Position (2 min)

Pick an option and state it clearly upfront. Don't hedge.

**Good:**
> "I recommend Option B (third-party aggregator) with a planned migration to Option A at 6 months."

**Bad:**
> "Well, it depends... Option A has benefits but Option B is also good... maybe we could consider a hybrid..."

**Why?** People want to see you can make decisions under uncertainty. You can always change your mind with new info.

### Step 3: Justify with a Decision Framework (8 min)

Don't just list reasons randomly. Show your **prioritization logic**:

#### Framework: Weighted Criteria

Identify what matters most and rank options accordingly:

```
Criteria (in priority order):
1. Meet 8-week deadline → CRITICAL (blocks mobile launch)
2. Achieve 99.5% delivery SLA → HIGH (user trust issue)
3. Stay under $0.02/notification → MEDIUM (cost optimization)
4. Minimize operational burden → MEDIUM (team sustainability)
5. Enable future flexibility → LOW (can refactor later)

Option B scores highest on criteria 1, 2, 4
Option A scores highest on criteria 5
Option C scores poorly on criteria 2, 4
```

#### Framework: Risk-Based

If uncertainty is high, evaluate by risk tolerance:

```
Unacceptable risks:
- Missing mobile launch deadline → Rules out Option A
- Breaking existing email system → Rules out Option C

Acceptable risks:
- Vendor lock-in → Can mitigate with abstraction layer
- Higher cost → Can renegotiate at scale

Therefore: Option B
```

#### Framework: Staged Decision

If you can't decide definitively:

```
Phase 1 (Weeks 1-8): Ship Option B to hit deadline
Decision point at Week 12: If costs exceed $X or scale exceeds Y, migrate to Option A
Phase 2 (Months 3-6): Gradual migration while maintaining uptime
```

### Step 4: Acknowledge Trade-offs (5 min)

**Critical:** Show you understand **every choice has a cost**.

**Template:**
```
By choosing Option B, we're accepting:
- **Higher per-unit cost** ($0.025 vs $0.015) - roughly $10k/month extra at current scale
- **Vendor dependency** on Twilio - mitigated by building abstraction layer
- **Monolithic architecture** - harder to scale individual channels independently

In exchange, we gain:
- **Speed to market** - 6 weeks vs 10 weeks
- **Lower risk** - proven technology vs greenfield build
- **Operational simplicity** - one service to monitor vs five

This trade-off is worth it because [business reason].
```

**Why this matters:**
Shows you're not naive about downsides, you've just weighed them and made a call.

### Step 5: De-Risk Your Recommendation (5 min)

No plan survives contact with reality. Show you've thought about **what could go wrong**:

**Template:**
```
Potential failure modes and mitigations:

**Risk 1:** Twilio has multi-hour outage during peak usage
- Mitigation: Implement circuit breaker + fallback to direct SMTP for critical emails
- Mitigation: Set up multi-vendor redundancy by Month 3

**Risk 2:** Costs exceed budget due to volume growth
- Mitigation: Implement rate limiting per user
- Mitigation: Set up cost alerts at 80% of monthly budget
- Mitigation: Renegotiate Twilio contract at 1M notifications/day threshold

**Risk 3:** Team struggles with Firebase SDK for push notifications
- Mitigation: Allocate 1 week for proof-of-concept before committing
- Mitigation: Budget 2 weeks for Firebase learning curve in timeline
```

### Step 6: Answer ALL Open Questions (7 min)

Go back to every question in the doc and answer directly:

**Format:**
```
**Q: How critical is vendor independence?**

A: Less critical than speed-to-market for MVP. We should optimize for launch timeline and accept vendor lock-in with Twilio as the cost of fast delivery. 

However, we shouldr architect an abstraction layer from day one so we can swap vendors within 2-3 months if pricing becomes untenable.

**Q: What if we choose Option C and hit scaling issues in 6 months?**

A: High risk, don't recommend. Current MySQL is already struggling, and adding 4x load is likely to cause production incidents. If we chose Option C despite this risk, we'd need: (1) Immediate database optimization sprint, (2) Database migration plan to 
PostgreSQL, (3) Feature freeze to pay down tech debt. This would likely take 3-4 months, 
negating any time savings from Option C.
```

---

## Universal Question Categories to Consider

No matter the doc topic, ask questions in these buckets:

### 1. Scope & Requirements

- What's in scope vs out of scope for MVP?
- Are requirements driven by users, business, or technology?
- Which requirements are "must-have" vs "nice-to-have"?
- How do we measure success?

### 2. Scale & Performance

- What's the expected load? (Peak vs average)
- What's acceptable latency/throughput/uptime?
- How do we scale? Vertical vs horizontal?
- What's the growth trajectory? (10x in 1 year? 5 years?)

### 3. Cost

- What's the total cost of ownership? (Not just per-unit costs)
- Development cost vs operational cost trade-off?
- Hidden costs? (Monitoring tools, training, maintenance)
- What's the cost of being wrong?

### 4. Team & Operations

- How many engineers? What's their expertise?
- Who maintains this long-term?
- What's the on-call burden?
- How easy is it to onboard new team members?

### 5. Timeline & Dependencies

- Is the deadline hard or soft? Why?
- What are we dependent on? (Other teams, vendors, migrations)
- What's the critical path?
- What's the buffer for unknowns?

### 6. Risk & Failure Modes

- What breaks first under stress?
- What's our rollback plan?
- What are the regulatory/compliance risks?
- What happens if a vendor fails or raises prices?

### 7. Future Evolution

- How does this scale over 12-24 months?
- Are we building flexibility or constraints?
- What becomes easier/harder after we ship this?
- How easy is it to migrate away if needed?

---

## Comment Quality: Good vs Bad Examples

### Bad Comments (vague, obvious, or unhelpful)

❌ "Option B looks good"
- Why? Based on what criteria?

❌ "Have we considered security?"
- Too vague. What specific security concern?

❌ "We should use Kubernetes"
- That's a solution, not a question or analysis

❌ "I disagree with Option A"
- Combative tone, no reasoning

❌ "What about performance?"
- Too generic. Performance of what aspect?

### Good Comments (specific, insightful, collaborative)

✅ "Option B relies on Twilio's 99.9% SLA, but we need 99.5% end-to-end. Does this include our own system failures? What's our error budget?"

✅ "The doc mentions 'critical notifications' but doesn't define them. Are these legally required (password resets) or product features (marketing)? This changes our SLA requirements."

✅ "Option C extends existing codebase which is already at 15k lines. Do we have good test coverage? Refactoring risk seems high if not."

✅ "Assumption: The team has 3 backend engineers. If Option A requires building 5 microservices in 10 weeks, that's ~6 dev-weeks per service including RabbitMQ setup, monitoring, and integration testing. Is this realistic given the team's experience with distributed systems?"

✅ "Option B costs $0.025/notification, which is $10k/month above budget at 2M/day scale. However, missing the mobile launch could cost us $X in lost user acquisition. What's the business trade-off here?"

---

## Red Flags: When to Push Back Hard

Some design decisions are **genuinely bad**. Call them out:

### Technical Red Flags

🚩 **Ignoring existing system constraints**
- "Let's add 4x load to a database that's already struggling"
- Push back: "This seems high-risk. What's the mitigation if the database fails in production?"

🚩 **Single point of failure for critical system**
- "All notifications go through one service with no redundancy"
- Push back: "If this service goes down, we lose all customer communication. Can we add redundancy or circuit breakers?"

🚩 **No rollback plan**
- "We'll migrate all users at once"
- Push back: "What's our rollback strategy if this breaks production?"

🚩 **Unrealistic timelines**
- "We can build 5 microservices in 10 weeks with 3 engineers"
- Push back: "That's ~6 dev-weeks per service. Given we need to learn Kubernetes, set up monitoring, etc., this seems aggressive. What's the contingency if we fall behind?"

### Business Red Flags

🚩 **Solution doesn't match problem**
- Building complex microservices for a feature with 100 users
- Push back: "Are we over-engineering? Could we validate with a simpler MVP first?"

🚩 **Optimizing wrong metric**
- Focusing on per-unit cost while losing users due to poor delivery
- Push back: "We're optimizing for $0.02/notification but users are churning due to missed alerts. What's the cost of losing a customer vs paying $0.005 more per notification?"

🚩 **Ignoring user impact**
- "This will save us money but degrade user experience"
- Push back: "How do we quantify user impact? What's the trade-off between cost savings and user satisfaction?"

### Process Red Flags

🚩 **Key stakeholders not consulted**
- Launching payment feature without security review
- Push back: "Has security/legal reviewed this? I see compliance risks we should address before implementation."

🚩 **No success metrics**
- "Let's build this and see what happens"
- Push back: "How do we know if this succeeded? What metrics should we track?"

---

## Tone & Communication: Be Assertive, Not Arrogant

### Good Communication Patterns

✅ **Frame as collaboration:**
- "I'm curious about X. Can you help me understand the thinking here?"
- "I might be missing context, but it seems like Y could be a risk. What am I not seeing?"

✅ **Offer alternatives, not just criticism:**
- "Option A has timeline concerns. What if we did Option B for MVP, then migrated to Option A at Month 6?"

✅ **Acknowledge good ideas:**
- "I like that Option A gives us flexibility. My concern is whether we can deliver in 8 weeks."

✅ **Be clear about uncertainty:**
- "Based on what I know about our database, this seems risky. If it's already been optimized, my concern is less valid."

### Bad Communication Patterns

❌ **Arrogance:**
- "This is obviously wrong"
- "Anyone with experience would know..."

❌ **Vagueness:**
- "I'm not sure about this"
- "Seems complicated"

❌ **Passive-aggressiveness:**
- "Well, I guess we could try Option B if we want to be locked into vendors forever..."

❌ **Analysis paralysis:**
- Asking 30 questions without offering any recommendations
- "We need more data before deciding anything"

---

## Time Management: 40-Minute Breakdown

**0-5 min:** First skim (build mental model)

**5-15 min:** Deep read + leave comments (8-12 thoughtful comments)

**15-20 min:** Organize thoughts, pick your recommendation

**20-35 min:** Write recommendation (assumptions, decision, trade-offs, risks, answers)

**35-40 min:** Proofread, ensure all questions answered

**Pro tip:** If you finish early, use remaining time to add 1-2 more insightful comments rather than sitting idle. Shows thoroughness.

---

## The Meta-Question to Guide Everything

Throughout the exercise, keep asking yourself:

> **"If I were the tech lead responsible for this project's success, what would I need to know to feel confident making this decision?"**

This shifts you from "interview candidate mode" to "owner mode" - which is exactly what they want to see.

---

## Final Checklist Before Submitting

- [ ] Have I stated my assumptions clearly?
- [ ] Have I picked a clear recommendation (not hedging)?
- [ ] Have I explained my reasoning with a decision framework?
- [ ] Have I acknowledged trade-offs of my chosen option?
- [ ] Have I identified risks and proposed mitigations?
- [ ] Have I answered ALL open questions in the document?
- [ ] Are my comments specific and actionable (not vague)?
- [ ] Have I considered business needs alongside technical concerns?
- [ ] Is my tone collaborative and professional?
- [ ] Have I shown how this decision impacts users?

---

## Remember

The goal isn't to be perfect. The goal is to show:

1. **You can think critically** about complex technical decisions
2. **You communicate clearly** with teammates and stakeholders
3. **You balance** business needs, user impact, and technical excellence
4. **You're someone they want to work with** - collaborative, thoughtful, and pragmatic

Good luck! 🚀
