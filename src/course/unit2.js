export default {
  id: 'u2',
  title: 'Variables & Types',
  subtitle: 'Boxes that hold values',
  color: '#6a9cb0',
  icon: 'VAR',
  lessons: [
    {
      id: 'u2l1',
      title: 'Assignment',
      exercises: [
        {
          type: 'mcq',
          q: 'Which statement stores the value 10 in a variable named count?',
          options: ['count = 10', '10 = count', 'count == 10', 'let count = 10'],
          answer: 0,
          explain: 'A single = assigns. A double == compares. Python has no let keyword.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'x = 3\nx = x + 4\nprint(x)',
          options: ['7', '3', '4', '34'],
          answer: 0,
          explain: 'The right side is evaluated first (3 + 4), then the result is stored back into x.'
        },
        {
          type: 'blank',
          q: 'Add 5 to score using the shorthand operator.',
          code: 'score = 10\nscore ____ 5\nprint(score)  # 15',
          bank: ['+=', '=+', '++', 'add='],
          answer: ['+='],
          explain: 'score += 5 is shorthand for score = score + 5. Python has no ++ operator.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'a, b = 1, 2\na, b = b, a\nprint(a, b)',
          options: ['2 1', '1 2', '1 1', 'SyntaxError'],
          answer: 0,
          explain: 'Tuple unpacking swaps both values in one step, with no temporary variable.'
        },
        {
          type: 'mcq',
          q: 'What happens here?',
          code: 'print(total)\ntotal = 5',
          options: ['NameError - total is used before assignment', 'Prints 5', 'Prints None', 'Prints 0'],
          answer: 0,
          explain: 'Names must exist before use. Python reads the file top to bottom.'
        },
        {
          type: 'type',
          q: 'Type the statement that stores the string "cat" in a variable named pet.',
          answer: ['pet = "cat"', "pet = 'cat'", 'pet="cat"', "pet='cat'"],
          explain: 'Spaces around = are style, not syntax, but PEP 8 recommends them.'
        }
      ]
    },
    {
      id: 'u2l2',
      title: 'Numbers',
      exercises: [
        {
          type: 'mcq',
          q: 'What type is 3.0?',
          options: ['float', 'int', 'decimal', 'double'],
          answer: 0,
          explain: 'Any number with a decimal point is a float. Python has no separate double type.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(7 / 2)',
          options: ['3.5', '3', '4', '3.0'],
          answer: 0,
          explain: 'A single / is true division and always returns a float.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(7 // 2, 7 % 2)',
          options: ['3 1', '3.5 1', '3 0.5', '4 1'],
          answer: 0,
          explain: '// floors the division, % gives the remainder.'
        },
        {
          type: 'blank',
          q: 'Raise 2 to the power of 10.',
          code: 'print(2 ____ 10)  # 1024',
          bank: ['**', '^', 'pow', '*'],
          answer: ['**'],
          explain: '** is exponentiation. In Python ^ is bitwise XOR.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(round(2.675, 2))',
          options: ['2.67', '2.68', '2.7', '3'],
          answer: 0,
          explain: 'Binary floats cannot store 2.675 exactly, so round() sees a value slightly below it.'
        },
        {
          type: 'code',
          q: 'Print the remainder when 17 is divided by 5.',
          starter: '',
          expectOutput: '2',
          explain: 'print(17 % 5) gives 2.'
        }
      ]
    },
    {
      id: 'u2l3',
      title: 'Types & Casting',
      exercises: [
        {
          type: 'mcq',
          q: 'What does type("5") return?',
          options: ["<class 'str'>", "<class 'int'>", "<class 'number'>", '5'],
          answer: 0,
          explain: 'Quotes make it a string, whatever is inside them.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(int("42") + 8)',
          options: ['50', '428', 'TypeError', '"50"'],
          answer: 0,
          explain: 'int() converts the string to a number first, so + adds instead of concatenating.'
        },
        {
          type: 'mcq',
          q: 'What does this raise?',
          code: 'print("age: " + 30)',
          options: ['TypeError', 'ValueError', 'Prints age: 30', 'NameError'],
          answer: 0,
          explain: 'TypeError: can only concatenate str (not "int") to str. Use str(30) or an f-string.'
        },
        {
          type: 'blank',
          q: 'Convert the float to an int.',
          code: 'x = ____(9.99)\nprint(x)  # 9',
          bank: ['int', 'float', 'round', 'str'],
          answer: ['int'],
          explain: 'int() truncates toward zero, it does not round. round(9.99) would give 10.'
        },
        {
          type: 'match',
          q: 'Match each value to its type.',
          pairs: [['42', 'int'], ['4.2', 'float'], ['"42"', 'str'], ['True', 'bool']],
          explain: 'bool is actually a subclass of int, so True == 1.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(bool(0), bool(""), bool("0"))',
          options: ['False False True', 'False False False', 'True True True', '0  0'],
          answer: 0,
          explain: 'Zero and empty containers are falsy. The non-empty string "0" is truthy.'
        }
      ]
    },
    {
      id: 'u2l4',
      title: 'Input & f-strings',
      exercises: [
        {
          type: 'mcq',
          q: 'What type does input() always return?',
          options: ['str', 'int', 'float', 'it depends on what is typed'],
          answer: 0,
          explain: 'input() returns text. Convert it with int() or float() when you need a number.'
        },
        {
          type: 'blank',
          q: 'Read a number from the user and store it as an int.',
          code: 'age = ____(input("Age? "))',
          bank: ['int', 'str', 'float', 'number'],
          answer: ['int'],
          explain: 'Wrapping input() in int() converts the typed text to a whole number.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'name = "Ada"\nprint(f"Hi {name}!")',
          options: ['Hi Ada!', 'Hi {name}!', 'Hi name!', 'f"Hi Ada!"'],
          answer: 0,
          explain: 'The f prefix makes it an f-string: {name} is replaced by the value.'
        },
        {
          type: 'blank',
          q: 'Format pi to two decimal places.',
          code: 'pi = 3.14159\nprint(f"{pi____}")  # 3.14',
          bank: [':.2f', '.2f', '%.2f', ':2'],
          answer: [':.2f'],
          explain: 'Inside an f-string, a colon starts the format spec. .2f means fixed point, two decimals.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'a = 2\nprint(f"{a} + {a} = {a + a}")',
          options: ['2 + 2 = 4', '2 + 2 = 2 + 2', 'a + a = 4', '{2} + {2} = {4}'],
          answer: 0,
          explain: 'Any expression can go inside the braces, not just a bare name.'
        },
        {
          type: 'code',
          q: 'Set name to "Sam" and print exactly: Hello, Sam!',
          starter: 'name = "Sam"\n',
          expectOutput: 'Hello, Sam!',
          explain: 'print(f"Hello, {name}!") builds the line from the variable.'
        }
      ]
    }
  ]
};
