## Wed, Feb 04

Days 1-4: Arrays & Strings

1. https://leetcode.com/problems/remove-duplicates-from-sorted-array/ - Tests in-place modification
2. https://leetcode.com/problems/remove-element/ - Tests index manipulation
3. https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/ - Tests string pattern matching

Days 5-7: Hash Maps & Hash Sets

4. https://leetcode.com/problems/contains-duplicate/ - Tests basic hash set usage
5. https://leetcode.com/problems/ransom-note/ - Tests frequency counting
6. https://leetcode.com/problems/intersection-of-two-arrays-ii/ - Tests hash map for tracking occurrences

Days 8-10: Two Pointers

7. https://leetcode.com/problems/valid-palindrome/ - Tests converging pointers
8. https://leetcode.com/problems/move-zeroes/ - Tests in-place swapping with two pointers
9. https://leetcode.com/problems/reverse-string/ - Tests basic two pointer swap pattern

Days 11-14: Sliding Window

10. https://leetcode.com/problems/maximum-average-subarray-i/ - Tests fixed-size window
11. https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/ - Tests fixed window with condition
12. https://leetcode.com/problems/find-the-k-beauty-of-a-number/ - Tests sliding window on digits

Days 15-18: Linked Lists

13. https://leetcode.com/problems/linked-list-cycle/ - Tests fast/slow pointer technique
14. https://leetcode.com/problems/merge-two-sorted-lists/ - Tests pointer manipulation
15. https://leetcode.com/problems/reverse-linked-list/ - Tests fundamental reversal pattern

Days 19-21: Stack & Queue

16. https://leetcode.com/problems/valid-parentheses/ - Tests stack for matching pairs
17. https://leetcode.com/problems/implement-queue-using-stacks/ - Tests understanding of both structures
18. https://leetcode.com/problems/implement-stack-using-queues/ - Tests LIFO vs FIFO thinking

Days 22-26: Binary Search

19. https://leetcode.com/problems/binary-search/ - Tests classic binary search template
20. https://leetcode.com/problems/search-insert-position/ - Tests boundary handling
21. https://leetcode.com/problems/valid-perfect-square/ - Tests binary search on answer space

---

## Tue, Feb 03

### Modulo

I guess I've always been under the assumption of modulo as being the remainder of a division. That's what it's always been described as. Given `a` and `b` the modulo would be `5 / 3 === 1.666` and that `6` was the modulo. But that's completely false.

The mdn describes it as

> The **remainder (`%`)** operator returns the remainder left over when one operand is divided by a second operand. It always takes the sign of the dividend.

But that's super confusing because it's not talking about the remainder of `1.66` aka the `Decimal Remainder` it's literally talking about the remainder of values AFTER division.

So, for `5 % 3` ... `3` goes into `5` ...`1` time, and the Value Remainder is `2` because `5 = 1 x 3 + 2`

Or in bigger numbers:

`8 % 3` ... `3` goes into `8` ... `2` times, and the Value Remainder is `2` because `8 = 2 x 3 + 2`

Crazy. Feels like I've never really gotten this until now.

---

"If my checkpoint value is higher than my target, then my target must be in the lower (left) region. I discard everything from checkpoint onwards."

"If my checkpoint value is lower than my target, then my target must be in the higher (right) region. I discard everything up to and including checkpoint."

---
