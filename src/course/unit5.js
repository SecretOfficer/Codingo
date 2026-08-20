export default {
  id: 'u5',
  title: 'Lists & Loops',
  subtitle: 'Do it again, and again',
  color: '#ff4b4b',
  icon: 'FOR',
  lessons: [
    {
      id: 'u5l1',
      title: 'Lists',
      exercises: [
        {
          type: 'mcq',
          q: 'Which literal creates an empty list?',
          options: ['[]', '{}', '()', 'list[]'],
          answer: 0,
          explain: '{} makes an empty dict and () makes an empty tuple.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'nums = [10, 20, 30]\nprint(nums[1])',
          options: ['20', '10', '30', '1'],
          answer: 0,
          explain: 'Lists are indexed from 0, so index 1 is the second item.'
        },
        {
          type: 'blank',
          q: 'Add 4 to the end of the list.',
          code: 'nums = [1, 2, 3]\nnums.____(4)\nprint(nums)  # [1, 2, 3, 4]',
          bank: ['append', 'add', 'push', 'insert'],
          answer: ['append'],
          explain: 'append() adds one item. extend() adds every item of another iterable.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)',
          options: ['[1, 2, 3]', '[1, 2]', '[3]', 'TypeError'],
          answer: 0,
          explain: 'b is another name for the same list object. Copy with a.copy() or a[:] to avoid this.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'nums = [3, 1, 2]\nnums.sort()\nprint(nums)',
          options: ['[1, 2, 3]', '[3, 2, 1]', 'None', '[3, 1, 2]'],
          answer: 0,
          explain: 'sort() sorts in place and returns None. sorted(nums) returns a new sorted list.'
        },
        {
          type: 'match',
          q: 'Match each list operation with its result on [1, 2, 3].',
          pairs: [['len(x)', '3'], ['x[-1]', '3'], ['sum(x)', '6'], ['x + [4]', '[1, 2, 3, 4]']],
          explain: 'sum, len, min and max all work directly on lists of numbers.'
        }
      ]
    },
    {
      id: 'u5l2',
      title: 'for Loops',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for x in [1, 2]:\n    print(x)',
          options: ['1\n2', '[1, 2]', 'x\nx', '1 2'],
          answer: 0,
          explain: 'The loop variable takes each item in turn.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for i in range(3):\n    print(i)',
          options: ['0\n1\n2', '1\n2\n3', '0\n1\n2\n3', '3'],
          answer: 0,
          explain: 'range(3) yields 0, 1, 2 - the stop value is excluded.'
        },
        {
          type: 'blank',
          q: 'Loop over the numbers 1 through 5.',
          code: 'for i in range(____, ____):\n    print(i)',
          bank: ['1', '6', '5', '0'],
          answer: ['1', '6'],
          explain: 'range(start, stop) includes start and excludes stop, so stop must be 6.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for c in "hi":\n    print(c)',
          options: ['h\ni', 'hi', 'h i', '2'],
          answer: 0,
          explain: 'Strings are iterable, one character at a time.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for i, v in enumerate(["a", "b"]):\n    print(i, v)',
          options: ['0 a\n1 b', 'a 0\nb 1', '1 a\n2 b', 'a\nb'],
          answer: 0,
          explain: 'enumerate() yields (index, value) pairs, starting at 0 unless you pass start=.'
        },
        {
          type: 'code',
          q: 'Print the squares of 1 through 5, one per line.',
          starter: '',
          expectOutput: '1\n4\n9\n16\n25',
          explain: 'for i in range(1, 6): print(i ** 2).'
        }
      ]
    },
    {
      id: 'u5l3',
      title: 'while, break, continue',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1',
          options: ['3\n2\n1', '3\n2\n1\n0', '2\n1\n0', 'infinite loop'],
          answer: 0,
          explain: 'The loop stops as soon as the condition is false, before printing 0.'
        },
        {
          type: 'mcq',
          q: 'What happens if you forget n -= 1 in that loop?',
          options: ['It loops forever', 'It runs once', 'SyntaxError', 'It stops after 100 rounds'],
          answer: 0,
          explain: 'The condition never becomes false. Every while loop needs something that changes it.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for i in range(5):\n    if i == 2:\n        break\n    print(i)',
          options: ['0\n1', '0\n1\n3\n4', '0\n1\n2', '2'],
          answer: 0,
          explain: 'break leaves the loop immediately, skipping the rest of the iterations.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for i in range(4):\n    if i == 2:\n        continue\n    print(i)',
          options: ['0\n1\n3', '0\n1', '0\n1\n2\n3', '2'],
          answer: 0,
          explain: 'continue skips the rest of this round only, then carries on with the next value.'
        },
        {
          type: 'blank',
          q: 'Stop the loop as soon as a negative number appears.',
          code: 'for n in nums:\n    if n < 0:\n        ____\n    print(n)',
          bank: ['break', 'continue', 'return', 'pass'],
          answer: ['break'],
          explain: 'return only works inside a function; pass would do nothing at all.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'for i in range(2):\n    print(i)\nelse:\n    print("done")',
          options: ['0\n1\ndone', '0\n1', 'done', 'SyntaxError'],
          answer: 0,
          explain: 'A loop else runs when the loop finishes without hitting break.'
        }
      ]
    },
    {
      id: 'u5l4',
      title: 'Loop Patterns',
      exercises: [
        {
          type: 'code',
          q: 'Given nums = [4, 8, 15], print their total.',
          starter: 'nums = [4, 8, 15]\n',
          expectOutput: '27',
          explain: 'print(sum(nums)), or accumulate with a running total in a for loop.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print([x * 2 for x in [1, 2, 3]])',
          options: ['[2, 4, 6]', '[1, 2, 3, 1, 2, 3]', '[2, 4, 6, 8]', '12'],
          answer: 0,
          explain: 'That is a list comprehension: expression, then for, then optional if.'
        },
        {
          type: 'blank',
          q: 'Keep only the even numbers.',
          code: 'evens = [n for n in nums ____ n % 2 == 0]',
          bank: ['if', 'where', 'when', 'and'],
          answer: ['if'],
          explain: 'A trailing if filters items. An if before for would be a conditional expression instead.'
        },
        {
          type: 'order',
          q: 'Arrange a program that finds the largest number in nums.',
          lines: ['nums = [3, 9, 2]', 'best = nums[0]', 'for n in nums:', '    if n > best:', '        best = n', 'print(best)'],
          explain: 'Seed the accumulator with the first item, then compare each remaining item against it.'
        },
        {
          type: 'code',
          q: 'Print the numbers 1 to 5 on one line separated by spaces (1 2 3 4 5).',
          starter: '',
          expectOutput: '1 2 3 4 5',
          explain: 'print(*range(1, 6)) unpacks the range as separate arguments.'
        },
        {
          type: 'bug',
          q: 'Click the line with the bug.',
          brief: 'This should add up the list, but always prints the last number.',
          lines: ['nums = [4, 8, 15]', 'total = 0', 'for n in nums:', '    total = n', 'print(total)'],
          answer: 3,
          explain: 'Plain = overwrites the accumulator each round. It should be total += n.'
        },
        {
          type: 'mcq',
          q: 'Why is modifying a list while looping over it risky?',
          options: ['Items get skipped as indexes shift', 'It raises SyntaxError', 'The loop never ends', 'Lists become read-only in loops'],
          answer: 0,
          explain: 'Iterate over a copy (for x in items[:]) or build a new list instead.'
        }
      ]
    }
  ]
};
