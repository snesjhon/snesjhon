// original = "cbaebabacd", check = "abc"
function findAllAnagrams(original: string, check: string) {
  // we can build a "frequency map" to find the algoritms
  // Since we're still at the "sliding window" issue, we're still trying to
  // solve the idea of "adding" and "removing" items as we build this frequency
  //

  const targetMap = new Map();

  for (let i = 0; i < check.length; i++) {
    const char = check.charAt(i);
    const charInMap = targetMap.get(char);

    if (!charInMap) {
      targetMap.set(char, 1);
    } else {
      targetMap.set(char, charInMap + 1);
    }
  }

  const targetArray = Array.from(targetMap.entries());

  const map = new Map();

  for (let i = 0; i < check.length; i++) {
    const char = original.charAt(i);
    const charInMap = map.get(char);

    if (!charInMap) {
      map.set(char, 1);
    } else {
      map.set(char, charInMap + 1);
    }
  }
  const output: number[] = [];

  for (let j = check.length; j <= original.length; j++) {
    const currentChar = original.charAt(j);
    const prevChar = original.charAt(j - check.length);

    const match = targetArray.every(([key, value]) => {
      const mapChar = map.get(key);
      if (!mapChar) return false;
      if (mapChar === value) {
        return true;
      }
      return false;
    });

    if (match) {
      output.push(j - check.length);
    }

    const charInMap = map.get(currentChar);

    if (!charInMap) {
      map.set(currentChar, 1);
    } else {
      map.set(currentChar, charInMap + 1);
    }

    const prevCharInMap = map.get(prevChar);
    if (prevCharInMap) {
      map.set(prevChar, prevCharInMap - 1);
    }
  }

  return output;
}

function findOptimized(original: string, check: string) {
  const checkMap = new Map();
  const slidingMap = new Map();
  let matchingChars = 0;
  const output: number[] = [];

  // build our target window which we will check everything on
  for (let i = 0; i < check.length; i++) {
    const newChar = check.charAt(i);
    const newCount = checkMap.get(newChar) || 0;
    checkMap.set(newChar, newCount + 1);
  }

  // build our initial slidingMap which will be populated firstly by the length and check
  for (let i = 0; i < check.length; i++) {
    const newChar = original.charAt(i);
    const oldCount = slidingMap.get(newChar) || 0;
    const newCount = oldCount + 1;

    slidingMap.set(newChar, newCount);

    const targetCount = checkMap.get(newChar);

    if (newCount === targetCount) {
      matchingChars++;
    } else if (oldCount === targetCount) {
      matchingChars--;
    }
  }

  if (matchingChars === checkMap.size) {
    output.push(0);
  }

  for (let i = check.length; i < original.length; i++) {
    // newChar that we will add
    const newChar = original.charAt(i);
    const oldCount = slidingMap.get(newChar) || 0;
    const newCount = oldCount + 1;

    slidingMap.set(newChar, newCount);

    const targetCount = checkMap.get(newChar);

    if (newCount === targetCount) {
      matchingChars++;
    } else if (oldCount === targetCount) {
      matchingChars--;
    }

    // oldChar that we will add
    const oldChar = original.charAt(i - check.length);
    const oldOldCount = slidingMap.get(oldChar) || 0;
    const newOldCount = oldOldCount - 1;

    slidingMap.set(oldChar, newOldCount);

    const targetOldCount = checkMap.get(oldChar);

    if (newOldCount === targetOldCount) {
      matchingChars++;
    } else if (oldOldCount === targetOldCount) {
      matchingChars--;
    }

    if (matchingChars === checkMap.size) {
      output.push(i - check.length + 1);
    }
  }

  console.log({ checkMap, slidingMap, matchingChars, output });
}

function findAllAnagramsOptimized(original: string, check: string): number[] {
  const targetMap = new Map<string, number>();
  const windowMap = new Map<string, number>();
  const output: number[] = [];

  // Helper to update char count and return change to matchingChars
  const updateCharCount = (char: string, delta: number): number => {
    const prevCount = windowMap.get(char) || 0;
    const newCount = prevCount + delta;
    windowMap.set(char, newCount);

    const targetCount = targetMap.get(char);

    // Did we just achieve a match?
    if (newCount === targetCount) return 1;

    // Did we just break a match?
    if (prevCount === targetCount) return -1;

    // No change in match status
    return 0;
  };

  // Build target frequency map
  for (let i = 0; i < check.length; i++) {
    const char = check.charAt(i);
    targetMap.set(char, (targetMap.get(char) || 0) + 1);
  }

  let matchingChars = 0;

  // Build initial window frequency map
  for (let i = 0; i < check.length; i++) {
    const char = original.charAt(i);
    matchingChars += updateCharCount(char, 1);
  }

  // Check if first window is a match
  if (matchingChars === targetMap.size) {
    output.push(0);
  }

  // Slide the window
  for (let i = check.length; i < original.length; i++) {
    const newChar = original.charAt(i);
    const oldChar = original.charAt(i - check.length);

    // Add new character and remove old character
    matchingChars += updateCharCount(newChar, 1);
    matchingChars += updateCharCount(oldChar, -1);

    // Check if current window is a match
    if (matchingChars === targetMap.size) {
      output.push(i - check.length + 1);
    }
  }

  return output;
}

// console.log(findAllAnagrams("wubudubuwubuthattrue", "ubutu"));
console.log(findOptimized("abab", "ab"));
