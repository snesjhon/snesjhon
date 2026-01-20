# Pow(x, n) - Solution Guide

## The Complete Solutions

### Solution 1: Naive Loop (Time Limit Exceeded)

```typescript
function myPowNaive(x: number, n: number): number {
  if (n === 0) return 1;

  let result = 1;
  const absN = Math.abs(n);

  for (let i = 0; i < absN; i++) {
    result *= x;
  }

  return n < 0 ? 1 / result : result;
}
```

**Why this fails:** For `n = 2^31 - 1`, this loop runs 2 billion times.

---

### Solution 2: Recursive Binary Exponentiation

```typescript
function myPowRecursive(x: number, n: number): number {
  // Base case
  if (n === 0) return 1;

  // Handle negative exponent
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  // Recursive case
  if (n % 2 === 0) {
    // Even: x^n = (x^(n/2))^2
    const half = myPowRecursive(x, n / 2);
    return half * half;
  } else {
    // Odd: x^n = x * x^(n-1)
    return x * myPowRecursive(x, n - 1);
  }
}
```

---

### Solution 3: Iterative Binary Exponentiation (Optimal)

```typescript
function myPow(x: number, n: number): number {
  // Handle negative exponent
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  let result = 1;

  while (n > 0) {
    // If current bit is 1, multiply result by current x
    if (n % 2 === 1) {
      result *= x;
    }
    // Square x for next bit position
    x *= x;
    // Move to next bit (integer division)
    n = Math.floor(n / 2);
  }

  return result;
}
```

---

### Solution 4: Handling Integer Overflow Edge Case

```typescript
function myPowSafe(x: number, n: number): number {
  // Special case: n is minimum integer (-2^31)
  // -n would overflow, so handle separately
  if (n === -2147483648) {
    // x^(-2^31) = (x^2)^(-2^30)
    x = x * x;
    n = -1073741824; // -2^30
  }

  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  let result = 1;

  while (n > 0) {
    if (n % 2 === 1) {
      result *= x;
    }
    x *= x;
    n = Math.floor(n / 2);
  }

  return result;
}
```

---

## How Each Solution Works

### Recursive Solution Explained

**Reference: Study Guide - "The Two Rules"**

```typescript
if (n % 2 === 0) {
  const half = myPowRecursive(x, n / 2);
  return half * half;
}
```

**Why compute `half` once?**

```typescript
// WRONG - computes x^(n/2) twice!
return myPowRecursive(x, n / 2) * myPowRecursive(x, n / 2);

// CORRECT - computes once, uses twice
const half = myPowRecursive(x, n / 2);
return half * half;
```

The wrong version has O(n) time complexity because it branches twice at each level!

**Handling negative exponent:**

```typescript
if (n < 0) {
  x = 1 / x;   // Invert base
  n = -n;      // Make exponent positive
}
```

This transforms `2^(-3)` into `(1/2)^3` = `0.5^3` = `0.125`.

---

### Iterative Solution Explained

**Reference: Study Guide - "The Binary Connection"**

The iterative solution processes `n` bit by bit:

```typescript
while (n > 0) {
  if (n % 2 === 1) {    // Current bit is 1
    result *= x;        // Include this power of x
  }
  x *= x;               // Square for next power
  n = Math.floor(n / 2); // Shift to next bit
}
```

**Trace for x=2, n=10 (binary 1010):**

| Iteration | n | n%2 | Action | result | x |
|-----------|---|-----|--------|--------|---|
| start | 10 | - | - | 1 | 2 |
| 1 | 10 | 0 | skip | 1 | 4 |
| 2 | 5 | 1 | result×4 | 4 | 16 |
| 3 | 2 | 0 | skip | 4 | 256 |
| 4 | 1 | 1 | result×256 | 1024 | 65536 |
| 5 | 0 | - | exit | **1024** | - |

**Why `Math.floor(n / 2)`?**

In TypeScript/JavaScript, we need explicit floor division. Bitwise alternative: `n >>> 1` (unsigned right shift).

---

### Integer Overflow Solution Explained

**Reference: Study Guide - "Integer Overflow"**

The problem states `-2^31 <= n <= 2^31 - 1`.

When `n = -2147483648` (which is `-2^31`):
- Computing `-n` gives `2147483648`
- But max 32-bit signed integer is `2147483647`
- This causes overflow!

**The fix:**

```typescript
if (n === -2147483648) {
  x = x * x;           // Square x
  n = -1073741824;     // n becomes -2^30 (half)
}
```

This works because `x^(-2^31) = (x^2)^(-2^30)`.

Now `-n = 2^30 = 1073741824`, which fits in 32 bits.

---

## Correctness Proofs

### Binary Exponentiation Correctness

**Claim:** The algorithm correctly computes `x^n` for all non-negative integers `n`.

**Proof by strong induction on n:**

**Base case (n = 0):**
- Algorithm returns 1
- `x^0 = 1` by definition ✓

**Inductive step:**
Assume the algorithm is correct for all values less than `n`.

**Case 1: n is even**
- Algorithm computes `half = x^(n/2)` (correct by induction since `n/2 < n`)
- Returns `half * half = x^(n/2) × x^(n/2) = x^n` ✓

**Case 2: n is odd**
- Algorithm computes `x^(n-1)` (correct by induction since `n-1 < n`)
- Returns `x × x^(n-1) = x^n` ✓

### Negative Exponent Handling

**Claim:** For negative `n`, computing `(1/x)^(-n)` equals `x^n`.

**Proof:**
```
(1/x)^(-n) = 1^(-n) / x^(-n)
           = 1 / x^(-n)
           = x^n     (by definition of negative exponent)
```

---

## Performance Analysis

### Time Complexity

| Solution | Time | Explanation |
|----------|------|-------------|
| Naive | O(n) | Loop runs n times |
| Recursive | O(log n) | Halve n each even step |
| Iterative | O(log n) | Process log(n) bits |

**Why O(log n)?**

Each iteration either:
- Divides n by 2 (even case), or
- Subtracts 1, making it even (odd case)

At most 2×log(n) operations because:
- At most log(n) divisions
- At most log(n) subtractions (each followed by a division)

### Space Complexity

| Solution | Space | Explanation |
|----------|-------|-------------|
| Naive | O(1) | Just loop variable |
| Recursive | O(log n) | Call stack depth |
| Iterative | O(1) | Constant extra space |

---

## Common Mistakes

### Mistake 1: Computing Half Twice

```typescript
// WRONG - O(n) complexity!
if (n % 2 === 0) {
  return myPow(x, n / 2) * myPow(x, n / 2);
}

// CORRECT - O(log n)
if (n % 2 === 0) {
  const half = myPow(x, n / 2);
  return half * half;
}
```

### Mistake 2: Forgetting n = 0 Base Case

```typescript
// WRONG - infinite recursion when n = 0
function myPow(x: number, n: number): number {
  if (n % 2 === 0) {
    const half = myPow(x, n / 2);
    return half * half;
  }
  // ...
}

// CORRECT
function myPow(x: number, n: number): number {
  if (n === 0) return 1;  // Base case!
  // ...
}
```

### Mistake 3: Integer Division in JavaScript

```typescript
// WRONG - JavaScript uses float division
n = n / 2;  // 5/2 = 2.5, not 2!

// CORRECT
n = Math.floor(n / 2);  // 5/2 = 2
// or
n = n >>> 1;  // Bitwise right shift
// or
n = (n / 2) | 0;  // Bitwise OR with 0 truncates
```

### Mistake 4: Not Handling Negative Exponent

```typescript
// WRONG - incorrect for negative n
function myPow(x: number, n: number): number {
  let result = 1;
  while (n > 0) { ... }  // Never enters loop for n < 0
  return result;
}

// CORRECT
function myPow(x: number, n: number): number {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  // ... rest of algorithm
}
```

### Mistake 5: Integer Overflow with -2^31

```typescript
// WRONG - overflow when n = -2147483648
n = -n;  // -(-2147483648) overflows in 32-bit

// CORRECT
if (n === -2147483648) {
  x = x * x;
  n = -1073741824;
}
```

---

## Bitwise Optimization

For those who prefer bitwise operations:

```typescript
function myPowBitwise(x: number, n: number): number {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  let result = 1;

  while (n > 0) {
    if (n & 1) {        // Check if last bit is 1
      result *= x;
    }
    x *= x;
    n >>>= 1;           // Unsigned right shift
  }

  return result;
}
```

**Bitwise operations:**
- `n & 1` — Check if odd (last bit is 1)
- `n >>>= 1` — Divide by 2 (unsigned right shift)

---

## Related Problems

1. **Sqrt(x)** - Binary search for square root
2. **Super Pow** - Modular exponentiation with array exponent
3. **Count Good Numbers** - Fast exponentiation with modulo
4. **Matrix Exponentiation** - For Fibonacci in O(log n)

---

## Key Takeaways

1. **Squaring trick:** `x^n = (x^(n/2))^2` halves the problem
2. **Two cases:** Even → square, Odd → multiply then even
3. **Binary representation:** Each bit of n tells us whether to multiply
4. **Time complexity:** O(log n) multiplications instead of O(n)
5. **Space optimization:** Iterative version uses O(1) space
6. **Edge cases:** Handle n=0, negative n, and potential overflow
7. **Compute half once:** Don't call recursive function twice!

---

## Connection to Study Guide Concepts

- **Binary Exponentiation:** Halving the exponent at each step
- **Bit Manipulation:** Processing n's binary representation
- **Recursion to Iteration:** Converting recursive solution to iterative
- **Edge Case Handling:** Negative exponents and integer overflow
- **Time Complexity:** Reducing O(n) to O(log n)