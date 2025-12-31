# Graph Traversal: Depth-First Search (DFS)

## What is DFS?

Depth-First Search is a graph traversal algorithm that explores as far as possible along each branch before backtracking.

Think of it like exploring a maze: you keep going forward until you hit a dead end, then you backtrack and try a different path.

## The Core Idea

### Exploration Strategy

```mermaid
graph TB
    Start[Start at node A] --> Go1["Go as deep<br/>as possible"]
    Go1 --> Hit1["Hit dead end or<br/>visited node"]
    Hit1 --> Back1["Backtrack"]
    Back1 --> Go2["Try next<br/>unexplored path"]
    Go2 --> Hit2["Hit dead end"]
    Hit2 --> Back2["Backtrack"]
    Back2 --> Done{All paths<br/>explored?}
    Done -->|No| Go2
    Done -->|Yes| Complete[Complete!]
```

## Visual Example

### The Graph

```mermaid
graph TB
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    B --> E((E))
    C --> F((F))
```

### DFS Traversal Order

```mermaid
graph TB
    Step1["1. Start at A<br/>Mark A visited"] --> Step2["2. Go to B<br/>(first neighbor)<br/>Mark B visited"]
    Step2 --> Step3["3. Go to D<br/>(first neighbor of B)<br/>Mark D visited"]
    Step3 --> Step4["4. D has no neighbors<br/>Backtrack to B"]
    Step4 --> Step5["5. Go to E<br/>(next neighbor of B)<br/>Mark E visited"]
    Step5 --> Step6["6. E has no neighbors<br/>Backtrack to B"]
    Step6 --> Step7["7. B fully explored<br/>Backtrack to A"]
    Step7 --> Step8["8. Go to C<br/>(next neighbor of A)<br/>Mark C visited"]
    Step8 --> Step9["9. Go to F<br/>(neighbor of C)<br/>Mark F visited"]
    Step9 --> Done["10. All nodes visited!"]
```

**Order visited**: A → B → D → E → C → F

Notice: We went deep (A → B → D) before going wide!

## DFS Pseudocode Structure

### High-Level Process

```mermaid
graph TB
    Start["DFS(node)"] --> Check{Already<br/>visited?}
    Check -->|Yes| Return1["Return<br/>(Base case)"]
    Check -->|No| Mark["Mark as visited"]
    Mark --> Process["Process node<br/>(print, add to list, etc.)"]
    Process --> Loop["For each neighbor"]
    Loop --> Recurse["DFS(neighbor)"]
    Recurse --> Loop
    Loop --> Return2["Return"]
```

## The Three Key Components

### 1. Visited Tracking

```mermaid
graph LR
    subgraph "Visited Set"
        direction LR
        V1["Initially: {}"]
        V2["After A: {A}"]
        V3["After B: {A, B}"]
        V4["After D: {A, B, D}"]
    end

    V1 --> V2 --> V3 --> V4
```

**Why?** Without tracking, we'd revisit nodes infinitely!

### 2. Recursion

```mermaid
graph TB
    DFSA["DFS(A)"] --> DFSB["DFS(B)"]
    DFSB --> DFSD["DFS(D)"]
    DFSD --> RetD["D done, return"]
    RetD --> DFSE["DFS(E)"]
    DFSE --> RetE["E done, return"]
    RetE --> RetB["B done, return"]
    RetB --> DFSC["DFS(C)"]
```

Each recursive call explores one branch completely.

### 3. Backtracking

```mermaid
graph TB
    Deep["Went deep:<br/>A → B → D"] --> Dead["Dead end at D"]
    Dead --> Back["Backtrack to B"]
    Back --> Next["Try next path:<br/>B → E"]
```

**Backtracking** happens automatically when a recursive call returns!

## Complete Example Trace

### Graph Setup

```mermaid
graph LR
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D
```

Adjacency List:
```
A → [B, C]
B → [D]
C → [D]
D → []
```

### Execution Trace

```mermaid
graph TB
    subgraph "Call Stack Evolution"
        direction TB

        T1["DFS(A)<br/>Visited: {A}"] --> T2["DFS(B)<br/>Visited: {A,B}"]
        T2 --> T3["DFS(D)<br/>Visited: {A,B,D}"]
        T3 --> T4["Return from D<br/>D has no neighbors"]
        T4 --> T5["Return from B<br/>B's neighbors done"]
        T5 --> T6["DFS(C)<br/>Visited: {A,B,D,C}"]
        T6 --> T7["Try DFS(D)<br/>Already visited, skip"]
        T7 --> T8["Return from C<br/>C's neighbors done"]
        T8 --> T9["Return from A<br/>Complete!"]
    end
```

**Key Observation**: D is reached through B first. When C tries to visit D, it's already in visited set!

**Connection to Topological Sort**: This is exactly how we handle the diamond problem - shared dependencies are only processed once!

## DFS with Different Processing Orders

### Pre-order (Process Before Recursing)

```mermaid
graph TB
    Visit["Visit node"] --> Process["PROCESS node first"]
    Process --> Recurse["Then recurse on neighbors"]
```

Order for our example: A, B, D, C

### Post-order (Process After Recursing)

```mermaid
graph TB
    Visit["Visit node"] --> Recurse["Recurse on neighbors first"]
    Recurse --> Process["THEN process node"]
```

Order for our example: D, B, C, A

**Connection to Topological Sort**: We use post-order! Process dependencies first, then process the task.

## Call Stack Visualization

### Graph

```mermaid
graph LR
    A((A)) --> B((B))
    B --> C((C))
```

### Stack Evolution

```mermaid
graph TB
    subgraph "Phase 1: Going Deep"
        S1["Stack: [A]<br/>Processing A"]
        S2["Stack: [A, B]<br/>Processing B"]
        S3["Stack: [A, B, C]<br/>Processing C"]
    end

    subgraph "Phase 2: Unwinding"
        S4["Stack: [A, B]<br/>C complete"]
        S5["Stack: [A]<br/>B complete"]
        S6["Stack: []<br/>A complete"]
    end

    S1 --> S2 --> S3 --> S4 --> S5 --> S6
```

Each stack frame remembers:
- Current node
- Which neighbors have been explored
- Where to return

## DFS for Different Graph Types

### DFS on a Tree

```mermaid
graph TB
    Root((Root)) --> L((Left))
    Root --> R((Right))
    L --> LL((LL))
    L --> LR((LR))

    Note["DFS order:<br/>Root, Left, LL, LR, Right"]
```

Simpler - no cycles, no visited set needed (can still use for safety).

### DFS on a DAG

```mermaid
graph TB
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D

    Note["DFS order:<br/>A, B, D, C<br/>(D visited before C tries)"]
```

Need visited set - multiple paths to same node.

### DFS on a Cyclic Graph

```mermaid
graph LR
    A((A)) --> B((B))
    B --> C((C))
    C --> A

    Note["Without visited:<br/>Infinite loop!<br/>With visited:<br/>Detects cycle"]
```

**Critical**: Visited set prevents infinite loops!

## Detecting Cycles with DFS

Use two sets: `visiting` and `visited`.

### States of a Node

```mermaid
graph LR
    NotVisited["Not Visited<br/>(white)"] --> Visiting["Currently Visiting<br/>(gray)"]
    Visiting --> Visited["Fully Visited<br/>(black)"]
```

### Cycle Detection

```mermaid
graph TB
    Start["Visit node"] --> InVisiting{In 'visiting'<br/>set?}
    InVisiting -->|Yes| Cycle["CYCLE DETECTED!"]
    InVisiting -->|No| Add["Add to 'visiting'"]
    Add --> Recurse["Recurse on neighbors"]
    Recurse --> Move["Move to 'visited'<br/>Remove from 'visiting'"]

    style Cycle fill:#ff6b6b
```

**How it works**:
- If we encounter a node in `visiting`, we've found a path back to it (cycle!)
- Nodes in `visited` are fully explored (safe)

**Connection to Topological Sort**: This detects circular dependencies!

## DFS Applications

### 1. Path Finding

Find if path exists from A to B.

```mermaid
graph LR
    Start["DFS from A"] --> Search["Explore neighbors"]
    Search --> Found{Reached B?}
    Found -->|Yes| Success["Path exists!"]
    Found -->|No| Continue["Continue DFS"]
```

### 2. Connected Components

Find all separate groups in graph.

```mermaid
graph TB
    subgraph "Component 1"
        A((A)) --- B((B))
    end

    subgraph "Component 2"
        C((C)) --- D((D))
    end

    Note["DFS from A: finds {A, B}<br/>DFS from C: finds {C, D}"]
```

### 3. Topological Sort

Order tasks respecting dependencies (our problem!).

```mermaid
graph LR
    A((A)) --> B((B))
    B --> C((C))

    Note["DFS Post-order:<br/>C, B, A<br/>(Reverse for topo order)"]
```

### 4. Maze Solving

Explore all paths until exit found.

```mermaid
graph TB
    Start["Start"] --> Path1["Try path 1"]
    Path1 --> Dead1["Dead end"]
    Dead1 --> Back["Backtrack"]
    Back --> Path2["Try path 2"]
    Path2 --> Exit["Found exit!"]
```

## DFS Time Complexity

### Analysis

- Visit each node once: O(V)
- Explore each edge once: O(E)
- Total: **O(V + E)**

```mermaid
graph LR
    subgraph "Work Breakdown"
        Nodes["Visit V nodes:<br/>O(V)"]
        Edges["Check E edges:<br/>O(E)"]
    end

    Total["Total: O(V + E)"]

    Nodes --> Total
    Edges --> Total
```

**Why optimal?** Can't do better - must look at each node and edge at least once!

## DFS Space Complexity

### Space Used

1. **Visited set**: O(V)
2. **Call stack**: O(V) in worst case (linear chain)
3. **Adjacency list**: O(V + E) (not counted if given)

```mermaid
graph TB
    subgraph "Worst Case: Linear Chain"
        A((A)) --> B((B))
        B --> C((C))
        C --> D((D))
        D --> E((E))
    end

    Stack["Call stack depth: 5<br/>O(V) space"]
```

Total: **O(V)**

## Iterative DFS (Using Explicit Stack)

Instead of recursion, use a stack data structure.

### Concept

```mermaid
graph TB
    Init["Stack: [A]"] --> Pop1["Pop A<br/>Push neighbors [B, C]"]
    Pop1 --> Stack1["Stack: [B, C]"]
    Stack1 --> Pop2["Pop C<br/>Push neighbors [D]"]
    Pop2 --> Stack2["Stack: [B, D]"]
    Stack2 --> Continue["Continue..."]
```

### Comparison

| Aspect | Recursive DFS | Iterative DFS |
|--------|--------------|---------------|
| **Code** | Cleaner, more intuitive | More verbose |
| **Stack** | Implicit (call stack) | Explicit (data structure) |
| **Stack overflow** | Possible | Controlled |
| **Order** | Exact | May differ slightly |

**For Topological Sort**: Recursive is cleaner and more natural.

## Common DFS Patterns

### Pattern 1: Simple Traversal

```mermaid
graph TB
    DFS["DFS(node)"] --> Mark["Mark visited"]
    Mark --> Neighbors["For each neighbor"]
    Neighbors --> Recurse["If not visited:<br/>DFS(neighbor)"]
```

### Pattern 2: With Processing

```mermaid
graph TB
    DFS["DFS(node)"] --> Mark["Mark visited"]
    Mark --> Process["Process node"]
    Process --> Neighbors["For each neighbor"]
    Neighbors --> Recurse["DFS(neighbor)"]
```

### Pattern 3: Post-order Processing

```mermaid
graph TB
    DFS["DFS(node)"] --> Mark["Mark visited"]
    Mark --> Neighbors["For each neighbor"]
    Neighbors --> Recurse["DFS(neighbor)"]
    Recurse --> Process["Process node AFTER"]
```

**Connection to Topological Sort**: We use Pattern 3 - process after exploring dependencies!

## DFS vs BFS Preview

### DFS (Depth-First)

```mermaid
graph TB
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))

    Order["Order: A, B, D, C<br/>(Go deep first)"]
```

### BFS (Breadth-First)

```mermaid
graph TB
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))

    Order["Order: A, B, C, D<br/>(Go wide first)"]
```

DFS: Explore one path completely before trying others
BFS: Explore all neighbors before going deeper

## Common Mistakes

### Mistake 1: Forgetting Visited Set

```mermaid
graph LR
    A((A)) --> B((B))
    B --> A

    Result["Without visited:<br/>Infinite loop!"]

    style Result fill:#ff6b6b
```

### Mistake 2: Checking Visited After Recursing

```mermaid
graph TB
    Wrong["DFS(node)<br/>Process node<br/>Check if visited ❌"]
    Right["DFS(node)<br/>Check if visited<br/>Process node ✅"]
```

**Why wrong?** You'll process the node before realizing it's visited!

### Mistake 3: Not Marking Before Recursing

```mermaid
graph LR
    A((A)) --> B((B))
    B --> C((C))
    C --> A

    Problem["Mark after exploring:<br/>Can cause infinite loops!"]

    style Problem fill:#ff6b6b
```

Mark as visited BEFORE recursing into neighbors!

## Visualizing DFS Path

### Tree View of Exploration

```mermaid
graph TB
    A["Explore A"] --> B["Explore B"]
    A --> C["Explore C"]
    B --> D["Explore D"]
    B --> E["Explore E"]
    C --> F["Explore F"]

    subgraph "DFS Path"
        Path["A → B → D → back → E → back → back → C → F"]
    end
```

Notice the "back" movements - that's backtracking!

## Memory Consideration

### Deep Graph

```mermaid
graph LR
    N1((1)) --> N2((2))
    N2 --> N3((3))
    N3 --> Dots[...]
    Dots --> N1000((1000))

    Stack["Call stack depth:<br/>1000 levels<br/>Might overflow!"]

    style Stack fill:#ffeb99
```

### Wide Graph

```mermaid
graph TB
    Root((Root)) --> C1((Child 1))
    Root --> C2((Child 2))
    Root --> C3((Child 3))
    Root --> Dots[...]
    Root --> C1000((Child 1000))

    Stack["Call stack depth:<br/>2 levels<br/>No problem!"]

    style Stack fill:#90EE90
```

**For Topological Sort**: Depth is the longest dependency chain, usually manageable.

## Key Takeaways

1. **DFS** explores as deep as possible before backtracking
2. Uses **recursion** (or explicit stack) to remember path
3. Needs **visited set** to avoid cycles
4. **Post-order processing** visits children before parent
5. Time complexity: **O(V + E)**
6. Space complexity: **O(V)**
7. Perfect for **topological sort, cycle detection, path finding**

## Connection to Topological Sort

Our topological sort solution IS a DFS with post-order processing:

1. Start DFS from requested tasks
2. For each task, recursively DFS into its dependencies first
3. Mark task as visited
4. Add task to result AFTER all dependencies processed (post-order!)
5. Visited set handles shared dependencies

This ensures dependencies always appear before the tasks that need them!

## Next Steps

Now you understand DFS, the other main traversal method is BFS (Breadth-First Search). While topological sort typically uses DFS, BFS is also used in an alternative algorithm (Kahn's algorithm). Move on to **05-graph-traversal-bfs.md** to complete your traversal knowledge!
