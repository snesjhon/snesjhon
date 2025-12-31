# Topological Sort Solution

## The Complete Solution

```typescript
interface Task {
  id: string;
  deps: string[];
}

function getTasksToRun(allTasks: Task[], tasksToRun: string[]): string[] {
  // Build a map for quick task lookup
  const taskMap = new Map<string, Task>();
  for (const task of allTasks) {
    taskMap.set(task.id, task);
  }

  // Result array and visited set
  const result: string[] = [];
  const visited = new Set<string>();
  const inProgress = new Set<string>(); // For cycle detection

  // DFS function to visit a task and its dependencies
  function visit(taskId: string): void {
    // If already processed, skip
    if (visited.has(taskId)) {
      return;
    }

    // Cycle detection (optional but good practice)
    if (inProgress.has(taskId)) {
      throw new Error(`Circular dependency detected: ${taskId}`);
    }

    const task = taskMap.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Mark as in progress
    inProgress.add(taskId);

    // Visit all dependencies first (recursively)
    for (const depId of task.deps) {
      visit(depId);
    }

    // Mark as visited and remove from in-progress
    inProgress.delete(taskId);
    visited.add(taskId);

    // Add to result after all dependencies are processed
    result.push(taskId);
  }

  // Visit each requested task
  for (const taskId of tasksToRun) {
    visit(taskId);
  }

  return result;
}
```

## How This Solution Works

### Phase 1: Setup (Lines 1-8)

**Reference: Study Guide - "Think about what data structures you'll need"**

```typescript
const taskMap = new Map<string, Task>();
for (const task of allTasks) {
  taskMap.set(task.id, task);
}
```

We create a `Map` for O(1) task lookup. This is crucial for performance on large graphs - instead of searching through an array every time we need a task, we can instantly find it by ID.

**Why this matters**: With N tasks, looking up tasks will happen many times. Array search would be O(N) each time; Map lookup is O(1).

### Phase 2: State Tracking (Lines 10-12)

**Reference: Study Guide - "Insight 4: Tracking State"**

```typescript
const result: string[] = [];
const visited = new Set<string>();
const inProgress = new Set<string>();
```

Three critical data structures:

1. **`result`**: The final ordered list of tasks
2. **`visited`**: Tracks which tasks we've completely processed (prevents duplicates)
3. **`inProgress`**: Tracks tasks currently being processed (detects circular dependencies)

This implements the state diagram from the study guide:
- Not in any set → NotVisited
- In `inProgress` → Being Discovered
- In `visited` → Processed

### Phase 3: The DFS Visit Function (Lines 15-42)

**Reference: Study Guide - "Approach B: Recursion-Based"**

This is the heart of the solution - a Depth-First Search (DFS) that implements topological sort.

#### Step 3a: Early Return Check (Lines 17-19)

```typescript
if (visited.has(taskId)) {
  return;
}
```

**Reference: Study Guide - "Insight 5: Graph Properties" and "Pitfall 1: Duplicate Tasks"**

If we've already processed this task, don't process it again. This handles the **Diamond Problem** from the study guide:

```mermaid
graph TB
    A[A] --> B[B]
    A --> C[C]
    B --> D[D]
    C --> D
```

When processing D, we'll visit A through both B and C paths, but only process it once.

#### Step 3b: Cycle Detection (Lines 21-24)

```typescript
if (inProgress.has(taskId)) {
  throw new Error(`Circular dependency detected: ${taskId}`);
}
```

**Reference: Study Guide - "Pitfall 4: Circular Dependencies"**

If we encounter a task that's currently being processed, we've found a cycle. While not required for the test cases, this prevents infinite recursion in malformed graphs.

#### Step 3c: Process Dependencies First (Lines 30-34)

```typescript
inProgress.add(taskId);

for (const depId of task.deps) {
  visit(depId);
}
```

**Reference: Study Guide - "Insight 2: Think Backwards" and "Pitfall 3: Missing Dependencies"**

This is the key to topological ordering:
1. Mark task as in-progress
2. Recursively visit ALL dependencies first
3. This ensures dependencies appear in `result` before the current task

This handles **transitive dependencies** automatically - when we visit a dependency, it will visit its dependencies, and so on.

#### Step 3d: Add to Result (Lines 36-40)

```typescript
inProgress.delete(taskId);
visited.add(taskId);
result.push(taskId);
```

**Reference: Study Guide - "Insight 3: Think Forwards"**

Only after ALL dependencies are processed do we:
1. Remove from in-progress set
2. Mark as visited
3. Add to result array

This guarantees that this task appears after all its dependencies in the result.

### Phase 4: Process Requested Tasks (Lines 44-47)

```typescript
for (const taskId of tasksToRun) {
  visit(taskId);
}
```

**Reference: Study Guide - "Insight 4: Multiple Entry Points"**

We visit each requested task. The `visited` set ensures that shared dependencies (like A in the Diamond Problem) are only added once.

## Why This Solution is Correct

### Correctness Proof

**Claim**: Every task appears after all its dependencies in the result.

**Proof**: By induction on the recursion depth:

1. **Base case**: Tasks with no dependencies are added directly (no dependencies to violate)

2. **Inductive step**: For a task T with dependencies D₁, D₂, ..., Dₙ:
   - We recursively visit D₁, D₂, ..., Dₙ first (lines 32-34)
   - By inductive hypothesis, each Dᵢ and all its dependencies are already in result
   - Only then do we add T (line 40)
   - Therefore, T appears after all its dependencies

3. **No duplicates**: The `visited` set ensures each task is added exactly once

### Example Walkthrough

**Reference: Study Guide - "Visualization of Complete Example"**

Let's trace through the diamond example:

```
Tasks:
A: deps=[]
B: deps=[A]
C: deps=[A]
D: deps=[B, C]

Request: [D]
```

**Execution trace:**

```
1. visit(D)
   - D not visited, not in progress
   - Add D to inProgress: {D}
   - Process deps: [B, C]

2.   visit(B)  [from D's deps]
     - B not visited, not in progress
     - Add B to inProgress: {D, B}
     - Process deps: [A]

3.     visit(A)  [from B's deps]
       - A not visited, not in progress
       - Add A to inProgress: {D, B, A}
       - Process deps: [] (empty)
       - Remove A from inProgress: {D, B}
       - Mark A visited: {A}
       - Add A to result: [A]

4.   Back to visit(B)
     - Remove B from inProgress: {D}
     - Mark B visited: {A, B}
     - Add B to result: [A, B]

5. Back to visit(D), continue with next dep

6.   visit(C)  [from D's deps]
     - C not visited, not in progress
     - Add C to inProgress: {D, C}
     - Process deps: [A]

7.     visit(A)  [from C's deps]
       - A already visited! Return immediately (line 18)

8.   Back to visit(C)
     - Remove C from inProgress: {D}
     - Mark C visited: {A, B, C}
     - Add C to result: [A, B, C]

9. Back to visit(D)
   - All deps processed
   - Remove D from inProgress: {}
   - Mark D visited: {A, B, C, D}
   - Add D to result: [A, B, C, D]

Final result: [A, B, C, D] ✓
```

**Key observation**: A was visited twice (steps 3 and 7) but only added to result once!

## Performance Analysis

**Reference: Study Guide - "Performance Considerations"**

### Time Complexity: O(V + E)

Where V = number of tasks, E = total number of dependencies

- Building taskMap: O(V)
- Each task is visited at most once: O(V)
- Each dependency edge is traversed once: O(E)
- Total: O(V + E)

This is optimal - you must at least look at every task and dependency once.

### Space Complexity: O(V)

- taskMap: O(V)
- visited set: O(V)
- inProgress set: O(V) in worst case
- result array: O(V)
- Recursion stack: O(V) in worst case (linear chain)
- Total: O(V)

### Why It's Performant on Large Graphs

1. **Map for lookups**: O(1) instead of O(N) array search
2. **Set for visited tracking**: O(1) membership checks
3. **Single pass**: Each task visited exactly once
4. **No repeated work**: Dependencies never reprocessed

For a graph with 10,000 tasks and 50,000 dependencies:
- Our solution: ~60,000 operations
- Naive approach (repeated searches): Could be millions

## Alternative Approach: Kahn's Algorithm (BFS-based)

**Reference: Study Guide - "Approach A: Removal-Based"**

While our solution uses DFS, here's how the BFS approach works:

```typescript
function getTasksToRunKahn(allTasks: Task[], tasksToRun: string[]): string[] {
  const taskMap = new Map(allTasks.map(t => [t.id, t]));
  const needed = new Set<string>();

  // Find all needed tasks
  function markNeeded(id: string) {
    if (needed.has(id)) return;
    needed.add(id);
    const task = taskMap.get(id);
    if (task) {
      task.deps.forEach(markNeeded);
    }
  }
  tasksToRun.forEach(markNeeded);

  // Calculate in-degrees for needed tasks
  const inDegree = new Map<string, number>();
  for (const id of needed) {
    inDegree.set(id, 0);
  }
  for (const id of needed) {
    const task = taskMap.get(id)!;
    for (const dep of task.deps) {
      if (needed.has(dep)) {
        inDegree.set(id, inDegree.get(id)! + 1);
      }
    }
  }

  // Process tasks with in-degree 0
  const result: string[] = [];
  const queue: string[] = [];

  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    // Reduce in-degree for tasks that depend on current
    for (const id of needed) {
      const task = taskMap.get(id)!;
      if (task.deps.includes(current)) {
        const newDegree = inDegree.get(id)! - 1;
        inDegree.set(id, newDegree);
        if (newDegree === 0) {
          queue.push(id);
        }
      }
    }
  }

  return result;
}
```

### Comparison: DFS vs BFS Approach

| Aspect | DFS (Our Solution) | BFS (Kahn's) |
|--------|-------------------|--------------|
| **Complexity** | O(V + E) | O(V + E) |
| **Space** | O(V) + recursion stack | O(V) + queue |
| **Code clarity** | More intuitive recursion | More setup code |
| **Cycle detection** | Natural with inProgress set | Check if all tasks processed |
| **Order stability** | Depends on dep order | Depends on queue order |

Both are correct and efficient. DFS is often preferred for its simplicity.

## Key Takeaways

1. **Topological sort** is about ordering tasks to respect dependencies
2. **DFS approach** processes dependencies before the task itself
3. **State tracking** (visited/inProgress) prevents duplicates and cycles
4. **Recursion** naturally handles transitive dependencies
5. **Map/Set data structures** ensure O(1) lookups for performance
6. **Time complexity O(V + E)** is optimal for this problem

## Connection to Study Guide Concepts

- ✅ **Two-Phase Approach**: Discovery happens in DFS, ordering happens naturally
- ✅ **Think Backwards**: DFS visits dependencies before the task
- ✅ **Think Forwards**: Result array builds from dependencies to dependents
- ✅ **Tracking State**: visited and inProgress sets track task states
- ✅ **Diamond Problem**: visited set prevents duplicate processing
- ✅ **Performance**: Map/Set provide O(1) operations for large graphs

This solution elegantly combines all the mental models from the study guide into a clean, performant implementation.