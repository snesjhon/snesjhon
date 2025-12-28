## Sun, Dec 28

I've been trying to figure out what's the right notation for a comment when trying to iterate through an algo. I've landed on this one, albeit I don't know if I'll stick to it as we move towards a final process

```ts
function longestString(s:string){
	const window = new Map()
	let start = 0;
	let output = 0;
	for(let end = 0; end < s.length; end++){
		/**
			abba
			e0:a | s:0 | o:1
			e1:b | s:0 | o:2
			e2:b DUP | s:2 | o:max(2, 1):2
			e3:a DUP | s:max(1, 2):2 | o:2 
		*/
		if(window.has(s.at(end))){
			start = Math.max(start, window.get(s.at(end)), + 1)
		}
		window.set(s.at(end), end);
		output = Math.max(output,  end - start + 1);
	}
	return output
}
```

---
## Tue, Dec 23

Learning more about how we should think through a DFS tree. It's more interesting than I thought but I also need to continue moving and `backtracking` through old concepts to assure I've memorized the big picture concepts

---
## Mon, Dec 22

Switched to Ghostty today and liking it so far! It runs pretty fast.

Also, continuing learning about [[sort-colors-visual-guide]]