import { MinPriorityQueue } from "@datastructures-js/priority-queue";

// @leet start
function findKthLargest(nums: number[], k: number): number {
  const min = new MinPriorityQueue();

  for (const num of nums) {
    min.enqueue(num);

    while (min.size() > k) {
      min.dequeue();
    }
  }
  return min.front() as number;
}
// @leet end

findKthLargest([3, 2, 1, 5, 6, 4], 2);
