# Simplify Path - Study Guide

## Problem Overview
Given an absolute path for a Unix-style file system (starting with `/`), convert it to its simplified canonical path.

## Rules for Canonical Paths

1. Path must start with `/`
2. Directories are separated by a single `/`
3. Path must not end with `/` (unless it's the root `/`)
4. No `.` (current directory) or `..` (parent directory) in the result
5. No consecutive slashes `//`

## Why Your Approach is Overcomplicated

Your code uses a `Map` with indices as keys, which creates problems:

```typescript
// Your approach:
hash.delete(i - 1);  // This doesn't work!
```

**The Problem**: When you split `"/a/b/../c"` you get:
- Index 0: "" (empty)
- Index 1: "a"
- Index 2: "b"
- Index 3: ".."
- Index 4: "c"

When you see `".."` at index 3 and try `hash.delete(i - 1)`, you're deleting index 2, but index 2 might not be what you just added (if there were empty strings or `.` before it).

## The Right Data Structure: Stack

This is a **classic stack problem**. Think about it:
- When you see a directory name: **push** it onto the stack
- When you see `..`: **pop** from the stack (go to parent)
- When you see `.` or empty: **ignore** it

### Why Stack?

```
Path: /a/b/c/../../d

Process:
[a] → [a,b] → [a,b,c] → [a,b] (pop c) → [a] (pop b) → [a,d]

Result: /a/d
```

The stack naturally handles the "go back to parent" operation because the most recently added directory is the one you want to remove.

## Complete Implementation

```typescript
function simplifyPath(path: string): string {
  const stack: string[] = [];
  const parts = path.split('/');

  for (const part of parts) {
    // Skip empty parts and current directory
    if (part === '' || part === '.') {
      continue;
    }

    // Go to parent directory (pop from stack)
    if (part === '..') {
      if (stack.length > 0) {
        stack.pop();
      }
      // If stack is empty, we're at root, can't go higher
      continue;
    }

    // Regular directory name: add to stack
    stack.push(part);
  }

  // Build result: join with '/' and add leading '/'
  return '/' + stack.join('/');
}
```

## Step-by-Step Example

### Example 1: `/home/user/Documents/../Pictures`

```
Split: ['', 'home', 'user', 'Documents', '..', 'Pictures']

Process:
'' → skip (empty)
'home' → stack: ['home']
'user' → stack: ['home', 'user']
'Documents' → stack: ['home', 'user', 'Documents']
'..' → pop, stack: ['home', 'user']
'Pictures' → stack: ['home', 'user', 'Pictures']

Result: '/' + 'home/user/Pictures' = '/home/user/Pictures'
```

### Example 2: `/.../a/../b/c/../d/./`

```
Split: ['', '...', 'a', '..', 'b', 'c', '..', 'd', '.', '']

Process:
'' → skip
'...' → stack: ['...']  (valid directory name!)
'a' → stack: ['...', 'a']
'..' → pop, stack: ['...']
'b' → stack: ['...', 'b']
'c' → stack: ['...', 'b', 'c']
'..' → pop, stack: ['...', 'b']
'd' → stack: ['...', 'b', 'd']
'.' → skip
'' → skip

Result: '/.../b/d'
```

## Common Edge Cases

```typescript
// Root directory
simplifyPath("/") → "/"

// Multiple slashes
simplifyPath("//home//foo/") → "/home/foo"

// Going above root
simplifyPath("/../") → "/"
simplifyPath("/../../") → "/"

// Only dots
simplifyPath("/./") → "/"
simplifyPath("/../") → "/"

// '...' is a valid directory name!
simplifyPath("/.../") → "/..."
simplifyPath("/.../a/../b/") → "/.../b"

// Empty result
simplifyPath("/a/../") → "/"
```

## Key Insights

### 1. The Stack Pattern
Any time you have:
- Operations that can be "undone" (like `..` undoing a directory)
- Last-in-first-out behavior
- Building something incrementally that can be removed

Think: **Stack**

### 2. Don't Use Map with Indices
Your approach with `Map<number, string>` has issues:
- Deleting by index doesn't account for skipped items
- Indices from split don't represent the logical structure
- Makes the code harder to reason about

### 3. Edge Case: `...` is Valid
Many people miss this! In Unix, `...` is a **valid directory name**, not a special operator.

Only `.` and `..` are special:
- `.` = current directory
- `..` = parent directory
- `...` = directory literally named "..."

### 4. The Join Trick
```typescript
'/' + stack.join('/')
```

This handles all cases elegantly:
- Empty stack: `'/' + '' = '/'`
- One item: `'/' + 'home' = '/home'`
- Multiple: `'/' + 'a/b/c' = '/a/b/c'`

## What You Learned From Your Overcomplicated Version

Your instinct to use a Map shows you're thinking about the problem, but:

1. **Recognize data structure patterns** - This is a stack problem
2. **Indices aren't always the right key** - Here they create more problems
3. **Simpler is better** - Stack solution is ~10 lines vs your Map approach

## Comparison: Your Code vs Stack

### Your Code Issues:
```typescript
hash.delete(i - 1);  // Wrong! Doesn't account for skipped indices
```

### Stack Solution:
```typescript
stack.pop();  // Right! Always removes the last directory added
```

## Time & Space Complexity

- **Time**: O(n) where n is the length of the path string
- **Space**: O(n) for the stack (worst case: no `..` operators)

## Mental Model

Think of the stack as your "current location":
- Each directory name moves you deeper (push)
- `..` moves you up one level (pop)
- `.` keeps you where you are (no-op)
- At the end, the stack contains your canonical path

## Practice Strategy

1. **Identify** this as a stack problem
2. **Split** the path by `/`
3. **Process** each part with stack operations
4. **Join** the stack back into a path
5. **Test** edge cases (especially `...` and going above root)

## Test Your Understanding

Can you trace through this without running code?

```typescript
simplifyPath("/a/./b/../../c/")
```

<details>
<summary>Answer (click to expand)</summary>

```
Split: ['', 'a', '.', 'b', '..', '..', 'c', '']

'' → skip
'a' → stack: ['a']
'.' → skip
'b' → stack: ['a', 'b']
'..' → pop, stack: ['a']
'..' → pop, stack: []
'c' → stack: ['c']
'' → skip

Result: '/c'
```
</details>

## Key Takeaway

Don't use complex data structures (like Map with indices) when a simple stack solves the problem elegantly. The stack's LIFO nature perfectly matches the `..` operation's "undo last directory" semantics.
