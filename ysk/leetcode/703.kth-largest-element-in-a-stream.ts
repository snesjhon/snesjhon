import { MinPriorityQueue } from "@datastructures-js/priority-queue";
// @leet start
class KthLargest {
  min: MinPriorityQueue<number>;
  k: number;
  nums: number[];

  constructor(k: number, nums: number[]) {
    this.min = new MinPriorityQueue();
    this.k = k;
    this.nums = nums;

    for (const num of nums) {
      this.min.enqueue(num);
    }
  }

  add(val: number): number {
    // We always want to remove the 'smallest' item that's less than our `k` size
    // which we will then return the `smallest` of those which will give our `k` size
    // in `Test 3` though, it looks like we're adding `negatives` which compared to `0` it'll be the smallest
    // so why are `0` (within the first example), the expectation? wouldn't the expectation be that `-1`
    // would be the smallest?
    this.min.enqueue(val);

    while (this.min.size() > this.k) {
      this.min.dequeue();
    }

    const front = this.min.front();

    if (front === null) {
      return 0;
    }

    return front;
  }
}

/**
 * Your KthLargest object will be instantiated and called as such:
 * var obj = new KthLargest(k, nums)
 * var param_1 = obj.add(val)
 */
// @leet end

// --- Test Cases ---
function assert(actual: number, expected: number, label: string) {
  const pass = actual === expected;
  console.log(
    `${pass ? "PASS" : "FAIL"} [${label}]: got ${actual}, expected ${expected}`,
  );
}

// Test 1: LeetCode example — k=3, nums=[4,5,8,2]
// sorted desc: [8,5,4,2], kth largest = 4
// const t1 = new KthLargest(3, [4, 5, 8, 2]);
// assert(t1.add(3), 4, "t1.add(3)"); // [8,5,4,3,2]  → 4
// assert(t1.add(5), 5, "t1.add(5)"); // [8,5,5,4,3,2] → 5
// assert(t1.add(10), 5, "t1.add(10)"); // [10,8,5,5,4,3,2] → 5
// assert(t1.add(9), 8, "t1.add(9)"); // [10,9,8,5,5,4,3,2] → 8
// assert(t1.add(4), 8, "t1.add(4)"); // [10,9,8,5,5,4,4,3,2] → 8
//
// // Test 2: k=1, nums=[] — always return the max
// const t2 = new KthLargest(1, []);
// assert(t2.add(-3), -3, "t2.add(-3)"); // [-3] → -3
// assert(t2.add(-2), -2, "t2.add(-2)"); // [-2,-3] → -2
// assert(t2.add(-4), -2, "t2.add(-4)"); // [-2,-3,-4] → -2
// assert(t2.add(0), 0, "t2.add(0)"); // [0,-2,-3,-4] → 0
// assert(t2.add(4), 4, "t2.add(4)"); // [4,0,-2,-3,-4] → 4

// Test 3: k=2, starts with [0], adds negatives then positives
// min-heap keeps the 2 largest; front = 2nd largest
const t3 = new KthLargest(2, [0]);
assert(t3.add(-1), -1, "t3.add(-1)"); // heap=[-1,0],  2nd largest = -1
assert(t3.add(1), 0, "t3.add(1)"); // heap=[0,1],   2nd largest = 0
assert(t3.add(-2), 0, "t3.add(-2)"); // heap=[0,1],   2nd largest = 0
assert(t3.add(-4), 0, "t3.add(-4)"); // heap=[0,1],   2nd largest = 0
assert(t3.add(3), 1, "t3.add(3)"); // heap=[1,3],   2nd largest = 1
