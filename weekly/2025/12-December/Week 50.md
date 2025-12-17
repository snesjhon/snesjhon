## Mon, Dec 9

Overall, I think it went alright. The take home took a toll as to how quickly I was able to answer everything and I think I felt overwhelmed with getting something right than looking at every requirement.

I also spent too much time looking to have _an_ answer to every task than refortifying whether the answers I had on each section where completely done.

---

Back here again. It feels like I'm back in 2021, learning and learning. I feel reinvigorated.

---

## Wed, Dec 11

It didn't go as I planned, but it's okay. Continue persevering, continue studying and one moment at a time continue learning.

This is such a blank area that I must get better and must continue striving for more

---

## Fri, Dec 12

Not the results I was hoping for again, but we persevere.

---

Yesterday I learned more about [Middle linked list](https://algo.monster/problems/middle_of_linked_list) and it was fun to write and understand.

Given can a linked list find the middle node:

The trick is to create two pointers, one slow and one fast. One that goes through each and one that goes twice as fast. Thus when the fast pointer hits the end, the slow pointer will be in the middle

```ts
function linkedList(head: ListNode){
	let slow = head;
	let fast = head;

	while(fast){
	  if(!fast.next) return slow;

	  slow = slow.next ?? null;
	  fast = fast.next.next ?? null;
	}

	return slow
}

```

---

## Sat, Dec 13

## Learning Python

Feels like a good opportunity to learn a new language to reinforce what I'm learning every day.

Seems like if I could write it in multiple languages, it'll make me think harder about the problem instead of just learning and memorizing the pattern.

I think that makes sense in a big way since I want to strengthen both sides. I don't think I want to continue learning more rails. Feels like the way of the world is moving towards python.
