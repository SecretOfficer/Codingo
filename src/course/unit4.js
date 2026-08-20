export default {
  id: 'u4',
  title: 'Logic & Conditions',
  subtitle: 'Making decisions',
  color: '#ff9600',
  icon: 'IF',
  lessons: [
    {
      id: 'u4l1',
      title: 'Comparisons',
      exercises: [
        {
          type: 'mcq',
          q: 'Which operator tests equality?',
          options: ['==', '=', '===', 'eq'],
          answer: 0,
          explain: 'One = assigns, two == compare. Python has no ===.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(3 != 4, 3 >= 3)',
          options: ['True True', 'False True', 'True False', 'False False'],
          answer: 0,
          explain: '!= is "not equal". >= is true when the values are equal too.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(1 < 2 < 3)',
          options: ['True', 'False', 'TypeError', '1'],
          answer: 0,
          explain: 'Python allows chained comparisons; this means (1 < 2) and (2 < 3).'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("a" < "b")',
          options: ['True', 'False', 'TypeError', 'a'],
          answer: 0,
          explain: 'Strings compare lexicographically by character code.'
        },
        {
          type: 'mcq',
          q: 'What is the difference between == and is?',
          options: ['== compares values, is compares identity', 'They are identical', 'is only works on numbers', '== only works on strings'],
          answer: 0,
          explain: 'Two lists can be == while being different objects, so a is b would be False.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(0.1 + 0.2 == 0.3)',
          options: ['False', 'True', 'ValueError', '0.3'],
          answer: 0,
          explain: 'Floats are binary approximations. Compare with math.isclose() instead.'
        }
      ]
    },
    {
      id: 'u4l2',
      title: 'if / elif / else',
      exercises: [
        {
          type: 'blank',
          q: 'Complete the branch keyword.',
          code: 'x = 5\nif x > 3:\n    print("big")\n____:\n    print("small")',
          bank: ['else', 'elif', 'otherwise', 'default'],
          answer: ['else'],
          explain: 'else has no condition and needs no parentheses, just a colon.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'n = 0\nif n:\n    print("yes")\nelse:\n    print("no")',
          options: ['no', 'yes', 'nothing', 'TypeError'],
          answer: 0,
          explain: '0 is falsy, so the else branch runs.'
        },
        {
          type: 'order',
          q: 'Arrange a grade check that prints A for 90+, B for 80+, else C.',
          lines: ['score = 85', 'if score >= 90:', '    print("A")', 'elif score >= 80:', '    print("B")', 'else:', '    print("C")'],
          explain: 'Only the first matching branch runs, so order the conditions from strictest down.'
        },
        {
          type: 'mcq',
          q: 'What is wrong here?',
          code: 'if x > 5\n    print("hi")',
          options: ['Missing colon after the condition', 'Condition needs parentheses', 'print must be indented 8 spaces', 'Nothing is wrong'],
          answer: 0,
          explain: 'Every block header (if, for, def, class) ends with a colon.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'x = 10\nif x > 5:\n    print("a")\nif x > 8:\n    print("b")',
          options: ['a\nb', 'a', 'b', 'nothing'],
          answer: 0,
          explain: 'These are two separate if statements, so both conditions get tested.'
        },
        {
          type: 'code',
          q: 'Set n = 7 and print "odd" if n is odd, otherwise "even".',
          starter: 'n = 7\n',
          expectOutput: 'odd',
          explain: 'if n % 2 == 1: print("odd") else: print("even").'
        }
      ]
    },
    {
      id: 'u4l3',
      title: 'Boolean Logic',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(True and False, True or False)',
          options: ['False True', 'True False', 'False False', 'True True'],
          answer: 0,
          explain: 'and needs both sides true; or needs only one.'
        },
        {
          type: 'blank',
          q: 'Print True when age is between 13 and 19 inclusive.',
          code: 'age = 15\nprint(age >= 13 ____ age <= 19)',
          bank: ['and', 'or', '&&', 'not'],
          answer: ['and'],
          explain: 'Python spells the operators as words: and, or, not. && is not valid.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(not 0)',
          options: ['True', 'False', '1', 'TypeError'],
          answer: 0,
          explain: 'not converts to a bool and flips it. 0 is falsy, so not 0 is True.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'x = 0\nprint(x != 0 and 10 / x > 1)',
          options: ['False', 'ZeroDivisionError', 'True', 'None'],
          answer: 0,
          explain: 'and short circuits: the left side is False, so the division never runs.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("" or "fallback")',
          options: ['fallback', 'True', '""', 'False'],
          answer: 0,
          explain: 'or returns the first truthy operand itself, not a bool.'
        },
        {
          type: 'match',
          q: 'Match each expression to its value.',
          pairs: [['bool([])', 'False'], ['bool([0])', 'True'], ['None == False', 'False'], ['not not 5', 'True']],
          explain: 'An empty list is falsy, but a list holding a falsy value is still non-empty.'
        }
      ]
    },
    {
      id: 'u4l4',
      title: 'Branching Practice',
      exercises: [
        {
          type: 'code',
          q: 'Set temp = 30 and print "hot" if temp > 25, "mild" if temp > 15, else "cold".',
          starter: 'temp = 30\n',
          expectOutput: 'hot',
          explain: 'Use if / elif / else so only one branch runs.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'x = 5\nlabel = "big" if x > 3 else "small"\nprint(label)',
          options: ['big', 'small', 'True', 'SyntaxError'],
          answer: 0,
          explain: 'This is a conditional expression: value_if_true if condition else value_if_false.'
        },
        {
          type: 'blank',
          q: 'Check that letter is a vowel.',
          code: 'letter = "e"\nif letter ____ "aeiou":\n    print("vowel")',
          bank: ['in', 'is', 'has', '=='],
          answer: ['in'],
          explain: 'in tests membership, which works on strings, lists, tuples, sets and dict keys.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'if 3 > 2:\n    pass\nprint("done")',
          options: ['done', 'nothing', 'pass', 'IndentationError'],
          answer: 0,
          explain: 'pass is a no-op placeholder that keeps an otherwise empty block legal.'
        },
        {
          type: 'code',
          q: 'Set year = 2024 and print True if it is a leap year, else False.',
          starter: 'year = 2024\n',
          expectOutput: 'True',
          explain: 'A leap year is divisible by 4, except centuries not divisible by 400.'
        },
        {
          type: 'bug',
          q: 'Click the line with the bug.',
          brief: 'This should print "adult" for anyone 18 or over, but a 18 year old gets "minor".',
          lines: ['age = 18', 'if age > 18:', '    print("adult")', 'else:', '    print("minor")'],
          answer: 1,
          explain: 'The comparison excludes 18 itself. It needs >= rather than >.'
        },
        {
          type: 'mcq',
          q: 'How many branches of one if / elif / elif / else chain can run?',
          options: ['Exactly one', 'All that match', 'At most two', 'Zero or one'],
          answer: 0,
          explain: 'The chain stops at the first true condition; else guarantees one branch always runs.'
        }
      ]
    }
  ]
};
