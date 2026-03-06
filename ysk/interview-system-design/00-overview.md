# System Design Interview Prep

One session. One domain. The architect's mental model: justify every beam before placing it.

---

## Interview Focus

This is a system design interview. The evaluation criteria:
- Justify architectural decisions under pressure
- Understand and articulate trade-offs clearly
- Design reliable, maintainable solutions at scale
- Apply operational best practices (monitoring, failure modes, scaling)

| Module | Directory | Core Concept |
|--------|-----------|--------------|
| CAP Theorem | `01-cap-theorem/` | Consistency vs availability under partition |
| Caching Concepts | `02-caching-concepts/` | Patterns, TTL, invalidation, stampede |
| API Design | `03-api-design/` | GraphQL schema design, REST principles, N+1 |
| Back of Envelope | `04-back-of-envelope/` | QPS, storage, capacity planning |
| Background Jobs | `05-background-jobs/` | Async work, idempotency, retry strategy |
| Scalable Pipelines | `06-scalable-pipelines/` | Fan-out, partitioning, observability |

---

## The Interview Formula

**Mental Model**: You are an architect. The prompt is a client brief. Questions are requirements gathering. Back-of-envelope is structural engineering. The diagram is the blueprint.

```
1. Clarify scope     -> "1M or 100M users? Read-heavy or write-heavy? What's the SLA?"
2. Estimate          -> QPS, storage, bandwidth. Get order of magnitude right.
3. High-level design -> Client -> LB -> App -> Cache -> DB. Name each layer.
4. Drill into details -> Pick 2-3 hard problems. Don't try to cover everything.
5. Justify decisions -> "I chose X over Y because of Z constraint."
6. Operational layer -> Monitoring, failure modes, scaling levers.
```

---

## How to Use This Repo

Each module follows the same structure:
1. Read the `XX-topic-name.md` guide. Understand the concepts and mental models.
2. Run `ruby level-1-*.rb` — all tests fail. Implement each function until they pass.
3. Run `level-2-*.rb`, then `level-3-*.rb`. Each level adds complexity and nuance.
4. For the `.md` practice scenarios: say your answer out loud. Time yourself.
   A complete system design setup should be articulable in under 2 minutes.

### Running exercises

```
cd interview-system-design
ruby 01-cap-theorem/level-1-consistency-models.rb
ruby 02-caching-concepts/level-1-cache-patterns.rb
# ... etc
```

---

## Files in This Directory

```
interview-system-design/
  00-overview.md                              <- you are here
  01-cap-theorem/
    01-cap-theorem.md                         <- CAP theorem, CP vs AP, consistency spectrum
    level-1-consistency-models.rb             <- classify databases and behaviors
    level-2-cp-vs-ap.rb                       <- pick consistency model for each data type
    level-3-distributed-tradeoffs.rb          <- multi-component system decisions
  02-caching-concepts/
    02-caching-concepts.md                    <- cache-aside/write-through/write-behind, TTL, stampede
    level-1-cache-patterns.rb                 <- which pattern for each scenario
    level-2-ttl-and-invalidation.rb           <- TTL choices and invalidation strategy
    level-3-stampede-prevention.rb            <- stampede fix selection and eviction
  03-api-design/
    03-api-design.md                          <- REST vs GraphQL, schema design, N+1, mutations
    level-1-api-style.rb                      <- REST vs GraphQL, pagination type
    level-2-schema-decisions.rb               <- schema choices, breaking changes
    level-3-n-plus-one.rb                     <- detect N+1 risk, pick fix
  04-back-of-envelope/
    04-back-of-envelope.md                    <- numbers to memorize, formulas, capacity
    level-1-qps-and-storage.rb               <- QPS and storage calculations
    level-2-capacity-planning.rb              <- servers needed, cache decision
    level-3-full-estimation.rb               <- full system estimate from requirements
  05-background-jobs/
    05-background-jobs.md                     <- async patterns, idempotency, retry, queue design
    level-1-sync-vs-async.rb                  <- classify operations, time budget
    level-2-idempotency.rb                    <- design idempotent jobs, detect risks
    level-3-retry-strategy.rb                 <- retry vs discard, priority queues, health
  06-scalable-pipelines/
    06-scalable-pipelines.md                  <- fan-out, pipeline, backpressure, observability
    level-1-pipeline-patterns.rb              <- pattern recognition
    level-2-dependency-analysis.rb            <- fan-out safety, sequential dependencies
    level-3-observability.rb                  <- health metrics, alerts, tracing design
```
