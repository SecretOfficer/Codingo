export default {
  id: 'u1',
  title: 'First Steps',
  subtitle: 'Say hello to Python',
  color: '#7fa650',
  icon: 'PY',
  lessons: [
    {
      id: 'u1l1',
      title: 'Hello, Python',
      exercises: [
        {
          type: 'mcq',
          q: 'Which line prints Hello to the screen?',
          options: ['print("Hello")', 'echo "Hello"', 'console.log("Hello")', 'printf("Hello")'],
          answer: 0,
          explain: 'Python uses the built-in function print(). echo is a shell command, console.log is JavaScript.'
        },
        {
          type: 'blank',
          q: 'Complete the line so it prints Codingo.',
          code: '____("Codingo")',
          bank: ['print', 'write', 'say', 'echo'],
          answer: ['print'],
          explain: 'print() sends text to standard output.'
        },
        {
          type: 'output',
          q: 'What does this program print?',
          code: 'print("Hello")\nprint("World")',
          options: ['Hello\nWorld', 'HelloWorld', 'Hello World', 'World\nHello'],
          answer: 0,
          explain: 'Each print() call ends with a newline, so the two words land on separate lines.'
        },
        {
          type: 'mcq',
          q: 'What does this line do?',
          code: '# print("secret")',
          options: ['Nothing - it is a comment', 'Prints secret', 'Prints # secret', 'Causes an error'],
          answer: 0,
          explain: 'Everything after # on a line is a comment. Python ignores it completely.'
        },
        {
          type: 'type',
          q: 'Type a line that prints the word Python (quotes included).',
          answer: ['print("Python")', "print('Python')"],
          explain: 'Single and double quotes both work for strings in Python.'
        },
        {
          type: 'mcq',
          q: 'Why does this fail?',
          code: 'print("Hello)',
          options: ['The closing quote is missing', 'print must be capitalised', 'Strings need single quotes', 'A semicolon is required'],
          answer: 0,
          explain: 'Python raises SyntaxError: unterminated string literal. Quotes must come in pairs.'
        }
      ]
    },
    {
      id: 'u1l2',
      title: 'Printing More',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("Hi", "there")',
          options: ['Hi there', 'Hithere', 'Hi,there', '"Hi" "there"'],
          answer: 0,
          explain: 'print() joins multiple arguments with a single space by default.'
        },
        {
          type: 'blank',
          q: 'Print the two words with no space between them.',
          code: 'print("Cod", "ingo", sep=____)',
          bank: ['""', '" "', 'None', '0'],
          answer: ['""'],
          explain: 'sep controls the separator between arguments. An empty string glues them together.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("a", end="-")\nprint("b")',
          options: ['a-b', 'a\nb', 'ab-', 'a-\nb'],
          answer: 0,
          explain: 'end replaces the trailing newline, so the second print continues on the same line.'
        },
        {
          type: 'mcq',
          q: 'What does print() with no arguments do?',
          options: ['Prints an empty line', 'Prints None', 'Raises TypeError', 'Prints a space'],
          answer: 0,
          explain: 'It prints nothing followed by the default end newline, giving a blank line.'
        },
        {
          type: 'order',
          q: 'Arrange the program so it prints 1 then 2 then 3.',
          lines: ['print(1)', 'print(2)', 'print(3)'],
          explain: 'Python runs statements top to bottom, one after another.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print("2" + "2")',
          options: ['22', '4', '2 2', 'TypeError'],
          answer: 0,
          explain: 'Both operands are strings, so + concatenates instead of adding.'
        }
      ]
    },
    {
      id: 'u1l3',
      title: 'Syntax Rules',
      exercises: [
        {
          type: 'mcq',
          q: 'Which name is a valid Python variable?',
          options: ['user_name', '2fast', 'class', 'my-var'],
          answer: 0,
          explain: 'Names may contain letters, digits and underscores but cannot start with a digit, contain a hyphen, or reuse a keyword like class.'
        },
        {
          type: 'mcq',
          q: 'Python decides where a block starts and ends by looking at...',
          options: ['Indentation', 'Curly braces', 'Semicolons', 'The end keyword'],
          answer: 0,
          explain: 'Indentation is part of the grammar in Python, not just style.'
        },
        {
          type: 'mcq',
          q: 'What error does this raise?',
          code: 'print("a")\n  print("b")',
          options: ['IndentationError', 'ZeroDivisionError', 'NameError', 'No error'],
          answer: 0,
          explain: 'The second line is indented for no reason, so Python raises IndentationError: unexpected indent.'
        },
        {
          type: 'match',
          q: 'Match each symbol with its job.',
          pairs: [['#', 'starts a comment'], ['"..."', 'makes a string'], [':', 'opens a block'], ['=', 'assigns a value']],
          explain: 'These four symbols show up in almost every Python program.'
        },
        {
          type: 'mcq',
          q: 'Is Python case sensitive?',
          options: ['Yes - Name and name are different', 'No - names are lowercased', 'Only inside functions', 'Only for keywords'],
          answer: 0,
          explain: 'Identifiers are case sensitive, so Print("x") raises NameError.'
        },
        {
          type: 'type',
          q: 'Type the keyword that represents "no value" in Python.',
          answer: ['None'],
          caseSensitive: true,
          explain: 'None is Python null object. It is spelled with a capital N.'
        }
      ]
    },
    {
      id: 'u1l4',
      title: 'Your First Program',
      exercises: [
        {
          type: 'code',
          q: 'Print exactly: Hello, Codingo!',
          starter: '',
          expectOutput: 'Hello, Codingo!',
          explain: 'A single print() call with the exact text does the job.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'name = "Ada"\nprint("Hi,", name)',
          options: ['Hi, Ada', 'Hi, name', 'Hi,Ada', 'Hi, "Ada"'],
          answer: 0,
          explain: 'The variable is replaced by its value; quotes are not part of the value.'
        },
        {
          type: 'code',
          q: 'Print the three numbers 1, 2 and 3, each on its own line.',
          starter: '',
          expectOutput: '1\n2\n3',
          explain: 'Three print() calls, or one loop, both work.'
        },
        {
          type: 'blank',
          q: 'Store 7 in a variable called lucky, then print it.',
          code: 'lucky = ____\nprint(lucky)',
          bank: ['7', '"7"', 'seven', 'lucky'],
          answer: ['7'],
          explain: '7 is the integer. "7" would be a string, which prints the same but behaves differently in maths.'
        },
        {
          type: 'mcq',
          q: 'What is the file extension for a Python source file?',
          options: ['.py', '.pyt', '.python', '.p'],
          answer: 0,
          explain: 'Python modules and scripts end in .py.'
        },
        {
          type: 'bug',
          q: 'Click the line that stops this program from running.',
          brief: 'It should print a greeting twice.',
          lines: ['name = "Ada"', 'print("Hello", name)', 'Print("Hello again", name)'],
          answer: 2,
          explain: 'Python is case sensitive: Print is not defined, only print. The line raises NameError.'
        },
        {
          type: 'code',
          q: 'Print the result of 12 multiplied by 12.',
          starter: '',
          expectOutput: '144',
          explain: 'print(12 * 12) prints the number 144 with no quotes.'
        }
      ]
    }
  ]
};
