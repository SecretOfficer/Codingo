/* Duel problems and the judging harness. This file stays in the main process:
   the renderer is handed a version with the tests and answers stripped out. */

const DEBUG_PROBLEMS = [
  {
    id: 'd_sum', title: 'Broken sum', difficulty: 0.15, limitSeconds: 150,
    brief: 'sum_list should add up every number in the list. It returns the last one instead.',
    code: 'def sum_list(nums):\n    total = 0\n    for n in nums:\n        total = n\n    return total\n',
    tests: [['sum_list([1, 2, 3])', '6'], ['sum_list([])', '0'], ['sum_list([-4, 4, 10])', '10']]
  },
  {
    id: 'd_even', title: 'Odd even', difficulty: 0.1, limitSeconds: 120,
    brief: 'is_even should return True for even numbers. Right now it has it backwards.',
    code: 'def is_even(n):\n    return n % 2 == 1\n',
    tests: [['is_even(4)', 'True'], ['is_even(7)', 'False'], ['is_even(0)', 'True']]
  },
  {
    id: 'd_rev', title: 'Reverse refuses', difficulty: 0.15, limitSeconds: 120,
    brief: 'reverse_string should reverse the text. The slice step is wrong.',
    code: 'def reverse_string(s):\n    return s[::1]\n',
    tests: [["reverse_string('abc')", "'cba'"], ["reverse_string('')", "''"], ["reverse_string('ab')", "'ba'"]]
  },
  {
    id: 'd_max', title: 'Negative blind spot', difficulty: 0.3, limitSeconds: 180,
    brief: 'largest works on positive numbers but returns 0 for a list of negatives.',
    code: 'def largest(nums):\n    best = 0\n    for n in nums:\n        if n > best:\n            best = n\n    return best\n',
    tests: [['largest([3, 9, 2])', '9'], ['largest([-5, -2, -9])', '-2'], ['largest([7])', '7']]
  },
  {
    id: 'd_fact', title: 'Off by one factorial', difficulty: 0.3, limitSeconds: 180,
    brief: 'factorial(5) should be 120 but comes out as 24. The range stops too early.',
    code: 'def factorial(n):\n    result = 1\n    for i in range(1, n):\n        result = result * i\n    return result\n',
    tests: [['factorial(5)', '120'], ['factorial(0)', '1'], ['factorial(1)', '1'], ['factorial(6)', '720']]
  },
  {
    id: 'd_avg', title: 'Truncated average', difficulty: 0.25, limitSeconds: 150,
    brief: 'average should give 2.5 for [1, 2, 3, 4] but floors the division.',
    code: 'def average(nums):\n    return sum(nums) // len(nums)\n',
    tests: [['average([1, 2, 3, 4])', '2.5'], ['average([2, 2])', '2.0'], ['average([5])', '5.0']]
  },
  {
    id: 'd_fizz', title: 'FizzBuzz order', difficulty: 0.35, limitSeconds: 180,
    brief: 'fizzbuzz(15) should be "FizzBuzz" but the checks are in the wrong order.',
    code: "def fizzbuzz(n):\n    if n % 3 == 0:\n        return 'Fizz'\n    if n % 5 == 0:\n        return 'Buzz'\n    if n % 15 == 0:\n        return 'FizzBuzz'\n    return str(n)\n",
    tests: [["fizzbuzz(15)", "'FizzBuzz'"], ["fizzbuzz(9)", "'Fizz'"], ["fizzbuzz(10)", "'Buzz'"], ["fizzbuzz(7)", "'7'"]]
  },
  {
    id: 'd_count', title: 'KeyError counter', difficulty: 0.4, limitSeconds: 200,
    brief: 'word_count crashes with KeyError on the first sighting of a word.',
    code: "def word_count(text):\n    counts = {}\n    for w in text.split():\n        counts[w] += 1\n    return counts\n",
    tests: [["word_count('a b a')", "{'a': 2, 'b': 1}"], ["word_count('')", "{}"], ["word_count('x')", "{'x': 1}"]]
  },
  {
    id: 'd_dedupe', title: 'Order lost', difficulty: 0.45, limitSeconds: 200,
    brief: 'unique should drop duplicates but keep the original order. The set scrambles it.',
    code: 'def unique(items):\n    return list(set(items))\n',
    tests: [['unique([3, 1, 3, 2, 1])', '[3, 1, 2]'], ['unique([])', '[]'], ["unique(['b', 'a', 'b'])", "['b', 'a']"]]
  },
  {
    id: 'd_search', title: 'Binary search hangs', difficulty: 0.55, limitSeconds: 240,
    brief: 'find_index never terminates for a missing value and misses the last element.',
    code: 'def find_index(sorted_nums, target):\n    lo = 0\n    hi = len(sorted_nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if sorted_nums[mid] == target:\n            return mid\n        if sorted_nums[mid] < target:\n            lo = mid\n        else:\n            hi = mid\n    return -1\n',
    tests: [['find_index([1, 3, 5, 7], 7)', '3'], ['find_index([1, 3, 5, 7], 1)', '0'], ['find_index([1, 3, 5, 7], 4)', '-1'], ['find_index([], 2)', '-1']]
  },
  {
    id: 'd_temp', title: 'Wrong conversion', difficulty: 0.2, limitSeconds: 150,
    brief: 'to_fahrenheit(100) should be 212.0. The formula has been mangled.',
    code: 'def to_fahrenheit(c):\n    return c * 5 / 9 + 32\n',
    tests: [['to_fahrenheit(100)', '212.0'], ['to_fahrenheit(0)', '32.0'], ['to_fahrenheit(-40)', '-40.0']]
  },
  {
    id: 'd_vowel', title: 'Vowel miscount', difficulty: 0.3, limitSeconds: 170,
    brief: 'count_vowels misses uppercase vowels entirely.',
    code: "def count_vowels(s):\n    total = 0\n    for ch in s:\n        if ch in 'aeiou':\n            total += 1\n    return total\n",
    tests: [["count_vowels('Education')", '5'], ["count_vowels('XYZ')", '0'], ["count_vowels('AEIOU')", '5']]
  }
];

const VIBECODE_PROBLEMS = [
  {
    id: 'v_second', title: 'Second largest', difficulty: 0.4, limitSeconds: 240,
    spec: 'Write second_largest(nums) returning the second largest distinct value in the list. Return None if there is no second distinct value.',
    starter: 'def second_largest(nums):\n    ',
    tests: [['second_largest([3, 9, 2])', '3'], ['second_largest([5, 5, 5])', 'None'], ['second_largest([1, 2])', '1'], ['second_largest([])', 'None']]
  },
  {
    id: 'v_pal', title: 'Palindrome check', difficulty: 0.35, limitSeconds: 220,
    spec: 'Write is_palindrome(s) returning True when s reads the same both ways, ignoring case and spaces.',
    starter: 'def is_palindrome(s):\n    ',
    tests: [["is_palindrome('Never odd or even')", 'True'], ["is_palindrome('hello')", 'False'], ["is_palindrome('')", 'True']]
  },
  {
    id: 'v_fib', title: 'Nth Fibonacci', difficulty: 0.35, limitSeconds: 220,
    spec: 'Write fib(n) returning the nth Fibonacci number, where fib(0) is 0 and fib(1) is 1.',
    starter: 'def fib(n):\n    ',
    tests: [['fib(0)', '0'], ['fib(1)', '1'], ['fib(10)', '55'], ['fib(20)', '6765']]
  },
  {
    id: 'v_flat', title: 'Flatten', difficulty: 0.4, limitSeconds: 220,
    spec: 'Write flatten(rows) turning a list of lists into one flat list, keeping the order.',
    starter: 'def flatten(rows):\n    ',
    tests: [['flatten([[1, 2], [3]])', '[1, 2, 3]'], ['flatten([])', '[]'], ['flatten([[], [4]])', '[4]']]
  },
  {
    id: 'v_prime', title: 'Prime test', difficulty: 0.45, limitSeconds: 240,
    spec: 'Write is_prime(n) returning True only for prime numbers. 0, 1 and negatives are not prime.',
    starter: 'def is_prime(n):\n    ',
    tests: [['is_prime(2)', 'True'], ['is_prime(1)', 'False'], ['is_prime(97)', 'True'], ['is_prime(91)', 'False'], ['is_prime(-7)', 'False']]
  },
  {
    id: 'v_running', title: 'Running total', difficulty: 0.35, limitSeconds: 210,
    spec: 'Write running_total(nums) returning the list of cumulative sums, so [1, 2, 3] gives [1, 3, 6].',
    starter: 'def running_total(nums):\n    ',
    tests: [['running_total([1, 2, 3])', '[1, 3, 6]'], ['running_total([])', '[]'], ['running_total([5])', '[5]']]
  },
  {
    id: 'v_common', title: 'Most common', difficulty: 0.5, limitSeconds: 240,
    spec: 'Write most_common(items) returning the value that appears most often. On a tie return the one that appears first.',
    starter: 'def most_common(items):\n    ',
    tests: [['most_common([1, 2, 2, 3])', '2'], ["most_common(['a', 'b', 'a', 'b'])", "'a'"], ['most_common([7])', '7']]
  },
  {
    id: 'v_gcd', title: 'Greatest common divisor', difficulty: 0.45, limitSeconds: 220,
    spec: 'Write gcd(a, b) returning the greatest common divisor of two positive integers.',
    starter: 'def gcd(a, b):\n    ',
    tests: [['gcd(12, 18)', '6'], ['gcd(7, 13)', '1'], ['gcd(100, 75)', '25'], ['gcd(9, 9)', '9']]
  },
  {
    id: 'v_caesar', title: 'Caesar shift', difficulty: 0.6, limitSeconds: 260,
    spec: 'Write shift(s, n) moving every lowercase letter n places forward through the alphabet, wrapping from z back to a. Leave any other character untouched.',
    starter: 'def shift(s, n):\n    ',
    tests: [["shift('abc', 1)", "'bcd'"], ["shift('xyz', 3)", "'abc'"], ["shift('a b', 0)", "'a b'"]]
  },
  {
    id: 'v_matrix', title: 'Column sums', difficulty: 0.55, limitSeconds: 250,
    spec: 'Write column_sums(grid) returning a list with the sum of each column of a rectangular grid of numbers.',
    starter: 'def column_sums(grid):\n    ',
    tests: [['column_sums([[1, 2], [3, 4]])', '[4, 6]'], ['column_sums([[5]])', '[5]'], ['column_sums([[1, 1], [1, 1], [1, 1]])', '[3, 3]']]
  }
];

const MARKER = '__VERDICT__';

/** Wrap the submitted code so the tests run inside the same interpreter. */
function buildHarness(userCode, tests) {
  const cases = tests.map(([expr, want]) =>
    '    (' + JSON.stringify(expr) + ', ' + JSON.stringify(want) + '),').join('\n');
  return `${userCode}

import json as _json
_cases = [
${cases}
]
_out = []
for _expr, _want in _cases:
    try:
        _got = repr(eval(_expr))
        _out.append([_expr, _got, _want, _got == _want])
    except Exception as _err:
        _out.append([_expr, type(_err).__name__ + ": " + str(_err), _want, False])
print(${JSON.stringify(MARKER)} + _json.dumps(_out))
`;
}

function parseVerdict(stdout) {
  const line = String(stdout || '').split('\n').reverse().find((l) => l.trim().startsWith(MARKER));
  if (!line) return null;
  try {
    return JSON.parse(line.trim().slice(MARKER.length));
  } catch (err) {
    return null;
  }
}

/** Strip everything the client must not see before sending a problem to the renderer. */
function publicView(problem, mode) {
  return {
    id: problem.id,
    mode,
    title: problem.title,
    difficulty: problem.difficulty,
    limitSeconds: problem.limitSeconds,
    brief: problem.brief || null,
    spec: problem.spec || null,
    code: problem.code || problem.starter || '',
    testCount: problem.tests.length
  };
}

function pick(list, avoidIds, difficultyTarget) {
  const avoid = new Set(avoidIds || []);
  let pool = list.filter((p) => !avoid.has(p.id));
  if (!pool.length) pool = list;
  if (typeof difficultyTarget === 'number') {
    pool = pool.slice().sort((a, b) =>
      Math.abs(a.difficulty - difficultyTarget) - Math.abs(b.difficulty - difficultyTarget)).slice(0, 4);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = {
  DEBUG_PROBLEMS, VIBECODE_PROBLEMS,
  buildHarness, parseVerdict, publicView, pick,
  byId: (id) => DEBUG_PROBLEMS.concat(VIBECODE_PROBLEMS).find((p) => p.id === id) || null
};
