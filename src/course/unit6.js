export default {
  id: 'u6',
  title: 'Functions',
  subtitle: 'Package your logic',
  color: '#2ec4b6',
  icon: 'DEF',
  lessons: [
    {
      id: 'u6l1',
      title: 'Defining Functions',
      exercises: [
        {
          type: 'blank',
          q: 'Complete the keyword that defines a function.',
          code: '____ greet():\n    print("hi")',
          bank: ['def', 'function', 'fn', 'lambda'],
          answer: ['def'],
          explain: 'def NAME(params): opens a function body, which must be indented.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def greet():\n    print("hi")\n\ngreet()',
          options: ['hi', 'nothing', 'greet', 'None'],
          answer: 0,
          explain: 'Defining a function does not run it. The call greet() does.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def greet():\n    print("hi")\n\nprint(greet())',
          options: ['hi\nNone', 'hi', 'None', 'hi\nhi'],
          answer: 0,
          explain: 'A function with no return statement returns None, which print then displays.'
        },
        {
          type: 'mcq',
          q: 'What is the difference between print and return?',
          options: ['return hands a value back to the caller; print only shows text', 'They are the same', 'return only works in loops', 'print is faster'],
          answer: 0,
          explain: 'You cannot do maths with what print displays, but you can with what return gives you.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def double(n):\n    return n * 2\n\nprint(double(5))',
          options: ['10', '5', 'None', '55'],
          answer: 0,
          explain: 'The argument 5 binds to the parameter n, and the result comes back to print.'
        },
        {
          type: 'code',
          q: 'Write a function square(n) that returns n squared, then print square(6).',
          starter: '',
          expectOutput: '36',
          explain: 'def square(n): return n ** 2, then print(square(6)).'
        }
      ]
    },
    {
      id: 'u6l2',
      title: 'Arguments',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def sub(a, b):\n    return a - b\n\nprint(sub(b=2, a=10))',
          options: ['8', '-8', '10', 'TypeError'],
          answer: 0,
          explain: 'Keyword arguments bind by name, so the order in the call does not matter.'
        },
        {
          type: 'blank',
          q: 'Give greeting a default value of "hi".',
          code: 'def greet(name, greeting____):\n    print(greeting, name)',
          bank: ['="hi"', '="hi",', ':"hi"', '=hi'],
          answer: ['="hi"'],
          explain: 'Defaults use = in the parameter list. Parameters with defaults must come last.'
        },
        {
          type: 'mcq',
          q: 'What does this raise?',
          code: 'def f(a, b):\n    return a\n\nf(1)',
          options: ['TypeError - missing argument b', 'NameError', 'It returns 1', 'SyntaxError'],
          answer: 0,
          explain: 'TypeError: f() missing 1 required positional argument: b.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3))',
          options: ['6', '3', '[1, 2, 3]', 'TypeError'],
          answer: 0,
          explain: '*nums collects any number of positional arguments into a tuple.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def show(**kw):\n    print(kw)\n\nshow(a=1)',
          options: ["{'a': 1}", '(1,)', 'a=1', 'TypeError'],
          answer: 0,
          explain: '**kw collects keyword arguments into a dict.'
        },
        {
          type: 'mcq',
          q: 'Why is def f(items=[]) a classic bug?',
          options: ['The default list is created once and shared across all calls', 'Lists cannot be defaults', 'It raises SyntaxError', 'It copies the list every call'],
          answer: 0,
          explain: 'Use items=None and build a fresh list inside the body instead.'
        }
      ]
    },
    {
      id: 'u6l3',
      title: 'Scope & Return',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'x = 1\n\ndef f():\n    x = 2\n\nf()\nprint(x)',
          options: ['1', '2', 'None', 'UnboundLocalError'],
          answer: 0,
          explain: 'Assigning inside a function creates a local name; the global x is untouched.'
        },
        {
          type: 'blank',
          q: 'Let the function rebind the module-level counter.',
          code: 'count = 0\n\ndef bump():\n    ____ count\n    count += 1',
          bank: ['global', 'nonlocal', 'static', 'extern'],
          answer: ['global'],
          explain: 'nonlocal targets an enclosing function scope, not the module level.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def f():\n    return 1\n    print("after")\n\nprint(f())',
          options: ['1', 'after\n1', '1\nafter', 'None'],
          answer: 0,
          explain: 'return exits immediately, so any code after it in that path is dead.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def stats():\n    return 1, 2\n\na, b = stats()\nprint(b)',
          options: ['2', '1', '(1, 2)', 'TypeError'],
          answer: 0,
          explain: 'Returning several values really returns one tuple, which unpacking then splits.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'def f(lst):\n    lst.append(4)\n\nn = [1]\nf(n)\nprint(n)',
          options: ['[1, 4]', '[1]', 'None', '[4]'],
          answer: 0,
          explain: 'The parameter points at the same list object, so mutating it is visible to the caller.'
        },
        {
          type: 'bug',
          q: 'Click the line with the bug.',
          brief: 'double(5) should print 10 but prints None.',
          lines: ['def double(n):', '    print(n * 2)', '', 'print(double(5))'],
          answer: 1,
          explain: 'The function prints instead of returning, so it hands back None. It needs return n * 2.'
        },
        {
          type: 'code',
          q: 'Write is_even(n) returning True/False, then print is_even(10).',
          starter: '',
          expectOutput: 'True',
          explain: 'def is_even(n): return n % 2 == 0.'
        }
      ]
    },
    {
      id: 'u6l4',
      title: 'Lambdas & Built-ins',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'f = lambda x: x + 1\nprint(f(4))',
          options: ['5', '4', 'lambda', 'TypeError'],
          answer: 0,
          explain: 'A lambda is a one-expression anonymous function; its value is returned automatically.'
        },
        {
          type: 'blank',
          q: 'Sort the words by length.',
          code: 'words = ["ccc", "a", "bb"]\nwords.sort(____=len)\nprint(words)  # [\'a\', \'bb\', \'ccc\']',
          bank: ['key', 'by', 'cmp', 'sort'],
          answer: ['key'],
          explain: 'key takes a function applied to each item to produce the sort value.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(list(map(str, [1, 2])))',
          options: ["['1', '2']", '[1, 2]', "'12'", '[str, str]'],
          answer: 0,
          explain: 'map() applies a function lazily; list() forces it into a list.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(list(filter(lambda n: n > 1, [0, 1, 2, 3])))',
          options: ['[2, 3]', '[0, 1]', '[1, 2, 3]', '[True, True]'],
          answer: 0,
          explain: 'filter() keeps items for which the function returns something truthy.'
        },
        {
          type: 'match',
          q: 'Match each built-in with what it does.',
          pairs: [['abs(-3)', '3'], ['max([1, 9])', '9'], ['sorted("ba")', "['a', 'b']"], ['len("abc")', '3']],
          explain: 'sorted() always returns a list, even when the input is a string.'
        },
        {
          type: 'code',
          q: 'Given words = ["pear", "fig", "apple"], print the longest word.',
          starter: 'words = ["pear", "fig", "apple"]\n',
          expectOutput: 'apple',
          explain: 'print(max(words, key=len)).'
        }
      ]
    }
  ]
};
