## Mon, Feb 23

We're back, finally centralized a lot of what I wanted to do in terms of studying within the [[ysk]] project. Now feel a lot stronger in how the format of my studying is being created. I am generating a lot of content thanks to claude. Fortifying my understanding of many concepts.

I also am thankful for it for letting me solidify my dotfiles as well. Lots of fun I've been having there as well.
### [[heaps-priority-queues-fundamentals]]

1. peek — "what's the most urgent thing right now?" O(1)
2. extractMin — "okay, I'm done with that, remove it" O(log n)
3. insert — "new thing just arrived" O(log n)
4. go back to 1

Without extractMin you can only ever look at the top — you'd be stuck. You need to be able to say "I've processed the minimum, now give me the next one."

In terms of interview questions, every heap problem uses this loop in some form:

- Top-K — insert everything, call extractMin K times to get K smallest
- K-way merge — extract the current minimum across K sorted lists, insert the next element from that
  list, repeat
- Dijkstra — extract the closest unvisited node, process it, insert its neighbors
- Task Scheduler — extract the most frequent task, schedule it, reinsert with decremented count

The ER analogy from the guide captures it well — peek is "who's most critical?", extractMin is "doctor just called that patient in, remove them from the queue." Without removing them, the next most critical patient can never surface.

---