# Practice Tips & Strategies

This document contains strategies for preparing for and executing the take-home exercise.

## Before You Start: Preparation

### 1. Practice Structured Design Thinking (30-40 minutes practice)

Pick a feature you've built before and write a design doc in 40 minutes:

**Good practice problems:**
- "Add real-time notifications to a messaging app"
- "Implement 2-factor authentication for a web app"
- "Add export functionality (CSV, PDF) to a data dashboard"
- "Design a rate limiting system for an API"

**Template to practice:**
1. Problem summary (2-3 sentences)
2. High-level approach (1 paragraph)
3. 3-4 key decisions with:
   - Options considered
   - Choice made
   - Trade-offs
   - User impact
4. Alternative approaches considered
5. Success metrics
6. Risks and open questions

**Set a timer and practice explaining technical concepts in plain language.**

### 2. Sharpen TypeScript & React Skills

Review these concepts:
- Type inference and generics
- Union types and type guards
- Utility types (`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`)
- React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Props typing for components
- Handling optional fields and nullable types

**Quick drill:**
- Clone an open-source React/TypeScript project
- Set a 10-minute timer
- Try to understand: What does this project do? Where's the entry point? How's data flowing?

### 3. Practice Navigating Unfamiliar Codebases

**15-minute exercise:**
1. Clone a medium-complexity React project
2. Find where user authentication happens
3. Trace a user action from UI component → service layer → data storage
4. Identify the types/interfaces used

**Recommended projects to practice with:**
- Vercel's Next.js examples
- React Router examples
- Any TypeScript starter template

### 4. Time Management Drills

**Practice with timers:**
- Use a Pomodoro timer or similar
- Practice writing for exactly 30 minutes, then stop
- Practice coding for exactly 60 minutes, then stop
- Get comfortable with "this is good enough for the time box"

**Key mindset shift:**
- In real work: Optimize for quality, take the time you need
- In timed exercises: Optimize for completeness, ship something working

---

## During the Exercise: Execution Strategies

### Part 1: Design Document (40 minutes)

#### Minute 0-5: Read & Plan
- Read the entire prompt first
- Don't start writing yet
- Identify how many sections you need to address
- Mental math: 7 sections = ~5 minutes each

#### Minute 5-30: Write
- Start with the easiest section first (usually "Problem Summary")
- Use bullet points initially, then convert to prose
- Set mini-deadlines: "Section 3 done by minute 18"
- If stuck on a section, skip and come back

#### Minute 30-38: Review & Polish
- Read through as if you're a non-technical PM
- Check: Did you explain the "why"?
- Check: Are trade-offs realistic?
- Check: Is user impact specific?

#### Minute 38-40: Final Check
- Any sections left blank?
- Any obvious typos?
- Would you be proud to send this?

#### Pro Tips for Part 1
✅ **Do:**
- Use real examples: "This means a doctor who sees 20 patients/day will save 5 minutes"
- Acknowledge downsides: "The trade-off is..."
- Write in active voice: "We'll use X" not "X could be used"
- Consider multiple stakeholders: doctors, nurses, compliance officers, patients

❌ **Don't:**
- Write in jargon: "We'll leverage a WebSocket-based pub/sub architecture" (unless you explain it)
- Claim perfection: "This solution has no downsides"
- Ignore the user: "This is technically superior" (but how does it help the user?)
- Leave vague impacts: "Better UX" (better how? saved time? reduced errors?)

---

### Part 2: Implementation (70 minutes)

#### Minute 0-10: Read & Understand
- Read every file, even if it seems unrelated
- Draw a mental map: Component → Service → Data storage
- Identify dependencies: What needs to change first?
- Note all the TODOs

#### Minute 10-15: Plan Your Approach
- Write down the order of files you'll modify
- Identify the "critical path": What must work for this to be useful?
- Sketch out the types you'll need

#### Minute 15-25: Types & Data Model
- Start with `types/index.ts`
- Add the access reason field
- Consider: Optional or required? String or object?
- Run `npm run type-check` to see what breaks

#### Minute 25-35: Service Layer
- Update `auditService.ts`
- Modify function signatures
- Update the data storage
- Run `npm run type-check` again

#### Minute 35-55: UI Components
- Update `PatientRecordViewer.tsx` to capture the reason
- Keep it simple first: Just a text input
- Make it work, then make it nice
- Test the flow manually

#### Minute 55-65: Display & Polish
- Update `AuditLogViewer.tsx` to show the reason
- Add basic validation if time permits
- Handle edge cases (empty string, old logs)
- Add comments explaining your choices

#### Minute 65-70: Final Review
- Run `npm run type-check` one last time
- Read through your code: Is it clear?
- Are your comments helpful?
- Any obvious bugs?

#### Pro Tips for Part 2
✅ **Do:**
- Comment as you go: "// Using optional because old logs won't have this field"
- Handle the happy path first, then edge cases
- Test manually: "If I were a doctor, would this work?"
- Leave TODO comments for what you'd add with more time

❌ **Don't:**
- Implement features not requested (e.g., full autocomplete, complex validation rules)
- Use `any` types (there's always a better type)
- Skip testing even once manually
- Leave broken TypeScript errors ("I'll fix them later")

---

## Mental Models for Success

### The "Working Prototype" Model
Think of this as building an MVP, not a production system:
- Core functionality must work
- Edge cases should be handled or documented
- Code should be maintainable
- But it doesn't need to be perfect

### The "Clear Thinking" Model
They're evaluating your thought process as much as the output:
- Show your work (comments, explanations)
- Acknowledge trade-offs
- Be honest about limitations
- Explain your prioritization

### The "Busy Provider" Model
For design decisions, always filter through:
- "Would this work for a doctor seeing 25 patients today?"
- "Would this delay urgent care?"
- "Is this easy to understand under stress?"

---

## Common Mistakes & How to Avoid Them

### Mistake 1: Perfectionism
**Problem:** Spending 30 minutes making the validation logic perfect
**Solution:** Implement basic validation, comment what you'd add with more time

### Mistake 2: Scope Creep
**Problem:** "I should also add analytics, and user preferences, and..."
**Solution:** Focus on the requirements. Mention extras in "Future Enhancements"

### Mistake 3: Poor Time Awareness
**Problem:** Realizing at minute 35 you've only done half of Part 2
**Solution:** Set phone alarms at 20 min, 40 min, 60 min

### Mistake 4: Not Reading First
**Problem:** Starting to code, then realizing you misunderstood the requirement
**Solution:** Always spend the first 5-10 minutes reading everything

### Mistake 5: No Testing
**Problem:** Submitting code that doesn't type-check or has obvious bugs
**Solution:** Reserve the last 5-10 minutes for `npm run type-check` and review

### Mistake 6: Overexplaining Simple Decisions
**Problem:** 3 paragraphs on why you chose `string` over `number`
**Solution:** Focus explanations on non-obvious decisions

### Mistake 7: Underexplaining Important Decisions
**Problem:** "I chose a modal" (with no explanation)
**Solution:** Every key decision needs: options, choice, trade-off, impact

---

## Day-Of Checklist

### Environment Setup
- [ ] Quiet space with no interruptions
- [ ] Timer ready (phone, browser timer, etc.)
- [ ] Code editor open and ready
- [ ] TypeScript and Node.js working
- [ ] Water and snacks nearby
- [ ] Bathroom break taken

### Mental Preparation
- [ ] Read all instructions first
- [ ] No perfectionism - ship working code
- [ ] Time management is key
- [ ] Show your thinking with comments
- [ ] Assume good faith - no trick questions

### Before Submitting
- [ ] Part 1 complete? All sections filled in?
- [ ] Part 2 working? Feature works end-to-end?
- [ ] TypeScript errors resolved? `npm run type-check` passes?
- [ ] Comments added? Assumptions documented?
- [ ] Final review done? Read through one last time?

---

## Practice Schedule (1 Week Before)

**7 days out:**
- Do a full mock run (115 minutes)
- Review what went well, what didn't
- Identify knowledge gaps (TypeScript? React patterns?)

**5 days out:**
- Practice design docs (40 minutes) for 2-3 different problems
- Focus on explaining trade-offs clearly

**3 days out:**
- Practice navigating unfamiliar codebases (15 minutes each)
- Practice implementing features in existing code

**1 day out:**
- Review TypeScript/React patterns you struggled with
- Do a quick 30-minute practice implementation
- Get good sleep!

**Day of:**
- Light review of notes (don't cram)
- Trust your preparation
- Stay calm and focused

---

## Mindset for Success

### Remember:
1. **They want you to succeed** - This exercise is designed to see how you think, not to trick you
2. **Imperfect is OK** - They know you have limited time
3. **Communication matters** - Showing your thinking is as important as the code
4. **Real-world context** - Think about actual healthcare providers using this
5. **Trade-offs are expected** - There's no perfect solution, only thoughtful decisions

### Your Goal:
Not to write perfect code, but to demonstrate:
- Clear thinking about product decisions
- Ability to work in unfamiliar codebases
- Clean, maintainable code
- Good communication skills
- Time management under pressure

You've got this! 🚀

---

## Mock Timer Script

Want to simulate the real experience? Use this terminal timer:

```bash
#!/bin/bash
# Save as timer.sh and run with: bash timer.sh

echo "🏥 Starting Take-Home Exercise Timer"
echo "Part 1: Design Document (40 minutes)"
echo ""

sleep $((20 * 60)) && echo "⏰ 20 minutes elapsed - Halfway through Part 1!" &
sleep $((35 * 60)) && echo "⏰ 35 minutes elapsed - 5 minutes left for Part 1!" &
sleep $((40 * 60)) && echo "⏰⏰ Part 1 complete! Starting Part 2 (70 minutes)" &

sleep $((50 * 60)) && echo "⏰ 10 minutes into Part 2 - Should be done reading code" &
sleep $((70 * 60)) && echo "⏰ 30 minutes into Part 2 - Should be implementing core feature" &
sleep $((90 * 60)) && echo "⏰ 50 minutes into Part 2 - Should be polishing and adding validation" &
sleep $((105 * 60)) && echo "⏰ 65 minutes into Part 2 - 5 minutes left! Final review time" &
sleep $((110 * 60)) && echo "⏰⏰⏰ TIME'S UP! 115 minutes complete" &

wait
```

Good luck! You're ready for this! 💪
