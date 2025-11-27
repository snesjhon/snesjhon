# String to Integer (atoi) - Study Guide

## Problem Overview
Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.

## The Algorithm Steps

1. **Whitespace**: Ignore any leading whitespace
2. **Signedness**: Check if the next character is '-' or '+', assume positive if neither
3. **Conversion**: Read digits until a non-digit character or end of string
4. **Rounding**: Clamp the result to 32-bit signed integer range [-2³¹, 2³¹ - 1]

## Why You Should NOT Use parseInt()

The entire point of this problem is to **manually build the integer from digits**. Using `parseInt()` bypasses the learning objective:

- Understanding how to convert ASCII characters to numbers
- Managing integer overflow manually
- Building numbers digit by digit

## The Manual Approach

### Key Concept: Building Numbers from Digits

```typescript
// If you have the string "123", you build it like this:
result = 0
result = result * 10 + 1  // 1
result = result * 10 + 2  // 12
result = result * 10 + 3  // 123
```

### Converting Character to Number

```typescript
// ASCII codes: '0' = 48, '1' = 49, '2' = 50, etc.
const charToDigit = (char: string): number => {
  return char.charCodeAt(0) - '0'.charCodeAt(0);
  // or simply: char.charCodeAt(0) - 48
}

// Example:
// '5'.charCodeAt(0) = 53
// 53 - 48 = 5
```

## Complete Implementation Pattern

```typescript
function myAtoi(s: string): number {
  const INT_MAX = 2**31 - 1;  // 2147483647
  const INT_MIN = -(2**31);    // -2147483648

  let i = 0;

  // Step 1: Skip leading whitespace
  while (i < s.length && s[i] === ' ') {
    i++;
  }

  // Step 2: Check for sign
  let sign = 1;
  if (i < s.length && (s[i] === '+' || s[i] === '-')) {
    sign = s[i] === '-' ? -1 : 1;
    i++;
  }

  // Step 3: Build the number
  let result = 0;
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    const digit = s[i].charCodeAt(0) - '0'.charCodeAt(0);

    // Step 4: Check for overflow BEFORE adding the digit
    // If result > INT_MAX / 10, then result * 10 will overflow
    // If result === INT_MAX / 10 and digit > 7, then result * 10 + digit will overflow
    if (result > Math.floor(INT_MAX / 10) ||
        (result === Math.floor(INT_MAX / 10) && digit > 7)) {
      return sign === 1 ? INT_MAX : INT_MIN;
    }

    result = result * 10 + digit;
    i++;
  }

  return result * sign;
}
```

## Critical Points to Remember

### 1. Checking Digits Without isNaN()
```typescript
// Good: Direct character comparison
if (char >= '0' && char <= '9') { ... }

// Avoid: Using parseInt/isNaN (defeats the purpose)
if (!isNaN(parseInt(char))) { ... }
```

### 2. Overflow Detection
You must check for overflow **BEFORE** multiplying/adding:

```typescript
// Wrong: Check after overflow already happened
result = result * 10 + digit;
if (result > INT_MAX) return INT_MAX;

// Right: Check before operation
if (result > INT_MAX / 10) return INT_MAX;
result = result * 10 + digit;
```

### 3. Edge Cases

- `"   42"` → 42 (leading whitespace)
- `"   -42"` → -42 (negative)
- `"4193 with words"` → 4193 (stop at non-digit)
- `"words and 987"` → 0 (no valid conversion)
- `"-91283472332"` → -2147483648 (underflow)
- `"21474836460"` → 2147483647 (overflow)
- `"+-12"` → 0 (invalid sign combination)
- `"00000-42a1234"` → 0 (sign after digits)

## Common Mistakes in Your Code

Looking at your implementation:

1. **Using parseInt()** - This defeats the purpose of the exercise
2. **Complex sign handling** - You're tracking sign separately when you should build it into the result
3. **Leading zeros handling** - Overcomplicating by trying to skip them manually
4. **No overflow checking** - Missing the 32-bit integer range clamping

## Practice Strategy

1. **First**: Implement basic version without overflow handling
2. **Second**: Add overflow detection
3. **Third**: Test all edge cases
4. **Finally**: Optimize for clarity

## Test Cases to Verify

```typescript
console.log(myAtoi("42"));                    // 42
console.log(myAtoi("   -42"));                // -42
console.log(myAtoi("4193 with words"));       // 4193
console.log(myAtoi("words and 987"));         // 0
console.log(myAtoi("-91283472332"));          // -2147483648
console.log(myAtoi("21474836460"));           // 2147483647
console.log(myAtoi("  0000000000012345678")); // 12345678
console.log(myAtoi("00000-42a1234"));         // 0
console.log(myAtoi("+-12"));                  // 0
console.log(myAtoi("   +0 123"));             // 0
```

## Time & Space Complexity

- **Time**: O(n) where n is the length of the string
- **Space**: O(1) constant space

## Key Takeaway

The entire learning objective is understanding how computers convert character representations of numbers into actual integer values. Using `parseInt()` is like using a calculator on a math test - you get the answer but miss the learning.
