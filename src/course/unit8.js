export default {
  id: 'u8',
  title: 'Classes & Errors',
  subtitle: 'Objects, exceptions, modules',
  color: '#9b6bc0',
  icon: 'OOP',
  lessons: [
    {
      id: 'u8l1',
      title: 'Classes',
      exercises: [
        {
          type: 'blank',
          q: 'Complete the keyword that defines a class.',
          code: '____ Dog:\n    pass',
          bank: ['class', 'def', 'struct', 'object'],
          answer: ['class'],
          explain: 'Class names use CapWords by convention.'
        },
        {
          type: 'mcq',
          q: 'When does __init__ run?',
          options: ['Every time an instance is created', 'Once when the class is defined', 'Only when you call it by name', 'When the object is deleted'],
          answer: 0,
          explain: '__init__ is the initialiser; it sets up the new instance passed in as self.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog("Rex")\nprint(d.name)',
          options: ['Rex', 'name', 'self.name', 'AttributeError'],
          answer: 0,
          explain: 'The argument "Rex" is stored on the instance as an attribute.'
        },
        {
          type: 'mcq',
          q: 'What is self?',
          options: ['The instance the method was called on', 'A reserved keyword', 'The class itself', 'The module'],
          answer: 0,
          explain: 'self is just the conventional name of the first parameter; Python passes the instance in automatically.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'class C:\n    def hi(self):\n        return "hi"\n\nprint(C().hi())',
          options: ['hi', 'None', '<bound method>', 'TypeError'],
          answer: 0,
          explain: 'C() builds an instance and .hi() calls the method on it.'
        },
        {
          type: 'code',
          q: 'Define class Point with x and y set in __init__, then print Point(2, 3).y.',
          starter: '',
          expectOutput: '3',
          explain: 'def __init__(self, x, y): self.x = x; self.y = y.'
        }
      ]
    },
    {
      id: 'u8l2',
      title: 'Methods & Inheritance',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'class A:\n    def hi(self):\n        return "A"\n\nclass B(A):\n    pass\n\nprint(B().hi())',
          options: ['A', 'B', 'None', 'AttributeError'],
          answer: 0,
          explain: 'B inherits everything from A because A is listed as its base class.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'class A:\n    def hi(self):\n        return "A"\n\nclass B(A):\n    def hi(self):\n        return "B" + super().hi()\n\nprint(B().hi())',
          options: ['BA', 'B', 'A', 'AB'],
          answer: 0,
          explain: 'super() reaches the parent implementation, letting you extend rather than replace it.'
        },
        {
          type: 'blank',
          q: 'Make print(obj) show a friendly string.',
          code: 'class P:\n    def ____(self):\n        return "point"',
          bank: ['__str__', '__print__', '__repr__()', 'toString'],
          answer: ['__str__'],
          explain: '__str__ is for humans; __repr__ is the unambiguous debugging form.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'class C:\n    count = 0\n    def __init__(self):\n        C.count += 1\n\nC(); C()\nprint(C.count)',
          options: ['2', '0', '1', 'AttributeError'],
          answer: 0,
          explain: 'count is a class attribute shared by every instance.'
        },
        {
          type: 'mcq',
          q: 'What does isinstance(b, A) return when class B(A) and b = B()?',
          options: ['True', 'False', 'TypeError', 'None'],
          answer: 0,
          explain: 'isinstance() accepts subclasses, unlike type(b) is A which is exact.'
        },
        {
          type: 'order',
          q: 'Arrange a class whose area() returns w * h.',
          lines: ['class Rect:', '    def __init__(self, w, h):', '        self.w = w', '        self.h = h', '    def area(self):', '        return self.w * self.h'],
          explain: 'Methods sit at the same indentation level inside the class body.'
        }
      ]
    },
    {
      id: 'u8l3',
      title: 'Errors',
      exercises: [
        {
          type: 'blank',
          q: 'Catch the failure instead of crashing.',
          code: 'try:\n    n = int("abc")\n____ ValueError:\n    print("bad number")',
          bank: ['except', 'catch', 'rescue', 'else'],
          answer: ['except'],
          explain: 'Python spells it except, and you name the exception class you expect.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'try:\n    print(1 / 0)\nexcept ZeroDivisionError:\n    print("nope")',
          options: ['nope', '0', 'inf', 'ZeroDivisionError'],
          answer: 0,
          explain: 'Dividing by zero raises ZeroDivisionError, which the handler intercepts.'
        },
        {
          type: 'match',
          q: 'Match each mistake with the exception it raises.',
          pairs: [['int("x")', 'ValueError'], ['[1][5]', 'IndexError'], ['{}["k"]', 'KeyError'], ['"a" + 1', 'TypeError']],
          explain: 'Catching the precise class beats a bare except, which also swallows typos.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'try:\n    print("a")\nfinally:\n    print("b")',
          options: ['a\nb', 'a', 'b', 'b\na'],
          answer: 0,
          explain: 'finally always runs, whether or not an exception was raised.'
        },
        {
          type: 'blank',
          q: 'Signal an error yourself.',
          code: 'if age < 0:\n    ____ ValueError("age must be positive")',
          bank: ['raise', 'throw', 'error', 'panic'],
          answer: ['raise'],
          explain: 'raise takes an exception instance, usually with a message explaining what went wrong.'
        },
        {
          type: 'bug',
          q: 'Click the line with the bug.',
          brief: 'This should catch a bad number, but the crash gets through anyway.',
          lines: ['try:', '    n = int("abc")', 'except KeyError:', '    print("bad number")'],
          answer: 2,
          explain: 'int("abc") raises ValueError, not KeyError, so the handler never matches.'
        },
        {
          type: 'mcq',
          q: 'Why avoid a bare "except:"?',
          options: ['It hides typos and interrupts, not just the error you expected', 'It is a SyntaxError', 'It is slower', 'It only catches SystemExit'],
          answer: 0,
          explain: 'Catch Exception at the widest, and prefer the specific class you can actually handle.'
        }
      ]
    },
    {
      id: 'u8l4',
      title: 'Files & Modules',
      exercises: [
        {
          type: 'blank',
          q: 'Open a file so it closes automatically.',
          code: '____ open("data.txt") as f:\n    text = f.read()',
          bank: ['with', 'using', 'try', 'for'],
          answer: ['with'],
          explain: 'The with statement closes the file even if the body raises.'
        },
        {
          type: 'mcq',
          q: 'Which mode overwrites an existing file?',
          options: ['"w"', '"r"', '"a"', '"x"'],
          answer: 0,
          explain: '"a" appends, "r" reads, and "x" fails when the file already exists.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'import math\nprint(math.floor(3.9))',
          options: ['3', '4', '3.9', 'ImportError'],
          answer: 0,
          explain: 'floor() rounds down toward negative infinity; ceil() rounds up.'
        },
        {
          type: 'blank',
          q: 'Import just one name from a module.',
          code: '____ random ____ choice\nprint(choice([1, 2, 3]))',
          bank: ['from', 'import', 'as', 'with'],
          answer: ['from', 'import'],
          explain: 'from MODULE import NAME binds the name directly in your namespace.'
        },
        {
          type: 'mcq',
          q: 'What does if __name__ == "__main__": guard?',
          options: ['Code that should run only when the file is executed directly', 'Code that runs on import', 'The entry point of every function', 'Private class members'],
          answer: 0,
          explain: 'When a module is imported, __name__ is the module name, so the block is skipped.'
        },
        {
          type: 'code',
          q: 'Write "hi" to out.txt, read it back, and print what you read.',
          starter: '',
          expectOutput: 'hi',
          explain: 'Open with "w" to write, then reopen with "r" to read, both inside with blocks.'
        }
      ]
    }
  ]
};
