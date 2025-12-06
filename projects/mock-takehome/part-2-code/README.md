# Part 2: Implementation Code

## Overview

This directory contains the starter codebase for Part 2 of the take-home exercise. Your task is to implement the access reason feature by modifying the existing code.

## Quick Start

```bash
# Install dependencies
npm install

# Check for TypeScript errors
npm run type-check
```

## Codebase Structure

```
src/
├── types/
│   └── index.ts              # Type definitions - START HERE
│
├── services/
│   └── auditService.ts       # Audit logging logic
│
├── components/
│   ├── PatientRecordViewer.tsx    # Component for viewing patient records
│   └── AuditLogViewer.tsx         # Component for viewing audit logs
│
├── utils/
│   └── validation.ts         # Validation utilities
│
└── data/
    └── sampleData.ts         # Sample patients and providers for testing
```

## Where to Start

1. **Read through all files first** (5-10 minutes)
   - Understand the data model in `types/index.ts`
   - See how audit logging works in `auditService.ts`
   - Understand the component flow in `PatientRecordViewer.tsx`

2. **Look for TODO comments**
   - Search for `// TODO:` - these mark the main areas you need to modify
   - TODOs include questions to guide your thinking

3. **Work in this order** (suggested):
   - Start with `types/index.ts` - add the access reason field
   - Update `auditService.ts` - modify the logging function
   - Update `PatientRecordViewer.tsx` - add UI to capture the reason
   - Update `AuditLogViewer.tsx` - display the reason in audit logs
   - Add validation in `validation.ts` (if time permits)

## Key Questions to Consider

As you implement, think about:

- **When to ask**: Should you prompt for the reason before or after showing the record?
- **How structured**: Free text? Dropdown? Combination?
- **How required**: Can providers skip it? What happens if they do?
- **Edge cases**: Empty strings? Very long text? Special characters?
- **Backwards compatibility**: What about logs created before this feature existed?

## Testing Your Work

Since this is a simplified exercise without a build process:

1. Run `npm run type-check` to check for TypeScript errors
2. Review your code to ensure:
   - Types are correct and consistent
   - The data flows from component → service → storage
   - The audit log viewer can display the new field
   - Edge cases are handled (or documented why not)

## What We're Looking For

- ✅ Working, complete implementation
- ✅ Clean, readable code
- ✅ Thoughtful comments explaining your decisions
- ✅ Proper TypeScript usage
- ✅ Consideration of user experience
- ✅ Handling of edge cases (or comments about what you'd handle with more time)

## Time Management Tips

- **0-10 min**: Read all the code, plan your approach
- **10-50 min**: Implement the core feature (types, service, UI)
- **50-65 min**: Polish, add validation, handle edge cases
- **65-70 min**: Review, run type-check, add final comments

## Need Help?

- If you get stuck, leave a comment explaining your thought process and move on
- It's better to have a complete basic implementation than an incomplete complex one
- Document your assumptions - we care about your reasoning!

Good luck! 🚀
