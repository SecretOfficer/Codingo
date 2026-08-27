export default {
  id: 'u7',
  title: 'Dicts, Sets & Tuples',
  subtitle: 'Choosing the right container',
  color: '#e0a83c',
  icon: 'MAP',
  lessons: [
    {
      id: 'u7l1',
      title: 'Dictionaries',
      exercises: [
        {
          type: 'output',
          q: 'What is printed?',
          code: 'person = {"name": "Ada", "age": 36}\nprint(person["name"])',
          options: ['Ada', 'name', '36', 'KeyError'],
          answer: 0,
          explain: 'Dicts are looked up by key, not by position.'
        },
        {
          type: 'mcq',
          q: 'What does person["job"] raise when the key is absent?',
          options: ['KeyError', 'IndexError', 'ValueError', 'It returns None'],
          answer: 0,
          explain: 'Use person.get("job") to get None instead, or a default: person.get("job", "none").'
        },
        {
          type: 'blank',
          q: 'Read city safely with a fallback of "unknown".',
          code: 'print(data.____("city", "unknown"))',
          bank: ['get', 'find', 'fetch', 'key'],
          answer: ['get'],
          explain: 'get() never raises; the second argument is the default.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'd = {"a": 1}\nd["b"] = 2\nprint(len(d))',
          options: ['2', '1', '3', 'KeyError'],
          answer: 0,
          explain: 'Assigning to a missing key inserts it. len() counts the keys.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'd = {"a": 1, "b": 2}\nfor k in d:\n    print(k)',
          options: ['a\nb', '1\n2', "('a', 1)\n('b', 2)", 'a b'],
          answer: 0,
          explain: 'Iterating a dict yields its keys. Use .values() or .items() for the rest.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'd = {"a": 1}\nfor k, v in d.items():\n    print(k, v)',
          options: ['a 1', "('a', 1)", 'a', '1'],
          answer: 0,
          explain: 'items() yields (key, value) tuples, which the loop unpacks into k and v.'
        }
      ]
    },
    {
      id: 'u7l2',
      title: 'Dict Patterns',
      exercises: [
        {
          type: 'blank',
          q: 'Count how many times each letter appears.',
          code: 'counts = {}\nfor c in "aab":\n    counts[c] = counts.get(c, ____) + 1\nprint(counts)',
          bank: ['0', '1', 'None', 'c'],
          answer: ['0'],
          explain: 'The default of 0 means the first sighting becomes 1.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'd = {"a": 1, "b": 2}\nprint("a" in d, 1 in d)',
          options: ['True False', 'True True', 'False True', 'False False'],
          answer: 0,
          explain: 'in checks keys, never values. Use "1 in d.values()" for the other test.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'd = {"a": 1}\nd.update({"a": 9, "b": 2})\nprint(d)',
          options: ["{'a': 9, 'b': 2}", "{'a': 1, 'b': 2}", "{'a': 9}", 'KeyError'],
          answer: 0,
          explain: 'update() overwrites existing keys and adds new ones.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'd = {"a": 1, "b": 2}\nprint({k: v * 10 for k, v in d.items()})',
          options: ["{'a': 10, 'b': 20}", "{'a': 1, 'b': 2}", '[10, 20]', 'SyntaxError'],
          answer: 0,
          explain: 'A dict comprehension builds key: value pairs from any iterable.'
        },
        {
          type: 'mcq',
          q: 'Which value can NOT be used as a dict key?',
          options: ['a list', 'a string', 'a tuple of ints', 'an int'],
          answer: 0,
          explain: 'Keys must be hashable. Lists are mutable and therefore unhashable.'
        },
        {
          type: 'bug',
          q: 'Click the line that raises KeyError.',
          brief: 'This should count how often each word appears.',
          lines: ['counts = {}', 'for w in text.split():', '    counts[w] += 1', 'print(counts)'],
          answer: 2,
          explain: 'The key does not exist yet on the first sighting. Use counts[w] = counts.get(w, 0) + 1.'
        },
        {
          type: 'code',
          q: 'Given scores = {"a": 3, "b": 7}, print the key with the highest value.',
          starter: 'scores = {"a": 3, "b": 7}\n',
          expectOutput: 'b',
          explain: 'print(max(scores, key=scores.get)).'
        }
      ]
    },
    {
      id: 'u7l3',
      title: 'Tuples & Sets',
      exercises: [
        {
          type: 'mcq',
          q: 'How does a tuple differ from a list?',
          options: ['A tuple cannot be changed after creation', 'A tuple can only hold numbers', 'A tuple is unordered', 'A tuple has no length'],
          answer: 0,
          explain: 'Because tuples are immutable and hashable, they can be dict keys and set members.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print(type((5)))',
          options: ["<class 'int'>", "<class 'tuple'>", "<class 'list'>", 'SyntaxError'],
          answer: 0,
          explain: 'The comma makes a tuple, not the parentheses. (5,) would be a one-item tuple.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'print({1, 2, 2, 3})',
          options: ['{1, 2, 3}', '{1, 2, 2, 3}', '[1, 2, 3]', '{1: 2, 2: 3}'],
          answer: 0,
          explain: 'Sets drop duplicates and have no defined order.'
        },
        {
          type: 'blank',
          q: 'Remove duplicates from the list, keeping a list as the result.',
          code: 'nums = [1, 1, 2]\nprint(list(____(nums)))  # [1, 2]',
          bank: ['set', 'dict', 'tuple', 'unique'],
          answer: ['set'],
          explain: 'set() dedupes but loses order; dict.fromkeys() dedupes and keeps it.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'a = {1, 2}\nb = {2, 3}\nprint(a & b, a | b)',
          options: ['{2} {1, 2, 3}', '{1, 3} {2}', '{2} {2}', 'TypeError'],
          answer: 0,
          explain: '& is intersection, | is union, - is difference, ^ is symmetric difference.'
        },
        {
          type: 'mcq',
          q: 'Why is "x in big_set" usually faster than "x in big_list"?',
          options: ['Sets hash the value instead of scanning every item', 'Sets are sorted', 'Lists are stored on disk', 'They are the same speed'],
          answer: 0,
          explain: 'Set lookup is roughly O(1); list membership is O(n).'
        }
      ]
    },
    {
      id: 'u7l4',
      title: 'Container Practice',
      exercises: [
        {
          type: 'code',
          q: 'Given text = "the cat the dog", print how many times "the" appears.',
          starter: 'text = "the cat the dog"\n',
          expectOutput: '2',
          explain: 'print(text.split().count("the")).'
        },
        {
          type: 'order',
          q: 'Arrange a program that prints each name with its score.',
          lines: ['scores = {"ada": 9, "bob": 4}', 'for name, score in scores.items():', '    print(name, score)'],
          explain: 'items() gives both halves of each pair at once.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'pairs = [(1, "a"), (2, "b")]\nprint(dict(pairs))',
          options: ["{1: 'a', 2: 'b'}", "[(1, 'a'), (2, 'b')]", "{'a': 1, 'b': 2}", 'TypeError'],
          answer: 0,
          explain: 'dict() accepts any iterable of two-item pairs.'
        },
        {
          type: 'output',
          q: 'What is printed?',
          code: 'a = ["x", "y"]\nb = [1, 2]\nprint(list(zip(a, b)))',
          options: ["[('x', 1), ('y', 2)]", "['x', 1, 'y', 2]", "{'x': 1, 'y': 2}", "[('x', 'y'), (1, 2)]"],
          answer: 0,
          explain: 'zip() pairs items positionally and stops at the shorter input.'
        },
        {
          type: 'match',
          q: 'Match each container with its key property.',
          pairs: [['list', 'ordered, mutable'], ['tuple', 'ordered, immutable'], ['set', 'unique, unordered'], ['dict', 'key to value']],
          explain: 'Since Python 3.7 dicts keep insertion order, but lookup is still by key.'
        },
        {
          type: 'code',
          q: 'Given nums = [5, 3, 5, 1], print the sorted unique values as a list.',
          starter: 'nums = [5, 3, 5, 1]\n',
          expectOutput: '[1, 3, 5]',
          explain: 'print(sorted(set(nums))).'
        }
      ]
    }
  ]
};
