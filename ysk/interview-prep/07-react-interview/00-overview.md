# React Component Interview — Senior Full Stack (Frontend Focus)

**Duration**: 60 minutes
**Format**: Read requirements → build features progressively
**Stack**: React + TypeScript (assume Vite or CRA setup, no need to configure)

---

## Mental Model

> You are a senior engineer pairing with your interviewer. Think out loud. Design before you type.

The interviewer is evaluating:
1. **How you read requirements** — do you catch edge cases before coding?
2. **Component API design** — props, state shape, custom hooks
3. **React fluency** — correct use of hooks, avoiding common pitfalls
4. **Performance instincts** — when to memoize, when not to
5. **Communication** — narrate your decisions

---

## Interview Formula

```
1. Read requirements -> Ask clarifying questions (2-3 min)
2. Plan state shape + component structure out loud (3-5 min)
3. Build the happy path first, get it working (20-30 min)
4. Handle edge cases: loading, error, empty states (10 min)
5. Refactor: extract custom hooks, memoize if needed (10 min)
6. Discuss: what you'd test, performance concerns, a11y (5 min)
```

---

## Clarifying Questions to Always Ask

Before touching code, ask:
- "Is this component receiving data via props or fetching its own data?"
- "Should I handle loading and error states?"
- "What's the data shape? Can I define the TypeScript types?"
- "Any accessibility requirements?"
- "Should I extract a custom hook, or keep everything in the component?"

---

## Files

```
07-react-interview/
  00-overview.md             <- you are here
  requirements.md            <- the spec you'll receive in the interview
  concepts.md                <- key React patterns to have sharp
  starter/
    ActivityFeed.tsx         <- starter file (what you'd be given)
    types.ts                 <- type definitions
    mockApi.ts               <- mock API (don't touch this)
  solution/
    ActivityFeed.tsx         <- reference solution
    useActivityFeed.ts       <- extracted custom hook solution
    WALKTHROUGH.md           <- line-by-line decision notes
```

---

## How to Practice

1. **Read** `requirements.md` — treat it like you received it 5 minutes before the interview
2. **Open** `starter/ActivityFeed.tsx` — implement each feature before reading the solution
3. **Check** `solution/` only after you've attempted each level
4. **Review** `concepts.md` for any gaps

Time yourself. If you're still on Level 1 after 15 minutes, that's a signal.
