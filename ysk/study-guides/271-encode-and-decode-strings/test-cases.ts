// =============================================================================
// Encode and Decode Strings
// =============================================================================
// Goal: understand length-prefix framing by building each piece of the
//       encode/decode protocol from scratch.
//
// Mental model: each string is a parcel tagged with its character count.
//   "hello" → "5#hello"
//   "co#de" → "5#co#de"   (# in content is invisible to the decoder)
//   ""      → "0#"
//
// The decoder never scans for a separator inside content — it counts characters.

// -----------------------------------------------------------------------------
// Exercise 1
// Build a single measurement tag for one string.
// The tag format is: "{charCount}#{content}"
//
// This is the atomic building block of the encoding. Every string in the list
// gets exactly this treatment before being concatenated together.
//
// Example:
//   tagOne("hello")   → "5#hello"
//   tagOne("co#de")   → "5#co#de"    ← the # in content is just a character
//   tagOne("")         → "0#"
//   tagOne("abc")      → "3#abc"
// -----------------------------------------------------------------------------
function tagOne(s: string): string {
  return `${s.length}#${s}`;
}

// test('tagOne: basic string', tagOne('hello'), '5#hello');
// test('tagOne: string containing #', tagOne('co#de'), '5#co#de');
// test('tagOne: empty string', tagOne(''), '0#');
// test('tagOne: single character', tagOne('a'), '1#a');
// test('tagOne: string that looks like a tag', tagOne('3#abc'), '5#3#abc');

// -----------------------------------------------------------------------------
// Exercise 2
// Encode a list of strings into one flat string.
// Tag each string with tagOne, then concatenate — no separator between parcels.
// The tags themselves tell the decoder where each string ends.
//
// Example:
//   encode(["neet", "code"])        → "4#neet4#code"
//   encode(["co#de", "#"])          → "5#co#de1##"
//   encode([])                      → ""
//   encode([""])                    → "0#"
//   encode(["", "hi", ""])          → "0#2#hi0#"
// -----------------------------------------------------------------------------
function encode(strs: string[]): string {
  return strs.map((s) => tagOne(s)).join('');
}

// test('encode: two basic strings', encode(['neet', 'code']), '4#neet4#code');
// test('encode: string with # and lone #', encode(['co#de', '#']), '5#co#de1##');
// test('encode: empty list', encode([]), '');
// test('encode: single empty string', encode(['']), '0#');
// test(
//   'encode: empty strings surrounding a word',
//   encode(['', 'hi', '']),
//   '0#2#hi0#',
// );

// -----------------------------------------------------------------------------
// Exercise 3
// Read one tagged parcel from position i in the encoded string.
// Return the extracted string AND the position of the next tag (so the caller
// can chain calls to read every parcel).
//
// Steps:
//   1. Walk j forward from i until s[j] === '#'
//   2. Parse s.slice(i, j) as the character count (len)
//   3. Slice s from j+1 to j+1+len as the parcel content
//   4. The next tag starts at j+1+len
//
// Example (encoded string: "4#neet5#co#de0#"):
//   readTag("4#neet5#co#de0#", 0)  → { str: "neet",  next: 6  }
//   readTag("4#neet5#co#de0#", 6)  → { str: "co#de", next: 13 }
//   readTag("4#neet5#co#de0#", 13) → { str: "",      next: 15 }
//
// Key: the # characters embedded in "co#de" are skipped because the decoder
// counts characters (it's in "counting mode"), not scanning for #.
// -----------------------------------------------------------------------------
function readTag(s: string, i: number): { str: string; next: number } {
  let j = i;
  let count = 0;
  while (s[j] !== '#') j++;

  count = Number(s.slice(i, j));

  return {
    str: s.slice(j + 1, j + 1 + count),
    next: j + 1 + count,
  };
}

const encoded1 = '4#neet5#co#de0#';
test('readTag: first parcel', readTag(encoded1, 0), { str: 'neet', next: 6 });
test('readTag: second parcel (# inside content)', readTag(encoded1, 6), {
  str: 'co#de',
  next: 13,
});
test('readTag: third parcel (empty string)', readTag(encoded1, 13), {
  str: '',
  next: 15,
});

// The embedded # at position 2 of "co#de" does not stop the decoder —
// j never moves once counting mode starts.
test('readTag: string starting with #', readTag('1##rest', 0), {
  str: '#',
  next: 3,
});
test('readTag: all # content', readTag('3###', 0), { str: '##', next: 5 });

// -----------------------------------------------------------------------------
// Exercise 4
// Decode a full encoded string back to the original list.
// Chain readTag calls starting at i=0, advancing i to `next` each time,
// until i reaches the end of the string.
//
// Example:
//   decode("4#neet4#code")  → ["neet", "code"]
//   decode("5#co#de1##")    → ["co#de", "#"]
//   decode("0#2#hi0#")      → ["", "hi", ""]
//   decode("")              → []
// -----------------------------------------------------------------------------
function decode(s: string): string[] {
  let i = 0;
  const output = [];
  while (i < s.length) {
    let j = i;
    while (s[j] !== '#') j++;

    const num = Number(s.slice(i, j));
    output.push(s.slice(j + 1, j + 1 + num));
    i = j + 1 + num;
  }
  return output;
}

test('decode: two basic strings', decode('4#neet4#code'), ['neet', 'code']);
test('decode: string with # and lone #', decode('5#co#de1##'), ['co#de', '#']);
test('decode: empty strings surrounding a word', decode('0#2#hi0#'), [
  '',
  'hi',
  '',
]);
test('decode: empty encoded string', decode(''), []);
test('decode: single empty string', decode('0#'), ['']);

// -----------------------------------------------------------------------------
// Round-trip: encode then decode should always return the original list.
// These tests confirm both directions are inverses of each other.
// The tricky cases here are the ones that would break a naive delimiter approach.
// -----------------------------------------------------------------------------
function roundTrip(strs: string[]): string[] {
  return decode(encode(strs));
}

test(
  'round-trip: NeetCode example',
  roundTrip(['neet', 'code', 'love', 'you']),
  ['neet', 'code', 'love', 'you'],
);
test('round-trip: # in content', roundTrip(['co#de', 'a#b#c', '#']), [
  'co#de',
  'a#b#c',
  '#',
]);
test(
  'round-trip: string that looks like a tag',
  roundTrip(['5#hello', '0#', '10#abc']),
  ['5#hello', '0#', '10#abc'],
);
test('round-trip: only empty strings', roundTrip(['', '', '']), ['', '', '']);
test('round-trip: empty list', roundTrip([]), []);
test('round-trip: 100-char string', roundTrip(['x'.repeat(100), 'end']), [
  'x'.repeat(100),
  'end',
]);
test(
  'round-trip: whitespace and control chars',
  roundTrip(['hello world', '\t', '\n']),
  ['hello world', '\t', '\n'],
);

// =============================================================================
// Tests — all should print PASS
// =============================================================================

function test(desc: string, actual: unknown, expected: unknown): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${desc}`);
  if (!pass) {
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
  }
}
