## Fri, Jan 23

Subsets (LC #78) - Medium but fundamental
[[ysk/study-guides/078-subsets/mental-model|78-subsets]]
- in tackling this issue I ended up with a fundamental problem I hadn't really considered. 
- When pushing to an array we _push_ a `Reference` so, in scenarios where we want to store the `current` value we have to assure that we're pushing copies of the values, not `REFERENCES` of said value or we'll be overriding them


Great question! To solidify the backtracking pattern  you just learned, I'd recommend LeetCode 784 - Letter Case Permutation. It's perfect because it uses the exact same pattern but is simpler in one way (only 2 choices per position instead of 3-4).                  

1. LeetCode 78 - Subsets - Include/exclude each element
   (2 choices per position)                              
2. LeetCode 77 - Combinations - Choose k numbers from 1 to n                                                  
3. LeetCode 39 - Combination Sum - Same element can be reused (like this problem!) 
4. LeetCode 46 - Permutations - Classic backtracking   
  with "used" tracking                                   



---
## Tue, Jan 20

Essential Easy Recursion Problems

1. Climbing Stairs (LC #70) - Foundation
	- Why: Perfect introduction to recursion + memoization
	- Concept: Each step has choices, build solution from subproblems
	- Mental Model: "How many ways to reach step n? = ways to reach (n-1) + ways to reach (n-2)"
	
2. Power of Two/Three/Four (LC #231, #326, #342) - Base Cases
	- Why: Simple recursion with clear base cases
	- Concept: Divide and conquer thinking
	- Mental Model: "Is n a power of x? Check if n/x is a power of x"

3. Reverse Linked List (LC #206) - Classic Pattern

- Why: Pure recursion thinking without complex branching
- Concept: "Leap of faith" - trust recursion handles the rest
- Mental Model: "Reverse the rest, then attach current node"

1. Fibonacci Number (LC #509) - Tree Recursion Basics

- Why: Introduces the recursion tree concept
- Concept: Multiple recursive calls, memoization importance
- Mental Model: Visual tree with overlapping subproblems

1. Maximum Depth of Binary Tree (LC #104) - Tree Traversal

- Why: Introduces tree recursion naturally
- Concept: Combine results from left and right subtrees
- Mental Model: "My depth = 1 + max(left depth, right depth)"

Bridge to Medium Problems

Once comfortable with the above, these will prepare you for Generate Parentheses:

6. Letter Combinations of Phone Number (LC #17) - Easy/Medium

- Why: Multiple choices at each step (like Generate Parentheses)
- Concept: Building strings with branching paths
- Mental Model: Decision tree with backtracking

6. Subsets (LC #78) - Medium but fundamental

- Why: Core backtracking pattern
- Concept: Include/exclude decisions
- Mental Model: Binary tree of choices

Recommended Learning Path

Week 1: Foundation (Easy)
├─ Climbing Stairs (recursion basics)
├─ Fibonacci (tree recursion)
└─ Power of Two (base cases)

Week 2: Tree Thinking (Easy)
├─ Max Depth Binary Tree
├─ Invert Binary Tree (#226)
└─ Reverse Linked List

Week 3: Backtracking Intro (Medium)
├─ Letter Combinations
├─ Subsets (you're starting this!)
└─ Generate Parentheses (you've studied this!)

Would you like me to create a study guide for any of these easier problems, or help you complete the Subsets study guide you've started?
