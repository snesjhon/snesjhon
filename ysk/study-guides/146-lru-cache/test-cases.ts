// =============================================================================
// LRU Cache (Problem 146)
// =============================================================================
// Goal: understand the hot-shelf eviction system by building each piece from scratch.
//
// Mental model: a doubly linked list (the "hot shelf") keeps items ordered by
// recency — most recent at front (head.next), least recent at back (tail.prev).
// A hashmap (the "card catalog") maps each key to its node for O(1) access.
// Two permanent sentinel nodes (head and tail bookends) eliminate null-pointer
// edge cases: every real node always has non-null prev and next neighbors.

class ListNode {
  key: number;
  val: number;
  prev: ListNode | null = null;
  next: ListNode | null = null;
  constructor(key = 0, val = 0) {
    this.key = key;
    this.val = val;
  }
}

// Traverse from head.next to before tail, return keys in shelf order (front→back).
function toKeys(head: ListNode): number[] {
  const result: number[] = [];
  let curr = head.next;
  while (curr !== null && curr.next !== null) {
    result.push(curr.key);
    curr = curr.next;
  }
  return result;
}

// Build a test shelf: HEAD ↔ [keys[0]] ↔ [keys[1]] ↔ ... ↔ TAIL
// keys[0] is closest to HEAD (most recent); last key is closest to TAIL (LRU).
function makeShelf(...keys: number[]): {
  head: ListNode;
  tail: ListNode;
  nodes: Map<number, ListNode>;
} {
  const head = new ListNode(0, 0);
  const tail = new ListNode(0, 0);
  head.next = tail;
  tail.prev = head;
  const nodes = new Map<number, ListNode>();
  for (const k of keys) {
    const n = new ListNode(k, k * 10);
    n.prev = tail.prev;
    n.next = tail;
    tail.prev!.next = n;
    tail.prev = n;
    nodes.set(k, n);
  }
  return { head, tail, nodes };
}

// -----------------------------------------------------------------------------
// Exercise 1
// Unlink a node from its neighbors in the doubly linked list.
// This is the "take a book off the shelf" operation.
// The removed node's two neighbors must close ranks around the gap.
//
// Steps:
//   1. Let left = node.prev, right = node.next
//   2. left.next = right
//   3. right.prev = left
//
// Example (shelf HEAD ↔ [1] ↔ [2] ↔ [3] ↔ TAIL, remove key 2):
//   After removeNode(node2): HEAD ↔ [1] ↔ [3] ↔ TAIL → toKeys returns [1, 3]
// -----------------------------------------------------------------------------
function removeNode(node: ListNode): void {
  throw new Error('not implemented');
}

test('removeNode: removes middle node', () => {
  const { head, nodes } = makeShelf(1, 2, 3);
  removeNode(nodes.get(2)!);
  return toKeys(head);
}, [1, 3]);

test('removeNode: removes first real node (most recent)', () => {
  const { head, nodes } = makeShelf(1, 2, 3);
  removeNode(nodes.get(1)!);
  return toKeys(head);
}, [2, 3]);

test('removeNode: removes last real node (LRU position)', () => {
  const { head, nodes } = makeShelf(1, 2, 3);
  removeNode(nodes.get(3)!);
  return toKeys(head);
}, [1, 2]);

test('removeNode: single-node shelf becomes empty', () => {
  const { head, nodes } = makeShelf(5);
  removeNode(nodes.get(5)!);
  return toKeys(head);
}, []);

// -----------------------------------------------------------------------------
// Exercise 2
// Insert a node immediately after the head sentinel, making it the most recent.
// This is the "place a book in the prime slot" operation.
//
// Steps:
//   1. Let first = head.next  (save the current front before rewiring)
//   2. head.next = node,  node.prev = head
//   3. node.next = first, first.prev = node
//
// Example (shelf HEAD ↔ [1] ↔ [2] ↔ TAIL, insert new node with key 9):
//   After insertAfterHead(head, node9): HEAD ↔ [9] ↔ [1] ↔ [2] ↔ TAIL
//
// Key: always save head.next BEFORE you rewire head.next — otherwise you lose
// the reference to the old front item.
// -----------------------------------------------------------------------------
function insertAfterHead(head: ListNode, node: ListNode): void {
  throw new Error('not implemented');
}

test('insertAfterHead: inserts into non-empty shelf', () => {
  const { head } = makeShelf(1, 2);
  const n = new ListNode(9, 90);
  insertAfterHead(head, n);
  return toKeys(head);
}, [9, 1, 2]);

test('insertAfterHead: inserts into empty shelf (just sentinels)', () => {
  const { head } = makeShelf();
  const n = new ListNode(5, 50);
  insertAfterHead(head, n);
  return toKeys(head);
}, [5]);

test('insertAfterHead: multiple inserts — latest is always at front', () => {
  const { head } = makeShelf();
  insertAfterHead(head, new ListNode(1, 10));
  insertAfterHead(head, new ListNode(2, 20));
  insertAfterHead(head, new ListNode(3, 30));
  return toKeys(head);
}, [3, 2, 1]);

test('insertAfterHead: removeNode then insertAfterHead moves item to front', () => {
  // This is "move to front" — the core of every get() operation.
  const { head, nodes } = makeShelf(1, 2, 3);
  const target = nodes.get(3)!;  // currently at LRU position
  removeNode(target);
  insertAfterHead(head, target);
  return toKeys(head);
}, [3, 1, 2]);

// -----------------------------------------------------------------------------
// Exercise 3
// Implement the full LRUCache class: constructor, get, and put.
//
// Constructor:
//   - Store capacity
//   - Create an empty Map called catalog
//   - Create head and tail sentinel nodes, link them: head.next = tail, tail.prev = head
//
// get(key):
//   - If key not in catalog → return -1
//   - Otherwise: removeNode(node) + insertAfterHead(head, node) → return node.val
//
// put(key, val):
//   - If key exists in catalog:
//       node.val = val
//       removeNode(node) + insertAfterHead(head, node)
//   - If key is new:
//       Create node(key, val)
//       insertAfterHead(head, node)
//       catalog.set(key, node)
//       if catalog.size > capacity:
//         victim = tail.prev!
//         removeNode(victim)
//         catalog.delete(victim.key)
// -----------------------------------------------------------------------------
class LRUCache {
  constructor(capacity: number) {
    throw new Error('not implemented');
  }

  get(key: number): number {
    throw new Error('not implemented');
  }

  put(key: number, value: number): void {
    throw new Error('not implemented');
  }
}

// --- get tests ---

test('get: missing key returns -1', () => {
  const cache = new LRUCache(2);
  return cache.get(1);
}, -1);

test('get: returns value for existing key', () => {
  const cache = new LRUCache(2);
  cache.put(1, 10);
  return cache.get(1);
}, 10);

test('get: accessing a key prevents its eviction', () => {
  // put(1), put(2), get(1) makes key 2 the LRU → put(3) should evict key 2 not key 1
  const cache = new LRUCache(2);
  cache.put(1, 10);
  cache.put(2, 20);
  cache.get(1);       // refresh key 1 — key 2 becomes LRU
  cache.put(3, 30);   // evicts key 2
  return [cache.get(1), cache.get(2), cache.get(3)];
}, [10, -1, 30]);

test('get: get after get — most recently got is safe', () => {
  const cache = new LRUCache(2);
  cache.put(1, 10);
  cache.put(2, 20);
  cache.get(2);       // key 1 becomes LRU
  cache.get(1);       // key 2 becomes LRU
  cache.put(3, 30);   // evicts key 2
  return [cache.get(1), cache.get(2), cache.get(3)];
}, [10, -1, 30]);

// --- put tests ---

test('put: updates existing key value', () => {
  const cache = new LRUCache(2);
  cache.put(1, 10);
  cache.put(1, 100);
  return cache.get(1);
}, 100);

test('put: evicts LRU when at capacity', () => {
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  cache.put(3, 3);   // evicts key 1 (LRU)
  return [cache.get(1), cache.get(2), cache.get(3)];
}, [-1, 2, 3]);

test('put: updating an existing key counts as an access', () => {
  // put(1), put(2), put(1,new) → key 2 is now LRU → put(3) evicts key 2
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  cache.put(1, 100); // update key 1 — makes key 2 the LRU
  cache.put(3, 3);   // evicts key 2
  return [cache.get(1), cache.get(2), cache.get(3)];
}, [100, -1, 3]);

test('put: capacity=1 always evicts the single previous item', () => {
  const cache = new LRUCache(1);
  cache.put(1, 1);
  cache.put(2, 2);
  return [cache.get(1), cache.get(2)];
}, [-1, 2]);

test('put: no eviction when updating at full capacity', () => {
  // Catalog size stays at 2 when we update — no eviction should happen
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  cache.put(2, 20);  // update, not insert — size stays 2
  return [cache.get(1), cache.get(2)];
}, [1, 20]);

// -----------------------------------------------------------------------------
// Integration: the classic LeetCode example
// LRUCache(2): put(1,1) put(2,2) get(1) put(3,3) get(2) put(4,4) get(1) get(3) get(4)
// Expected:      —       —        1      —        -1     —        -1     3      4
//
// After put(1,1), put(2,2): shelf is HEAD↔[2]↔[1]↔TAIL
// get(1) → returns 1, shelf becomes HEAD↔[1]↔[2]↔TAIL
// put(3,3) → evicts key 2 (LRU), shelf: HEAD↔[3]↔[1]↔TAIL
// get(2) → -1 (evicted)
// put(4,4) → evicts key 1 (LRU), shelf: HEAD↔[4]↔[3]↔TAIL
// get(1) → -1, get(3) → 3, get(4) → 4
// -----------------------------------------------------------------------------
test('integration: classic LeetCode example', () => {
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  const r1 = cache.get(1);  // 1
  cache.put(3, 3);           // evicts key 2
  const r2 = cache.get(2);  // -1
  cache.put(4, 4);           // evicts key 1
  const r3 = cache.get(1);  // -1
  const r4 = cache.get(3);  // 3
  const r5 = cache.get(4);  // 4
  return [r1, r2, r3, r4, r5];
}, [1, -1, -1, 3, 4]);

test('integration: capacity=3 with mixed get/put', () => {
  const cache = new LRUCache(3);
  cache.put(1, 10);
  cache.put(2, 20);
  cache.put(3, 30);
  cache.get(1);     // shelf: HEAD↔[1]↔[3]↔[2]↔TAIL  (key 2 is LRU)
  cache.get(1);     // shelf: HEAD↔[1]↔[3]↔[2]↔TAIL  (no change, key 2 still LRU)
  cache.put(4, 40); // evicts key 2 (LRU)
  return [cache.get(1), cache.get(2), cache.get(3), cache.get(4)];
}, [10, -1, 30, 40]);

test('integration: overwrite same key multiple times, never evicts it', () => {
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(1, 2);
  cache.put(1, 3);
  cache.put(1, 4);
  return cache.get(1);
}, 4);

// =============================================================================
// Tests — all unimplemented exercises show SKIP, implemented ones show PASS/FAIL
// =============================================================================

function test(desc: string, actualFn: () => unknown, expected: unknown): void {
  try {
    const actual = actualFn();
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
    if (!pass) {
      console.log(`  expected: ${JSON.stringify(expected)}`);
      console.log(`  received: ${JSON.stringify(actual)}`);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`SKIP ${desc} — ${msg}`);
  }
}
