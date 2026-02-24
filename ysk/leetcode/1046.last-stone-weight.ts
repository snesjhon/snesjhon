import { MaxPriorityQueue } from "@datastructures-js/priority-queue";
// @leet start
function lastStoneWeight(stones: number[]): number {
  // question 1: Do we sort?
  // question 2: If we sort, that means we have to keep sorting, because if we don't then that means
  // we're don't know which are the 'top' whenever we push the new value back
  // question 3: Is this a max heap? because we always know the 'top' value, which we can 'dequeue' and then do calculation again?
  //
  // if we dequeue while size of 'temp' array is less than 2, then we have the two values, and then push
  // -- we don't care about the 'sorting' of the values, but rather just the 'top' of the values

  const max = new MaxPriorityQueue();

  for (const stone of stones) {
    max.enqueue(stone);
  }

  while (max.size() > 1) {
    const y = max.dequeue() as number;
    const x = max.dequeue() as number;

    if (x === y) {
      continue;
    } else {
      const diff = y - x;
      max.enqueue(diff);
    }
  }

  // console.log({ max: max.front() });

  return max.front() === null ? 0 : (max.front() as number);
}
// @leet end

console.log(lastStoneWeight([2, 2]));
