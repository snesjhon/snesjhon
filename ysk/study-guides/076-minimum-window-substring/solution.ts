/**
 * LeetCode 76: Minimum Window Substring
 *
 * Given two strings s and t, return the minimum window substring of s
 * such that every character in t (including duplicates) is included in the window.
 * If no such substring exists, return empty string.
 *
 * Example:
 * Input: s = "ADOBECODEBANC", t = "ABC"
 * Output: "BANC"
 *
 * Approach: Sliding Window with Frequency Counter
 * - Expand window by moving right pointer to collect characters
 * - Contract window by moving left pointer to minimize size
 * - Use 'matched' counter for O(1) validity check
 */

function minWindow(original: string, check: string): string {
  // Shopping list: what letters do we need and how many?
  const shoppingList = new Map<string, number>();
  for (const letter of check) {
    shoppingList.set(letter, (shoppingList.get(letter) || 0) + 1);
  }

  // Collection basket: what have we gathered in current window?
  const basket = new Map<string, number>();

  // How many unique items on shopping list have we satisfied?
  let itemsSatisfied = 0;
  const itemsRequired = shoppingList.size;

  // Magnifying glass edges
  let leftEdge = 0;
  let rightEdge = 0;

  // Track the best (smallest) window found
  let bestWindowStart = 0;
  let bestWindowLength = Infinity;

  // Expand the magnifying glass by moving right edge
  while (rightEdge < original.length) {
    const letterAtRight = original[rightEdge];

    // Collect the letter if it's on our shopping list
    if (shoppingList.has(letterAtRight)) {
      basket.set(letterAtRight, (basket.get(letterAtRight) || 0) + 1);

      // Did we just satisfy this item's requirement?
      if (basket.get(letterAtRight) === shoppingList.get(letterAtRight)) {
        itemsSatisfied++;
      }
    }

    // While we have everything, try to shrink the window
    while (itemsSatisfied === itemsRequired) {
      // Record this window if it's the smallest
      const currentWindowLength = rightEdge - leftEdge + 1;
      if (currentWindowLength < bestWindowLength) {
        bestWindowStart = leftEdge;
        bestWindowLength = currentWindowLength;
      }

      // Try to remove from left edge
      const letterAtLeft = original[leftEdge];

      if (shoppingList.has(letterAtLeft)) {
        // About to lose this letter from basket
        if (basket.get(letterAtLeft) === shoppingList.get(letterAtLeft)) {
          itemsSatisfied--; // We're about to not have enough!
        }
        basket.set(letterAtLeft, basket.get(letterAtLeft)! - 1);
      }

      leftEdge++; // Shrink from left
    }

    rightEdge++; // Expand to the right
  }

  // Return the best window, or empty if none found
  return bestWindowLength === Infinity
    ? ""
    : original.slice(bestWindowStart, bestWindowStart + bestWindowLength);
}

// Test cases
console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
console.log(minWindow("a", "a")); // "a"
console.log(minWindow("a", "aa")); // ""
console.log(minWindow("OUZODYXAZV", "XYZ")); // "YXAZ"