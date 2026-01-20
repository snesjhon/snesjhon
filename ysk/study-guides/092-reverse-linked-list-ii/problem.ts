// Reverse Linked List II
// Given the head of a singly linked list and two integers left and right where left <= right,
// reverse the nodes of the list from position left to position right, and return the reversed list.

// Definition for singly-linked list
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

// Requirements:
// - 1 <= left <= right <= n (where n is the length of the list)
// - Positions are 1-indexed (not 0-indexed!)
// - Must solve in one pass
// - Time: O(n), Space: O(1)

function reverseBetween(
  head: ListNode | null,
  left: number,
  right: number
): ListNode | null {
  // TODO: Implement this function
  return head;
}

// Helper Functions for Testing

function createList(values: number[]): ListNode | null {
  if (values.length === 0) return null;

  const dummy = new ListNode();
  let current = dummy;

  for (const val of values) {
    current.next = new ListNode(val);
    current = current.next;
  }

  return dummy.next;
}

function listToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  let current = head;

  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }

  return result;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// Test Cases

function testReverseBetween() {
  console.log("Running Reverse Linked List II tests...\n");

  // Test 1: Basic example - reverse middle section
  const list1 = createList([1, 2, 3, 4, 5]);
  const result1 = reverseBetween(list1, 2, 4);
  const array1 = listToArray(result1);
  console.log("Test 1 - Reverse middle section:");
  console.log("Input: [1,2,3,4,5], left=2, right=4");
  console.log("Expected: [1,4,3,2,5]");
  console.log("Got:", array1);
  console.log("Pass:", arraysEqual(array1, [1, 4, 3, 2, 5]), "\n");

  // Test 2: Single node (no reversal needed)
  const list2 = createList([5]);
  const result2 = reverseBetween(list2, 1, 1);
  const array2 = listToArray(result2);
  console.log("Test 2 - Single node:");
  console.log("Input: [5], left=1, right=1");
  console.log("Expected: [5]");
  console.log("Got:", array2);
  console.log("Pass:", arraysEqual(array2, [5]), "\n");

  // Test 3: Reverse entire list
  const list3 = createList([1, 2, 3, 4, 5]);
  const result3 = reverseBetween(list3, 1, 5);
  const array3 = listToArray(result3);
  console.log("Test 3 - Reverse entire list:");
  console.log("Input: [1,2,3,4,5], left=1, right=5");
  console.log("Expected: [5,4,3,2,1]");
  console.log("Got:", array3);
  console.log("Pass:", arraysEqual(array3, [5, 4, 3, 2, 1]), "\n");

  // Test 4: Reverse from head (first two nodes)
  const list4 = createList([1, 2, 3, 4, 5]);
  const result4 = reverseBetween(list4, 1, 2);
  const array4 = listToArray(result4);
  console.log("Test 4 - Reverse from head:");
  console.log("Input: [1,2,3,4,5], left=1, right=2");
  console.log("Expected: [2,1,3,4,5]");
  console.log("Got:", array4);
  console.log("Pass:", arraysEqual(array4, [2, 1, 3, 4, 5]), "\n");

  // Test 5: Reverse last two nodes
  const list5 = createList([1, 2, 3, 4, 5]);
  const result5 = reverseBetween(list5, 4, 5);
  const array5 = listToArray(result5);
  console.log("Test 5 - Reverse last two nodes:");
  console.log("Input: [1,2,3,4,5], left=4, right=5");
  console.log("Expected: [1,2,3,5,4]");
  console.log("Got:", array5);
  console.log("Pass:", arraysEqual(array5, [1, 2, 3, 5, 4]), "\n");

  // Test 6: Two node list, reverse both
  const list6 = createList([3, 5]);
  const result6 = reverseBetween(list6, 1, 2);
  const array6 = listToArray(result6);
  console.log("Test 6 - Two node list:");
  console.log("Input: [3,5], left=1, right=2");
  console.log("Expected: [5,3]");
  console.log("Got:", array6);
  console.log("Pass:", arraysEqual(array6, [5, 3]), "\n");

  // Test 7: Reverse adjacent nodes in middle
  const list7 = createList([1, 2, 3, 4, 5]);
  const result7 = reverseBetween(list7, 3, 4);
  const array7 = listToArray(result7);
  console.log("Test 7 - Reverse adjacent middle nodes:");
  console.log("Input: [1,2,3,4,5], left=3, right=4");
  console.log("Expected: [1,2,4,3,5]");
  console.log("Got:", array7);
  console.log("Pass:", arraysEqual(array7, [1, 2, 4, 3, 5]), "\n");

  // Test 8: Single reversal (left equals right)
  const list8 = createList([1, 2, 3, 4, 5]);
  const result8 = reverseBetween(list8, 3, 3);
  const array8 = listToArray(result8);
  console.log("Test 8 - No reversal (left = right):");
  console.log("Input: [1,2,3,4,5], left=3, right=3");
  console.log("Expected: [1,2,3,4,5]");
  console.log("Got:", array8);
  console.log("Pass:", arraysEqual(array8, [1, 2, 3, 4, 5]), "\n");

  // Test 9: Larger list, reverse middle portion
  const list9 = createList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const result9 = reverseBetween(list9, 3, 7);
  const array9 = listToArray(result9);
  console.log("Test 9 - Larger list:");
  console.log("Input: [1,2,3,4,5,6,7,8,9,10], left=3, right=7");
  console.log("Expected: [1,2,7,6,5,4,3,8,9,10]");
  console.log("Got:", array9);
  console.log("Pass:", arraysEqual(array9, [1, 2, 7, 6, 5, 4, 3, 8, 9, 10]), "\n");

  // Test 10: Reverse all but first
  const list10 = createList([1, 2, 3, 4, 5]);
  const result10 = reverseBetween(list10, 2, 5);
  const array10 = listToArray(result10);
  console.log("Test 10 - Reverse all but first:");
  console.log("Input: [1,2,3,4,5], left=2, right=5");
  console.log("Expected: [1,5,4,3,2]");
  console.log("Got:", array10);
  console.log("Pass:", arraysEqual(array10, [1, 5, 4, 3, 2]), "\n");

  // Test 11: Reverse all but last
  const list11 = createList([1, 2, 3, 4, 5]);
  const result11 = reverseBetween(list11, 1, 4);
  const array11 = listToArray(result11);
  console.log("Test 11 - Reverse all but last:");
  console.log("Input: [1,2,3,4,5], left=1, right=4");
  console.log("Expected: [4,3,2,1,5]");
  console.log("Got:", array11);
  console.log("Pass:", arraysEqual(array11, [4, 3, 2, 1, 5]), "\n");

  // Test 12: Three node list, reverse all
  const list12 = createList([1, 2, 3]);
  const result12 = reverseBetween(list12, 1, 3);
  const array12 = listToArray(result12);
  console.log("Test 12 - Three nodes, reverse all:");
  console.log("Input: [1,2,3], left=1, right=3");
  console.log("Expected: [3,2,1]");
  console.log("Got:", array12);
  console.log("Pass:", arraysEqual(array12, [3, 2, 1]), "\n");

  // Test 13: Edge case with larger numbers
  const list13 = createList([10, 20, 30, 40, 50]);
  const result13 = reverseBetween(list13, 2, 4);
  const array13 = listToArray(result13);
  console.log("Test 13 - Larger values:");
  console.log("Input: [10,20,30,40,50], left=2, right=4");
  console.log("Expected: [10,40,30,20,50]");
  console.log("Got:", array13);
  console.log("Pass:", arraysEqual(array13, [10, 40, 30, 20, 50]), "\n");

  // Test 14: Reverse first three of longer list
  const list14 = createList([1, 2, 3, 4, 5, 6, 7]);
  const result14 = reverseBetween(list14, 1, 3);
  const array14 = listToArray(result14);
  console.log("Test 14 - Reverse first three:");
  console.log("Input: [1,2,3,4,5,6,7], left=1, right=3");
  console.log("Expected: [3,2,1,4,5,6,7]");
  console.log("Got:", array14);
  console.log("Pass:", arraysEqual(array14, [3, 2, 1, 4, 5, 6, 7]), "\n");

  // Test 15: Reverse last three of longer list
  const list15 = createList([1, 2, 3, 4, 5, 6, 7]);
  const result15 = reverseBetween(list15, 5, 7);
  const array15 = listToArray(result15);
  console.log("Test 15 - Reverse last three:");
  console.log("Input: [1,2,3,4,5,6,7], left=5, right=7");
  console.log("Expected: [1,2,3,4,7,6,5]");
  console.log("Got:", array15);
  console.log("Pass:", arraysEqual(array15, [1, 2, 3, 4, 7, 6, 5]), "\n");
}

// Run the tests
testReverseBetween();