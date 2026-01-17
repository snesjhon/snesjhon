# Graph Traversal: Breadth-First Search (BFS)

## What is BFS?

Breadth-First Search is a graph traversal algorithm that explores all neighbors at the current depth before moving to nodes at the next depth level.

Think of it like ripples in a pond - you explore outward in expanding circles.

## The Core Idea

### Exploration Strategy

```mermaid
graph TB
    Start[Start at source node] --> Level1["Explore ALL neighbors<br/>(Level 1)"]
    Level1 --> Level2["Explore ALL their neighbors<br/>(Level 2)"]
    Level2 --> Level3["Explore ALL their neighbors<br/>(Level 3)"]
    Level3 --> Continue["Continue until<br/>all nodes visited"]
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

### BFS Traversal by Level

```mermaid
graph TB
    subgraph "Level 0"
        A((A))
    end

    subgraph "Level 1"
        B((B))
        C((C))
    end

    subgraph "Level 2"
        D((D))
        E((E))
        F((F))
    end

    A --> B
    A --> C
    B --> D
    B --> E
    C --> F
```

**Order visited**: A → B → C → D → E → F

Notice: We visited ALL nodes at level 1 (B, C) before ANY nodes at level 2 (D, E, F)!

## BFS vs DFS Comparison

### Same Graph, Different Orders

```mermaid
graph TB
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))

    DFS["DFS order:<br/>A → B → D → C<br/>(Deep first)"]
    BFS["BFS order:<br/>A → B → C → D<br/>(Wide first)"]

    style DFS fill:#ffe6e6
    style BFS fill:#e6f3ff
```

### Visual Difference

**DFS** (Stack/Recursion):
```mermaid
graph LR
    Path["A → B → D<br/>(go deep)"]
    Then["Then backtrack<br/>to explore C"]
```

**BFS** (Queue):
```mermaid
graph LR
    Layer1["A → B and C<br/>(explore layer)"]
    Layer2["Then → D<br/>(next layer)"]
```

## The Queue Data Structure

BFS uses a **queue** (First-In-First-Out).

### Queue Visualization

```mermaid
graph LR
    subgraph "Queue Operations"
        Front["Front"] --> Item1["Item 1"] --> Item2["Item 2"] --> Item3["Item 3"] --> Back["Back"]
    end

    Dequeue["Dequeue<br/>(remove from front)"]
    Enqueue["Enqueue<br/>(add to back)"]

    Item1 -.-> Dequeue
    Back -.-> Enqueue
```

**FIFO**: First node added is first node processed.

### Why Queue?

```mermaid
graph TB
    A["Process A"] --> AddBC["Add B and C to queue"]
    AddBC --> Q1["Queue: [B, C]"]
    Q1 --> ProcessB["Process B next<br/>(was added first)"]
    ProcessB --> AddDE["Add D and E"]
    AddDE --> Q2["Queue: [C, D, E]"]
    Q2 --> ProcessC["Process C next"]
```

Queue ensures we process in level order!

## BFS Step-by-Step Example

### Graph Setup

```mermaid
graph LR
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D
```

### Execution Trace

```mermaid
graph TB
    S1["Start: Queue=[A], Visited={}"] --> S2["Dequeue A, Visit A<br/>Queue=[B,C], Visited={A}"]
    S2 --> S3["Dequeue B, Visit B<br/>Add D<br/>Queue=[C,D], Visited={A,B}"]
    S3 --> S4["Dequeue C, Visit C<br/>D already visited, skip<br/>Queue=[D], Visited={A,B,C}"]
    S4 --> S5["Dequeue D, Visit D<br/>Queue=[], Visited={A,B,C,D}"]
    S5 --> S6["Queue empty, Done!"]
```

**Order**: A → B → C → D

**Key Observation**: D was enqueued when processing B. When C tries to enqueue D, it's already visited!

## BFS Pseudocode Structure

### High-Level Process

```mermaid
graph TB
    Start["BFS(start)"] --> Init["Queue = [start]<br/>Visited = {start}"]
    Init --> Loop{Queue<br/>empty?}
    Loop -->|No| Dequeue["Dequeue node"]
    Dequeue --> Process["Process node"]
    Process --> Neighbors["For each neighbor"]
    Neighbors --> Check{Visited?}
    Check -->|No| Add["Add to queue<br/>Mark visited"]
    Check -->|Yes| Skip["Skip"]
    Add --> Neighbors
    Skip --> Neighbors
    Neighbors --> Loop
    Loop -->|Yes| Done["Done!"]
```

## The Three Key Components

### 1. Queue for Processing Order

```mermaid
graph LR
    subgraph "Queue Evolution"
        Q1["[A]"] --> Q2["[B, C]"]
        Q2 --> Q3["[C, D]"]
        Q3 --> Q4["[D]"]
        Q4 --> Q5["[]"]
    end
```

Maintains level-by-level order.

### 2. Visited Set

```mermaid
graph LR
    subgraph "Visited Set Growth"
        V1["{A}"] --> V2["{A, B}"]
        V2 --> V3["{A, B, C}"]
        V3 --> V4["{A, B, C, D}"]
    end
```

Prevents processing nodes twice.

### 3. Level Tracking (Optional)

```mermaid
graph TB
    A["Level 0: A"] --> B["Level 1: B, C"]
    B --> D["Level 2: D"]
```

Track distance from start if needed.

## BFS Applications

### 1. Shortest Path in Unweighted Graph

BFS finds the shortest path by number of edges!

```mermaid
graph LR
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D

    Path1["Path A→B→D: 2 edges"]
    Path2["Path A→C→D: 2 edges"]
    Direct["BFS finds shortest first!"]
```

**Why?** BFS explores by distance, so the first time it reaches a node, that's the shortest path!

### 2. Finding Connected Components

```mermaid
graph TB
    subgraph "Component 1"
        A((A)) --- B((B))
    end

    subgraph "Component 2"
        C((C)) --- D((D))
    end
```

BFS from each unvisited node finds each component.

### 3. Level-Order Tree Traversal

```mermaid
graph TB
    R((Root)) --> L((L))
    R --> RR((R))
    L --> LL((LL))
    L --> LR((LR))

    Order["Level 0: Root<br/>Level 1: L, R<br/>Level 2: LL, LR"]
```

### 4. Topological Sort (Kahn's Algorithm)

Alternative to DFS for topological ordering!

```mermaid
graph LR
    A((A)) --> B((B))
    B --> C((C))

    Kahn["Process nodes with<br/>no incoming edges<br/>(BFS-like approach)"]
```

**Connection to Topological Sort**: Kahn's algorithm is BFS-based!

## BFS Time Complexity

Same as DFS:
- Visit each node once: O(V)
- Check each edge once: O(E)
- Total: **O(V + E)**

```mermaid
graph LR
    Nodes["Visit all nodes:<br/>O(V)"]
    Edges["Process all edges:<br/>O(E)"]
    Total["Total: O(V + E)"]

    Nodes --> Total
    Edges --> Total
```

## BFS Space Complexity

### Space Used

1. **Queue**: O(V) worst case
2. **Visited set**: O(V)
3. **Adjacency list**: O(V + E) (if we own it)

```mermaid
graph TB
    subgraph "Worst Case: Wide Tree"
        Root((Root)) --> C1((1))
        Root --> C2((2))
        Root --> C3((3))
        Root --> Dots[...]
        Root --> C100((100))
    end

    Queue["Queue can hold all children:<br/>O(V) space"]
```

Total: **O(V)**

## BFS vs DFS: When to Use Which?

| Use BFS When... | Use DFS When... |
|----------------|-----------------|
| Finding shortest path | Exploring all paths |
| Level-order processing | Topological sort |
| Closest neighbors first | Detecting cycles |
| Graph is very deep | Graph is very wide |
| Need distance information | Need path information |

### Visualization of Choice

```mermaid
graph TB
    Problem{What do you need?}

    Problem -->|Shortest path| BFS1[BFS]
    Problem -->|Topological order| DFS1[DFS usually]
    Problem -->|Level order| BFS2[BFS]
    Problem -->|Path exists| Either[Either works]
    Problem -->|Detect cycle| DFS2[DFS easier]

    style BFS1 fill:#e6f3ff
    style BFS2 fill:#e6f3ff
    style DFS1 fill:#ffe6e6
    style DFS2 fill:#ffe6e6
```

## Tracking Distance/Level

Often useful to know how far each node is from the start.

### Level Tracking

```mermaid
graph TB
    Start["Level = 0<br/>Queue = [(A, 0)]"] --> P1["Process (A, 0)<br/>Add neighbors at level 1"]
    P1 --> Q1["Queue = [(B, 1), (C, 1)]"]
    Q1 --> P2["Process (B, 1)<br/>Add neighbors at level 2"]
    P2 --> Q2["Queue = [(C, 1), (D, 2)]"]
```

Store level with each node in queue.

### Distance Map

```mermaid
graph LR
    subgraph "Distance from A"
        DA["A: 0"]
        DB["B: 1"]
        DC["C: 1"]
        DD["D: 2"]
    end
```

Map each node to its distance from start.

## BFS for Shortest Path

### Example Graph

```mermaid
graph LR
    A((A)) --> B((B))
    A --> D((D))
    B --> C((C))
    D --> C

    Goal["Find shortest path<br/>from A to C"]
```

### BFS Finds It

```mermaid
graph TB
    S1["Visit A (distance 0)"] --> S2["Visit B, D (distance 1)"]
    S2 --> S3["Visit C (distance 2)<br/>Found C!<br/>Shortest path: A→B→C"]
```

**Guarantee**: First time BFS reaches a node is via the shortest path!

## Kahn's Algorithm (BFS for Topological Sort)

An alternative to DFS for topological sorting.

### Core Idea

```mermaid
graph TB
    Start["Calculate in-degree<br/>for each node"] --> Find["Find nodes with<br/>in-degree 0"]
    Find --> Process["Process those nodes<br/>(add to result)"]
    Process --> Reduce["Reduce in-degree<br/>of neighbors"]
    Reduce --> More{More nodes<br/>with in-degree 0?}
    More -->|Yes| Process
    More -->|No| Check{All nodes<br/>processed?}
    Check -->|Yes| Success["Valid topological order!"]
    Check -->|No| Cycle["Cycle detected!"]

    style Success fill:#90EE90
    style Cycle fill:#ff6b6b
```

### Example

```mermaid
graph LR
    A((A)) --> C((C))
    B((B)) --> C
    C --> D((D))
```

**In-degrees**: A=0, B=0, C=2, D=1

**Steps**:
1. Process A and B (in-degree 0) → reduce C's in-degree to 0
2. Process C → reduce D's in-degree to 0
3. Process D
4. Result: [A, B, C, D] or [B, A, C, D]

**Connection to Topological Sort**: This is the BFS-based approach mentioned in the solution guide!

## Common BFS Patterns

### Pattern 1: Simple Level-Order Traversal

```mermaid
graph TB
    Init["Queue = [start]<br/>Visited = {start}"] --> Loop["While queue not empty"]
    Loop --> Process["Dequeue and process"]
    Process --> Add["Add unvisited neighbors"]
    Add --> Loop
```

### Pattern 2: With Distance Tracking

```mermaid
graph TB
    Init["Queue = [(start, 0)]<br/>Visited = {start}"] --> Loop["While queue not empty"]
    Loop --> Process["Dequeue (node, dist)"]
    Process --> Add["Add neighbors at dist+1"]
    Add --> Loop
```

### Pattern 3: Multi-Source BFS

```mermaid
graph TB
    Init["Queue = [source1, source2, ...]<br/>Visited = {source1, source2, ...}"] --> Loop["Process all sources<br/>simultaneously"]
```

Used for problems like "distance to nearest X".

## BFS Implementation Notes

### Using Array as Queue

```mermaid
graph LR
    Arr["Array: [A, B, C]"] --> Shift["Shift first: A<br/>O(n) operation 😱"]
    Push["Push: O(1)"]

    style Shift fill:#ffeb99
```

**Problem**: Shifting array is slow!

### Using Deque/Circular Buffer

```mermaid
graph LR
    Front["Front pointer"] --> Item1["A"]
    Item1 --> Item2["B"]
    Item2 --> Item3["C"]
    Back["Back pointer"]

    Dequeue["Move front pointer<br/>O(1)"]
    Enqueue["Add at back<br/>O(1)"]
```

**Better**: Constant time operations.

### Using Index Approach

```mermaid
graph TB
    Arr["Array: [A, B, C, D]"] --> Idx["Index = 0"]
    Process["Process arr[index]<br/>Add new items to end<br/>Increment index"]
```

Simpler and works well in practice!

## BFS on Different Graph Types

### BFS on Tree

```mermaid
graph TB
    Root((Root)) --> L((L))
    Root --> R((R))

    Note["Level-order:<br/>Root, L, R"]
```

Natural for trees - visits level by level.

### BFS on DAG

```mermaid
graph TB
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D

    Note["A, B, C, D or A, C, B, D<br/>(depends on order added)"]
```

Visited set prevents multiple processing.

### BFS on Cyclic Graph

```mermaid
graph LR
    A((A)) --> B((B))
    B --> C((C))
    C --> A

    Note["Visited set<br/>prevents infinite loop"]
```

Critical: Mark visited when ENQUEUING, not when dequeuing!

## Common Mistakes

### Mistake 1: Marking Visited When Dequeuing

```mermaid
graph LR
    Wrong["Dequeue → Check visited → Process ❌"]
    Right["Check visited → Enqueue → Process ✅"]
```

**Why wrong?** Node might be enqueued multiple times before being processed!

### Mistake 2: Using Stack Instead of Queue

```mermaid
graph TB
    Stack["Using Stack<br/>(LIFO)"] --> Actually["Actually doing DFS,<br/>not BFS!"]

    style Actually fill:#ff6b6b
```

### Mistake 3: Not Tracking Visited

```mermaid
graph LR
    A((A)) --> B((B))
    B --> A

    Problem["Without visited:<br/>A and B enqueued infinitely!"]

    style Problem fill:#ff6b6b
```

## BFS Memory Concerns

### Wide Graph (Large Queue)

```mermaid
graph TB
    Root((Root))

    Root --> N1((1))
    Root --> N2((2))
    Root --> N3((3))
    Root --> Dots[...]
    Root --> N1000((1000))

    Queue["Queue size: 1000<br/>High memory!"]

    style Queue fill:#ffeb99
```

### Deep Graph (Small Queue)

```mermaid
graph LR
    N1((1)) --> N2((2))
    N2 --> N3((3))
    N3 --> Dots[...]
    Dots --> N1000((1000))

    Queue["Queue size: 1<br/>Low memory!"]

    style Queue fill:#90EE90
```

**BFS uses more memory on wide graphs, DFS on deep graphs.**

## Bidirectional BFS

Advanced technique for shortest path.

### Concept

```mermaid
graph LR
    Start((Start)) --> M1[...]
    M1 --> Meet((Meet))
    End((End)) --> M2[...]
    M2 --> Meet

    Idea["BFS from both ends<br/>until they meet"]
```

Faster for large graphs - explores less total nodes.

## Key Takeaways

1. **BFS** explores level by level using a queue
2. Uses **queue** (FIFO) for processing order
3. Needs **visited set** to avoid reprocessing
4. **Finds shortest path** in unweighted graphs
5. Time complexity: **O(V + E)**
6. Space complexity: **O(V)**
7. Mark visited when **enqueuing**, not dequeuing
8. Alternative to DFS for some problems

## Connection to Topological Sort

BFS is used in **Kahn's algorithm** for topological sort:
- Calculate in-degree for each node
- Process nodes with in-degree 0 (queue-based)
- Reduce in-degree of neighbors
- Repeat until done

While the main topological sort solution uses DFS, understanding BFS helps you understand alternative approaches and why different algorithms work!

## Next Steps

Now that you understand both DFS and BFS, you're ready to learn about dependencies and ordering specifically. Move on to **06-dependencies-and-ordering.md** to see how these traversal techniques apply to dependency resolution and topological sorting!
