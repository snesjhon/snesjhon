## Sun, Jan 04

Our `Frequency.size` guarantees Unique items, as long as we increment and decrement from the `Map` thus allowing us to update the `maximum`

---
## Sat, Jan 03

For #concept/two-pointers  I got a bit confused about whether I should do `<` vs `<=`

### Quick Debugging Strategy

When in doubt, trace through these three cases in order:

```ts
// 1. Empty
[]

// 2. Single element (the killer test case!)
[x]

// 3. Two elements  
[x, y]
```

If your loop doesn't handle the single-element case correctly, you almost certainly need `<=`.

**Rule of thumb**: In two-pointer problems where pointers move toward each other and you're processing ALL elements, default to `<=` unless you have a specific reason not to.

---
## Fri, Jan 02

Decided to switch back to Freeform as I think I was getting too riced up in trying to make the DSA setup work within obsidian, but the sketches aren't really part of things I want to keep. I should instead focus on getting the algorithm and then thinking about other ways of mapping these learnings back

On the other hand [[00-complete-dsa-path#Days 5-7 Hash Maps & Hash Sets]] portion went great. In fact I was able to get all of them pretty quickly, albeit some took longer than others. 

I need to always comeback and understand these kinds of problems as I get further along.

---
## Thu, Jan 01

Starting off the day with a good amount of breakdowns on what's suppose to be an easy questions: https://leetcode.com/problems/merge-sorted-array/description/

But I personally found it more confusing than not. I think it makes more sense to continue learning about the different strategies on tackling this kind of issue. 

On the other hand [[00-complete-dsa-path#Days 1-4 Arrays & Strings]] was rather straight forward with the other problems. They were ones that I've covered before but now I'm a lot better incorporated in knowing how they work.

---
## Tue, Dec 30

Today I created quite a few things after yesterday's head bashing with trying to answer [maximum-distinct](https://www.hellointerview.com/learn/code/sliding-window/maximum-sum-of-distinct-subarrays-with-length-k)  questions. It was overall very frustrating but after getting the overall mental model then ai think it made more sense. 

I created [[Drawing 2025-12-30 11.53.40.excalidraw]] which allowed me to understand the overall mental model better.

--- 