# Part 2: Implementation (70 minutes)

## Overview

You'll implement the access reason feature in an existing TypeScript/React codebase. The codebase is a simplified version of our patient record viewer.

## Your Tasks

Implement the following based on your design decisions from Part 1:

### Required Tasks

1. **Add access reason field to audit log**
   - Modify the `AuditLog` type to include an access reason
   - Update the `logPatientAccess` function to accept and store the reason

2. **Create a UI component for capturing the reason**
   - Build a component that prompts the provider to enter an access reason
   - Integrate it into the patient record viewing flow
   - Handle the user's input and pass it to the audit logging system

3. **Update the audit log display**
   - Modify the `AuditLogViewer` component to display access reasons
   - Ensure the display is clear and useful for compliance review

### Stretch Goals (if time permits)

4. **Add validation**
   - Prevent empty/meaningless reasons
   - Handle edge cases (special characters, very long text, etc.)

5. **Improve the UX**
   - Add loading states
   - Consider keyboard shortcuts for common reasons
   - Make the flow feel natural in a busy clinical environment

## Getting Started

1. Review the codebase structure in the `part-2-code/` directory
2. Read through the existing code before making changes (budget 5-10 minutes for this)
3. Look for `// TODO:` comments - these indicate where you need to make changes
4. You can modify any file, but the TODOs will guide you to the main areas

## Important Notes

- **Comment your assumptions**: If something is ambiguous, leave a comment explaining your choice
- **Don't over-engineer**: A working, simple solution is better than a complex, incomplete one
- **Test your work**: At minimum, think through the user flow and check for TypeScript errors
- **Time management**: If you get stuck, leave a comment and move on

## File Structure

```
part-2-code/
├── src/
│   ├── types/
│   │   └── index.ts          # Core type definitions
│   ├── services/
│   │   └── auditService.ts   # Audit logging service
│   ├── components/
│   │   ├── PatientRecordViewer.tsx    # Main component for viewing patient records
│   │   └── AuditLogViewer.tsx         # Component for viewing audit logs
│   └── utils/
│       └── validation.ts      # Validation helpers
├── package.json
└── tsconfig.json
```

## Evaluation Criteria

Your implementation will be evaluated on:

- ✅ **Completeness**: Does the feature work end-to-end?
- ✅ **Code quality**: Is your code readable and well-structured?
- ✅ **TypeScript usage**: Proper types, no `any`, good inference
- ✅ **Comments**: Have you documented assumptions and trade-offs?
- ✅ **User experience**: Does the flow make sense for a busy healthcare provider?
- ✅ **Attention to detail**: Edge cases, error handling, accessibility basics

## Running the Code

```bash
cd part-2-code
npm install
npm run type-check  # Check for TypeScript errors
```

Note: This is a simplified exercise - there's no build process or actual UI. Focus on the TypeScript implementation and React component structure.

## Tips

- Read through ALL the files before writing any code
- Start with the types, then move to services, then components
- Leave comments as you go, not at the end
- If you're unsure about something, make a reasonable assumption and document it
- The goal is to show your thought process, not to build production-ready code in 70 minutes

Good luck! 🚀
