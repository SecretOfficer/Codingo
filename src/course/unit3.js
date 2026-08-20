export default {
  id: 'u3',
  title: 'Strings',
  subtitle: 'Text, slicing and methods',
  color: '#ce82ff',
  icon: 'STR',
  lessons: [
    {
      id: 'u3l1',
      title: 'Indexing',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "python"\nprint(s[0])',
          options: ['p', 'y', 'python', '0'],
          answer: 0,
          explain: 'Indexing starts at 0, so s[0] is the first character.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "python"\nprint(s[-1])',
          options: ['n', 'p', 'o', 'IndexError'],
          answer: 0,
          explain: 'Negative indexes count from the end, so -1 is the last character.'
        },
        {
          type: 'blank',
          q: 'Get the length of the string.',
          code: 's = "hello"\nprint(____(s))  # 5',
          bank: ['len', 'length', 'size', 'count'],
          answer: ['len'],
          explain: 'len() works on strings, lists, tuples, dicts and sets.'
        },
        {
          type: 'mcq',
          q: 'What happens here?',
          code: 's = "abc"\ns[0] = "z"',
          options: ['TypeError - strings are immutable', 'Works, s becomes zbc', 'IndexError', 'SyntaxError'],
          answer: 0,
          explain: 'Strings cannot be changed in place. Build a new string instead: "z" + s[1:].'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("ab" * 3)',
          options: ['ababab', 'ab3', 'ab ab ab', 'TypeError'],
          answer: 0,
          explain: 'Multiplying a string by an int repeats it.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("y" in "python")',
          options: ['True', 'False', '1', 'y'],
          answer: 0,
          explain: 'The in operator tests for a substring and returns a bool.'
        }
      ]
    },
    {
      id: 'u3l2',
      title: 'Slicing',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "codingo"\nprint(s[0:3])',
          options: ['cod', 'codi', 'odi', 'c'],
          answer: 0,
          explain: 'A slice includes the start index and excludes the stop index.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "codingo"\nprint(s[3:])',
          options: ['ingo', 'cod', 'ing', 'o'],
          answer: 0,
          explain: 'Leaving the stop out means "to the end".'
        },
        {
          type: 'blank',
          q: 'Reverse the string with a slice.',
          code: 's = "abc"\nprint(s[____])  # cba',
          bank: ['::-1', ':-1', '-1:', '::1'],
          answer: ['::-1'],
          explain: 'The third slice value is the step. A step of -1 walks backwards.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "abcdef"\nprint(s[1:5:2])',
          options: ['bd', 'bcde', 'ace', 'bdf'],
          answer: 0,
          explain: 'Start at 1, stop before 5, take every second character: b then d.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "abc"\nprint(s[10:20])',
          options: ['(empty string)', 'IndexError', 'abc', 'None'],
          answer: 0,
          explain: 'Out-of-range slices are clipped and return an empty string. Only indexing raises IndexError.'
        },
        {
          type: 'code',
          q: 'Given word = "codingo", print its last three characters.',
          starter: 'word = "codingo"\n',
          expectOutput: 'ngo',
          explain: 'print(word[-3:]) takes the final three characters.'
        }
      ]
    },
    {
      id: 'u3l3',
      title: 'String Methods',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("Hello".upper())',
          options: ['HELLO', 'hello', 'Hello', 'None'],
          answer: 0,
          explain: 'upper() returns a new uppercase string; the original is untouched.'
        },
        {
          type: 'blank',
          q: 'Remove the spaces at both ends.',
          code: 's = "  hi  "\nprint(s.____())  # hi',
          bank: ['strip', 'trim', 'clean', 'cut'],
          answer: ['strip'],
          explain: 'strip() removes leading and trailing whitespace. lstrip() and rstrip() do one side.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("a,b,c".split(","))',
          options: ["['a', 'b', 'c']", "'a b c'", "['a,b,c']", "('a', 'b', 'c')"],
          answer: 0,
          explain: 'split() cuts the string on the separator and returns a list.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("-".join(["x", "y", "z"]))',
          options: ['x-y-z', 'xyz', "['x-y-z']", 'x y z'],
          answer: 0,
          explain: 'join() is called on the glue string, with the pieces as the argument.'
        },
        {
          type: 'match',
          q: 'Match each method with what it returns.',
          pairs: [['"ab".replace("a","z")', 'zb'], ['"abc".find("c")', '2'], ['"AB".lower()', 'ab'], ['"a b".count(" ")', '1']],
          explain: 'find() returns -1 when the substring is missing, unlike index() which raises.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 's = "hi"\ns.upper()\nprint(s)',
          options: ['hi', 'HI', 'None', 'TypeError'],
          answer: 0,
          explain: 'String methods return new strings. Without reassigning, s never changes.'
        }
      ]
    },
    {
      id: 'u3l4',
      title: 'Working With Text',
      exercises: [
        {
          type: 'code',
          q: 'Given s = "Codingo", print it in all caps.',
          starter: 's = "Codingo"\n',
          expectOutput: 'CODINGO',
          explain: 'print(s.upper()).'
        },
        {
          type: 'order',
          q: 'Arrange the program so it prints ADA.',
          lines: ['name = " ada "', 'name = name.strip()', 'name = name.upper()', 'print(name)'],
          explain: 'Each step reassigns name, because string methods return new values.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("Hi\\nThere")',
          options: ['Hi\nThere', 'Hi\\nThere', 'HiThere', 'Hi There'],
          answer: 0,
          explain: '\\n is an escape sequence meaning newline.'
        },
        {
          type: 'blank',
          q: 'Make the backslash print literally.',
          code: 'print(____"C:\\new")  # C:\\new',
          bank: ['r', 'f', 'b', 'u'],
          answer: ['r'],
          explain: 'An r prefix makes a raw string, where backslashes are not escapes.'
        },
        {
          type: 'code',
          q: 'Given s = "python", print True if it starts with "py", else False.',
          starter: 's = "python"\n',
          expectOutput: 'True',
          explain: 'print(s.startswith("py")).'
        },
        {
          type: 'mcq',
          q: 'Which check tells you a string contains only digits?',
          options: ['s.isdigit()', 's.isnumber()', 'int(s)', 's.digit()'],
          answer: 0,
          explain: 'isdigit() returns a bool without raising, unlike int() which throws ValueError.'
        }
      ]
    }
  ]
};
