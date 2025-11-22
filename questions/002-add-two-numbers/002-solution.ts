/**
 * Definition for singly-linked list.
 */

class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

function addTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null,
): ListNode | null {
  const reverseL1: number[] = recursivePush(l1, []);
  const reverseL2 = recursivePush(l2, []);

  function recursivePush(linkedList: ListNode | null, targetArr: number[]) {
    if (linkedList) {
      if (!linkedList.val && !linkedList.next) return targetArr;

      if (linkedList.val) {
        targetArr.push(linkedList.val);
        if (linkedList.next) {
          recursivePush(linkedList.next, targetArr);
        }
      }
    }
    return targetArr;
  }

  const sum = Number(reverseL1.join("")) + Number(reverseL2.join(""));
  const sumArray = sum.toString().split("").reverse();

  function recursiveCreate(array: string[], iterator: number = 0): ListNode {
    let next: ListNode | null = null;

    const value = Number(array[iterator]);

    if (array[iterator + 1]) {
      next = recursiveCreate(array, iterator + 1);
    }

    return new ListNode(value, next);
  }

  return recursiveCreate(sumArray, 0);
}

function addTwoNumbersOptimal(
  l1: ListNode | null,
  l2: ListNode | null,
): ListNode | null {
  let dummy = new ListNode(0);
  let temp = dummy;
  let carry = 0;

  while (l1 !== null || l2 !== null || carry !== 0) {
    let val1 = l1 ? l1.val : 0;
    let val2 = l2 ? l2.val : 0;

    let sum = val1 + val2 + carry;
    carry = Math.floor(sum / 10);
    temp.next = new ListNode(sum % 10);
    temp = temp.next;

    if (l1 !== null) l1 = l1.next;
    if (l2 !== null) l2 = l2.next;
  }

  return dummy.next;
}

const l1: ListNode = {
  val: 2,
  next: {
    val: 4,
    next: {
      val: 3,
      next: null,
    },
  },
};

const l2: ListNode = {
  val: 5,
  next: {
    val: 6,
    next: {
      val: 4,
      next: null,
    },
  },
};

console.log(addTwoNumbers(l1, l2));
