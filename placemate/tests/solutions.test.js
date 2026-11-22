// Every solution shipped in the dataset must be run against test cases here.
// A question with code but no test below makes this suite fail, so untested code cannot ship.
const data = require('../data/research/dataset.json');

const TESTS = {
  twoSum: (f) => { expect(f([2, 7, 11, 15], 9)).toEqual([0, 1]); expect(f([3, 2, 4], 6)).toEqual([1, 2]); expect(f([1, 2], 10)).toEqual([]); },
  canBeSumOfConsecutive: (f) => {
    const brute = (n) => { for (let a = 1; a < n; a++) { let s = 0; for (let b = a; b < n && s < n; b++) { s += b; if (s === n && b > a) return true; } } return false; };
    for (let n = 1; n <= 300; n++) expect(f(n)).toBe(brute(n));
    expect(f(0)).toBe(false);
  },
  knightMinSteps: (f) => { expect(f(8, [0, 0], [7, 7])).toBe(6); expect(f(8, [0, 0], [1, 2])).toBe(1); expect(f(8, [3, 3], [3, 3])).toBe(0); expect(f(2, [0, 0], [1, 1])).toBe(-1); },
  rotateMatrix: (f) => { expect(f([[1, 2], [3, 4]])).toEqual([[3, 1], [4, 2]]); expect(f([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toEqual([[7, 4, 1], [8, 5, 2], [9, 6, 3]]); },
  nextGreater: (f) => { expect(f([4, 5, 2, 25])).toEqual([5, 25, 25, -1]); expect(f([13, 7, 6, 12])).toEqual([-1, 12, 12, -1]); expect(f([])).toEqual([]); },
  LRUCache: (C) => {
    const c = new C(2); c.put(1, 1); c.put(2, 2);
    expect(c.get(1)).toBe(1); c.put(3, 3);
    expect(c.get(2)).toBe(-1); c.put(4, 4);
    expect(c.get(1)).toBe(-1); expect(c.get(3)).toBe(3); expect(c.get(4)).toBe(4);
  },
  minPlatforms: (f) => { expect(f([900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000])).toBe(3); expect(f([900, 1100], [1000, 1200])).toBe(1); },
  canCompleteCircuit: (f) => { expect(f([4, 6, 7, 4], [6, 5, 3, 5])).toBe(1); expect(f([1, 2], [5, 5])).toBe(-1); },
  isBalanced: (f) => { expect(f('([]{})')).toBe(true); expect(f('([)]')).toBe(false); expect(f('((')).toBe(false); expect(f('')).toBe(true); expect(f(']')).toBe(false); },
  lisLength: (f) => { expect(f([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4); expect(f([5, 4, 3])).toBe(1); expect(f([])).toBe(0); expect(f([2, 2, 2])).toBe(1); },
  missingNumber: (f) => { expect(f([1, 2, 4, 5])).toBe(3); expect(f([2, 3])).toBe(1); expect(f([1])).toBe(2); },
};

describe('dataset integrity', () => {
  test('every reported question has a source; practice questions cite none', () => {
    for (const q of data.questions) {
      if (q.verificationStatus === 'practice') expect(q.sources).toHaveLength(0);
      else expect(q.sources.length).toBeGreaterThan(0);
    }
  });
  test('every source has a real http(s) URL and an accessed date', () => {
    for (const q of data.questions) for (const s of q.sources) { expect(s.url).toMatch(/^https?:\/\//); expect(s.accessedDate).toBeTruthy(); }
    for (const c of data.companies) for (const s of c.hiringSources) expect(s.url).toMatch(/^https?:\/\//);
  });
  test('dedupe keys are unique', () => {
    const keys = data.questions.map((q) => q.dedupeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
  test('company references exist', () => {
    const slugs = new Set(data.companies.map((c) => c.slug));
    for (const q of data.questions) if (q.company) expect(slugs.has(q.company)).toBe(true);
  });
});

describe('shipped solutions run correctly', () => {
  const withCode = data.questions.filter((q) => q.solutionCode);
  test('there are solutions to check', () => expect(withCode.length).toBeGreaterThan(5));
  test.each(withCode.map((q) => [q.title, q]))('%s', (title, q) => {
    expect(TESTS[q.codeEntry]).toBeDefined();
    const fn = new Function(`${q.solutionCode}\nreturn ${q.codeEntry};`)();
    TESTS[q.codeEntry](fn);
  });
});
