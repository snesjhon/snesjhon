# Exponent Rules for Interviews

## The Mental Model

Think of exponents as a **sliding scale** around 1:

```
2^3  = 8      ← multiply by 2, three times
2^2  = 4
2^1  = 2
2^0  = 1      ← the anchor point
2^-1 = 0.5   ← divide by 2, once
2^-2 = 0.25  ← divide by 2, twice
```

**Positive = multiply repeatedly. Negative = divide repeatedly.**

---

## Rules to Memorize

| Rule                         | Formula               | Example                |
| ---------------------------- | --------------------- | ---------------------- |
| **Multiply bases**           | `x^a × x^b = x^(a+b)` | `2^3 × 2^2 = 2^5 = 32` |
| **Divide bases**             | `x^a ÷ x^b = x^(a-b)` | `2^5 ÷ 2^2 = 2^3 = 8`  |
| **Power of power**           | `(x^a)^b = x^(a×b)`   | `(2^3)^2 = 2^6 = 64`   |
| **Zero exponent**            | `x^0 = 1`             | `5^0 = 1`              |
| **Negative exponent**        | `x^(-n) = 1/(x^n)`    | `2^(-3) = 1/8`         |
| **Fractional exponent**      | `x^(1/n) = ⁿ√x`       | `8^(1/3) = ∛8 = 2`     |
| **Distribute over multiply** | `(xy)^n = x^n × y^n`  | `(2×3)^2 = 4 × 9 = 36` |
| **Distribute over divide**   | `(x/y)^n = x^n / y^n` | `(4/2)^3 = 64/8 = 8`   |

---

## Quick Reference

```
x^0 = 1           (anything to the zero is 1)
x^1 = x           (anything to the one is itself)
x^(-1) = 1/x      (negative one = reciprocal)
x^(1/2) = √x      (half = square root)
```

---

## Patterns to Recognize

### 1. Halving the Exponent = Squaring the Result

From `(x^a)^b = x^(a×b)`:

```
x^8 = (x^4)²
x^4 = (x^2)²
```

If you can halve a problem repeatedly, you get **O(log n)** instead of O(n). Same intuition as binary search.

### 2. Negative → Positive Conversion

From `x^(-n) = 1/(x^n)`:

Whenever you see a negative exponent, flip the base to its reciprocal and make the exponent positive. Transforms an unfamiliar case into one you already handle.

### 3. Breaking Down Products

From `x^(a+b) = x^a × x^b`:

If you know `x^a` and `x^b`, you can compute `x^(a+b)` without recalculating from scratch. Useful for caching/memoization.

### 4. Roots Are Fractional Exponents

From `x^(1/n) = ⁿ√x`:

```
√x = x^0.5
∛x = x^0.333...
```

Square root problems are exponent problems in disguise.

---

## Common Gotchas

1. **0^0** — typically defined as 1 in programming contexts
2. **Overflow** — large exponents overflow quickly; consider modular arithmetic (`(a * b) % mod`)
3. **Floating point** — `1/x` and fractional exponents introduce precision errors
4. **Integer division** — in some languages `n/2` truncates; be explicit about floor vs exact division
