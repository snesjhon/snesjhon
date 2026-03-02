// @leet start
function groupAnagrams(strs: string[]): string[][] {
  // I'm going to describe the way that I would approach this algorithm first. I think the way that I would approach this is we would create a hash map.
  // One, we would create a hash map of a sorted string so that any time that we hit this same sorted string, we would push it to this, which we can then make into an array.

  const map: Map<string, string[]> = new Map();
  for (const char of strs) {
    const sortedString = char.split('').sort().join('');
    if (map.has(sortedString)) {
      const mappedString = map.get(sortedString);
      if (mappedString) {
        mappedString.push(char);
      }
    } else {
      map.set(sortedString, [char]);
    }
  }
  return [...map.values()];
}
// @leet end

function arraysMatch(a: string[][], b: string[][]): boolean {
  if (a.length !== b.length) return false;
  const normalize = (groups: string[][]) =>
    groups
      .map((g) => [...g].sort().join(','))
      .sort()
      .join('|');
  return normalize(a) === normalize(b);
}

const tests: { input: string[]; expected: string[][] }[] = [
  {
    input: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
    expected: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']],
  },
  {
    input: [''],
    expected: [['']],
  },
  {
    input: ['a'],
    expected: [['a']],
  },
  {
    input: ['ab', 'ba', 'abc', 'cab', 'bca'],
    expected: [
      ['ab', 'ba'],
      ['abc', 'cab', 'bca'],
    ],
  },
  {
    input: ['abc', 'def', 'ghi'],
    expected: [['abc'], ['def'], ['ghi']],
  },
  {
    input: ['aaa', 'aaa'],
    expected: [['aaa', 'aaa']],
  },
];

let passed = 0;
for (const [i, { input, expected }] of tests.entries()) {
  const result = groupAnagrams(input);
  const ok = arraysMatch(result, expected);
  console.log(`Test ${i + 1}: ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) {
    console.log('  input:   ', input);
    console.log('  expected:', expected);
    console.log('  got:     ', result);
  } else {
    passed++;
  }
}
console.log(`\n${passed}/${tests.length} passed`);
