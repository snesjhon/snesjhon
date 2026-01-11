# Decode String Solution

## The Complete Solution

```typescript
function decodeString(s: string): string {
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "]") {
      // Push everything except ']'
      stack.push(s[i]);
    } else {
      // Hit ']', time to decode

      // Step 1: Collect the string to repeat
      let str = "";
      while (stack[stack.length - 1] !== "[") {
        str = stack.pop() + str; // prepend to maintain order
      }

      // Step 2: Remove the '['
      stack.pop();

      // Step 3: Get the number
      let num = "";
      while (stack.length > 0 && !isNaN(Number(stack[stack.length - 1]))) {
        num = stack.pop() + num; // prepend to build number correctly
      }

      // Step 4: Repeat the string and push back
      const repeated = str.repeat(Number(num));
      stack.push(repeated);
    }
  }

  return stack.join("");
}
```

## How This Solution Works

### Phase 1: Setup (Line 2)

**Reference: Study Guide - "What Goes on the Stack?"**

```typescript
const stack: string[] = [];
```

We use a single stack to store:
- Individual characters (letters)
- Individual digits (as strings)
- Opening brackets `[`
- Decoded segments (multi-character strings)

**Why string array?**
- Simplifies type handling
- `join("")` at the end combines everything
- Can store both single chars and decoded segments

### Phase 2: Push Everything Except `]` (Lines 4-6)

**Reference: Study Guide - "The Stack-Based Pattern"**

```typescript
for (let i = 0; i < s.length; i++) {
  if (s[i] !== "]") {
    stack.push(s[i]);
  }
}
```

For every character that's NOT a closing bracket:
- Push digits: `'3'`, `'1', '0'` (multi-digit later)
- Push opening brackets: `'['`
- Push letters: `'a'`, `'b'`, `'c'`

We accumulate everything until we hit `]`, which triggers decoding.

### Phase 3: Decode on `]` - Collect String (Lines 11-14)

**Reference: Study Guide - "The Reversal Problem"**

```typescript
let str = "";
while (stack[stack.length - 1] !== "[") {
  str = stack.pop() + str; // prepend to maintain order
}
```

When we hit `]`, pop characters until we hit `[`:
- Pop in reverse order: last pushed comes out first
- **Prepend** (`stack.pop() + str`) to reverse the reversal

**Example:**
```
Stack before: [..., '[', 'a', 'b', 'c']
Pop: 'c', 'b', 'a'

Building with +=:
  str = "" + 'c' = "c"
  str = "c" + 'b' = "cb"
  str = "cb" + 'a' = "cba" ✗ wrong!

Building with prepend (pop + str):
  str = 'c' + "" = "c"
  str = 'b' + "c" = "bc"
  str = 'a' + "bc" = "abc" ✓ correct!
```

### Phase 4: Remove `[` (Line 17)

```typescript
stack.pop(); // Remove the '['
```

Simple - we hit the `[` delimiter, so remove it.

### Phase 5: Extract Number (Lines 19-23)

**Reference: Study Guide - "Multi-Digit Numbers"**

```typescript
let num = "";
while (stack.length > 0 && !isNaN(Number(stack[stack.length - 1]))) {
  num = stack.pop() + num; // prepend to build number correctly
}
```

Numbers can be multi-digit like `"100"`, stored as `'1', '0', '0'`:
- Pop while top is a digit
- **Prepend** to build the number in correct order

**Example:**
```
Stack before: [..., '1', '0', '0', '[', ...]

Pop: '0' → num = '0' + "" = "0"
Pop: '0' → num = '0' + "0" = "00"
Pop: '1' → num = '1' + "00" = "100" ✓

If we did += instead:
  num = "0"
  num = "00"
  num = "001" ✗ wrong!
```

**Why check stack.length > 0?**
- Edge case: number could be at start of stack
- Prevent popping from empty stack

**Why !isNaN(Number(...))?**
- `isNaN(Number('3'))` = false → is a digit, continue
- `isNaN(Number('a'))` = true → not a digit, stop

### Phase 6: Repeat and Push Back (Lines 25-27)

**Reference: Study Guide - "The Nested Structure Challenge"**

```typescript
const repeated = str.repeat(Number(num));
stack.push(repeated);
```

1. Convert `num` string to number: `"100"` → `100`
2. Repeat the decoded string: `"abc".repeat(3)` → `"abcabcabc"`
3. **Push back onto stack**: Critical for nested encodings!

**Why push back?**
The decoded segment might be part of a larger encoding:
```
Input: "2[a3[b]]"

After decoding "3[b]" → "bbb":
  Stack: ['2', '[', 'a', ...]
  Need to push "bbb" back: ['2', '[', 'a', 'bbb']

Later decode "2[abbb]" → "abbbabbb"
```

### Phase 7: Return Result (Line 32)

```typescript
return stack.join("");
```

After processing all characters, stack contains the final result:
- If no encodings: `['a', 'b', 'c']` → `"abc"`
- If encodings: `['abcabcabc']` → `"abcabcabc"`
- Mixed: `['aaa', 'b', 'b', 'c']` → `"aaabbc"`

## Why This Solution is Correct

### Correctness Argument

**Claim**: This correctly decodes nested bracket encodings.

**Proof sketch:**

1. **Base case**: Regular characters pushed and joined → correct
2. **Simple encoding**: `"3[a]"` → push '3','[','a', hit ']', decode → correct
3. **Nested encoding**: Inner brackets processed first (stack LIFO) → correct
4. **Multi-digit**: Build number before using → correct
5. **Push back**: Decoded segments reusable for outer encodings → correct

### Example Walkthrough

**Reference: Study Guide - "Visualization of Complete Example"**

```
Input: "3[a2[c]]"
```

**Step-by-step:**

```ts
i=0, s[0]='3':
  '3' !== ']' → stack.push('3')
  stack: ['3']

i=1, s[1]='[':
  '[' !== ']' → stack.push('[')
  stack: ['3', '[']

i=2, s[2]='a':
  'a' !== ']' → stack.push('a')
  stack: ['3', '[', 'a']

i=3, s[3]='2':
  '2' !== ']' → stack.push('2')
  stack: ['3', '[', 'a', '2']

i=4, s[4]='[':
  '[' !== ']' → stack.push('[')
  stack: ['3', '[', 'a', '2', '[']

i=5, s[5]='c':
  'c' !== ']' → stack.push('c')
  stack: ['3', '[', 'a', '2', '[', 'c']

i=6, s[6]=']':
  Decode time!

  Build string until '[':
    stack.top() = 'c' !== '[' → str = 'c' + "" = "c", stack.pop()
    stack.top() = '[' → stop
    str = "c"
    stack: ['3', '[', 'a', '2', '[']

  Pop '[':
    stack.pop()
    stack: ['3', '[', 'a', '2']

  Build number:
    stack.top() = '2', isDigit → num = '2' + "" = "2", stack.pop()
    stack.top() = 'a', !isDigit → stop
    num = "2"
    stack: ['3', '[', 'a']

  Repeat and push:
    repeated = "c".repeat(2) = "cc"
    stack.push("cc")
    stack: ['3', '[', 'a', 'cc']

i=7, s[7]=']':
  Decode time!

  Build string until '[':
    stack.top() = 'cc' !== '[' → str = 'cc' + "" = "cc", stack.pop()
    stack.top() = 'a' !== '[' → str = 'a' + "cc" = "acc", stack.pop()
    stack.top() = '[' → stop
    str = "acc"
    stack: ['3']

  Pop '[':
    stack.pop()
    stack: ['3']

  Build number:
    stack.top() = '3', isDigit → num = '3' + "" = "3", stack.pop()
    stack.empty() → stop
    num = "3"
    stack: []

  Repeat and push:
    repeated = "acc".repeat(3) = "accaccacc"
    stack.push("accaccacc")
    stack: ['accaccacc']

i=8, done!

Return: stack.join("") = "accaccacc" ✓
```

### Another Example: Mixed Content

```ts
Input: "2[abc]3[cd]ef"

i=0, '2' → push → ['2']
i=1, '[' → push → ['2', '[']
i=2, 'a' → push → ['2', '[', 'a']
i=3, 'b' → push → ['2', '[', 'a', 'b']
i=4, 'c' → push → ['2', '[', 'a', 'b', 'c']

i=5, ']' → decode:
  str = 'c'+'b'+'a' (with prepend) = "abc"
  pop '['
  num = "2"
  repeated = "abcabc"
  push → ['abcabc']

i=6, '3' → push → ['abcabc', '3']
i=7, '[' → push → ['abcabc', '3', '[']
i=8, 'c' → push → ['abcabc', '3', '[', 'c']
i=9, 'd' → push → ['abcabc', '3', '[', 'c', 'd']

i=10, ']' → decode:
  str = "cd"
  num = "3"
  repeated = "cdcdcd"
  push → ['abcabc', 'cdcdcd']

i=11, 'e' → push → ['abcabc', 'cdcdcd', 'e']
i=12, 'f' → push → ['abcabc', 'cdcdcd', 'e', 'f']

Return: "abcabccdcdcdef" ✓
```

## Performance Analysis

**Reference: Study Guide - "Performance Considerations"**

### Time Complexity: O(n)

Where n is the length of the **decoded** string.

- Each character in input scanned once: O(input length)
- Characters pushed/popped at most once each
- String building inside-out means characters copied multiple times
- Worst case `"100[a]"`: the 'a' is copied 100 times

**More precisely**: O(maxK × n) where maxK is the maximum count value.

But since the decoded string length is already O(maxK × n), we say **O(output length)**.

### Space Complexity: O(n)

- Stack stores: O(input length) in worst case
- Decoded segments pushed back: O(output length)
- Total: O(max(input, output)) = O(output)

**Worst case nesting:**
```ts
"10[10[10[a]]]"
Stack depth = 3 (nesting level)
Output length = 1000
Space = O(1000)
```

## Alternative Approach: Two Stacks

**Reference: Study Guide - "Two-Stack Approach"**

```typescript
function decodeString(s: string): string {
  const numStack: number[] = [];
  const strStack: string[] = [];
  let currentStr = "";
  let currentNum = 0;

  for (let char of s) {
    if (!isNaN(Number(char))) {
      // Build multi-digit number
      currentNum = currentNum * 10 + Number(char);
    } else if (char === "[") {
      // Save state and start fresh
      numStack.push(currentNum);
      strStack.push(currentStr);
      currentNum = 0;
      currentStr = "";
    } else if (char === "]") {
      // Decode: combine previous + (current × count)
      const prevStr = strStack.pop() || "";
      const count = numStack.pop() || 1;
      currentStr = prevStr + currentStr.repeat(count);
    } else {
      // Regular character
      currentStr += char;
    }
  }

  return currentStr;
}
```

**Why this is cleaner:**
- Separate type handling: numbers vs strings
- No string reversal issues (build in correct order)
- Clearer state management

**Trade-off:**
- Two data structures instead of one
- Same time/space complexity

## Common Mistakes Explained

**Reference: Study Guide - "Common Pitfalls"**

### Mistake 1: Building String in Wrong Order

```typescript
// ❌ Wrong
let str = "";
while (stack.top() !== '[') {
  str += stack.pop(); // "cba" instead of "abc"
}

// ✅ Correct
let str = "";
while (stack.top() !== '[') {
  str = stack.pop() + str; // prepend
}
```

### Mistake 2: Not Handling Multi-Digit Numbers

```typescript
// ❌ Wrong - only gets last digit
const num = stack.pop(); // '0' from '100'

// ✅ Correct - builds full number
let num = "";
while (!isNaN(Number(stack.top()))) {
  num = stack.pop() + num;
}
```

### Mistake 3: Not Pushing Decoded Segment Back

```typescript
// ❌ Wrong
const repeated = str.repeat(Number(num));
// Don't push back, just continue
// This breaks nested encodings!

// ✅ Correct
const repeated = str.repeat(Number(num));
stack.push(repeated); // Must push back for nesting
```

### Mistake 4: Type Confusion

```typescript
// ❌ Wrong
stack.push(3); // number
// Later...
"abc".repeat(stack.pop()); // expects number but stack is mixed types

// ✅ Correct - keep consistent types
stack.push('3'); // string
// Later...
"abc".repeat(Number(stack.pop())); // convert when needed
```

## Key Takeaways

1. **Stack processes brackets inside-out** - LIFO naturally handles nesting
2. **Prepend when building** - reverses the reversal from popping
3. **Multi-digit numbers** - accumulate all digit characters
4. **Push decoded segments back** - essential for nested encodings
5. **Join at the end** - stack contains final result as array
6. **Characters outside brackets** - just push and join later
7. **Two-stack approach** - cleaner but more structures

## Edge Cases Handled

1. **No brackets**: `"abc"` → stack=['a','b','c'] → `"abc"` ✓
2. **Simple encoding**: `"3[a]"` → decoded correctly ✓
3. **Nested**: `"2[a2[b]]"` → processes inner first ✓
4. **Multi-segment**: `"2[a]3[b]"` → both decoded and joined ✓
5. **Mixed**: `"a2[b]c"` → regular chars preserved ✓
6. **Large numbers**: `"100[a]"` → builds "100" correctly ✓
7. **Deep nesting**: `"2[2[2[a]]]"` → processes innermost first ✓

## Connection to Study Guide Concepts

- ✅ **Stack-Based Pattern**: Hit `]` → pop and process
- ✅ **Reversal Problem**: Prepend when building strings
- ✅ **Multi-Digit Numbers**: Accumulate before converting
- ✅ **Nested Structure**: Push back decoded segments
- ✅ **Mixed Types**: Handle digits, letters, brackets, segments
- ✅ **Performance**: O(output length) time and space

This solution elegantly handles all the challenges discussed in the study guide using a simple single-stack approach.