export const mathUnits = [
  {
    id: 'm1',
    title: 'Numbers & Algebra',
    subtitle: 'Fractions, powers, equations',
    color: '#1cb0f6',
    icon: 'NUM',
    lessons: [
      {
        id: 'm1l1',
        title: 'Fractions & Decimals',
        exercises: [
          {
            type: 'numeric',
            q: 'What is 3/4 written as a decimal?',
            answer: 0.75,
            tol: 0.001,
            explain: 'A fraction is a division: 3 divided by 4 is 0.75.'
          },
          {
            type: 'mcq',
            q: 'Which fraction is equal to 2/6?',
            options: ['1/3', '2/3', '1/6', '3/6'],
            answer: 0,
            explain: 'Divide the top and bottom by their common factor 2: 2/6 becomes 1/3.'
          },
          {
            type: 'numeric',
            q: 'Add: 1/2 + 1/4. Give the answer as a decimal.',
            answer: 0.75,
            tol: 0.001,
            explain: 'Give both fractions the denominator 4: 2/4 + 1/4 = 3/4 = 0.75.'
          },
          {
            type: 'blank',
            q: 'To add fractions you first make the ____ the same.',
            code: 'a/b + c/d  ->  make the ____ equal',
            bank: ['denominators', 'numerators', 'decimals', 'factors'],
            answer: ['denominators'],
            explain: 'The denominator is the bottom number. Only then can you add the numerators.'
          },
          {
            type: 'match',
            q: 'Match each fraction to its percentage.',
            pairs: [['1/2', '50%'], ['1/4', '25%'], ['3/4', '75%'], ['1/5', '20%']],
            explain: 'Percent means "out of 100", so 1/4 = 25/100 = 25%.'
          },
          {
            type: 'numeric',
            q: 'A shirt costs 40 and is reduced by 25%. What is the new price?',
            answer: 30,
            tol: 0.01,
            explain: '25% of 40 is 10, so the price falls to 30.'
          }
        ]
      },
      {
        id: 'm1l2',
        title: 'Powers & Roots',
        exercises: [
          {
            type: 'numeric',
            q: 'What is 2 to the power of 5?',
            answer: 32,
            tol: 0,
            explain: '2 x 2 x 2 x 2 x 2 = 32. The exponent counts how many times you multiply.'
          },
          {
            type: 'mcq',
            q: 'What does any non-zero number to the power 0 equal?',
            options: ['1', '0', 'the number itself', 'undefined'],
            answer: 0,
            explain: 'Dividing equal powers gives x^n / x^n = x^0 = 1.'
          },
          {
            type: 'numeric',
            q: 'What is the square root of 144?',
            answer: 12,
            tol: 0,
            explain: '12 x 12 = 144, so the square root is 12.'
          },
          {
            type: 'mcq',
            q: 'Simplify 10^3 x 10^2.',
            options: ['10^5', '10^6', '10^1', '100^5'],
            answer: 0,
            explain: 'When multiplying powers of the same base you add the exponents.'
          },
          {
            type: 'numeric',
            q: 'Light travels 3 x 10^8 metres per second. How many metres in 2 seconds? Give the answer in units of 10^8.',
            answer: 6,
            tol: 0,
            explain: 'Double the coefficient and keep the power: 6 x 10^8 metres.'
          },
          {
            type: 'match',
            q: 'Match each expression to its value.',
            pairs: [['3^2', '9'], ['5^0', '1'], ['2^-1', '0.5'], ['4^0.5', '2']],
            explain: 'A negative exponent means one over the power; an exponent of 0.5 is a square root.'
          }
        ]
      },
      {
        id: 'm1l3',
        title: 'Solving Equations',
        exercises: [
          {
            type: 'numeric',
            q: 'Solve for x:  x + 7 = 12',
            answer: 5,
            tol: 0,
            explain: 'Subtract 7 from both sides so the equation stays balanced.'
          },
          {
            type: 'numeric',
            q: 'Solve for x:  3x = 21',
            answer: 7,
            tol: 0,
            explain: 'Divide both sides by 3.'
          },
          {
            type: 'numeric',
            q: 'Solve for x:  2x + 4 = 16',
            answer: 6,
            tol: 0,
            explain: 'Undo the addition first (2x = 12), then the multiplication (x = 6).'
          },
          {
            type: 'order',
            q: 'Put the steps in order to solve 5x - 3 = 12.',
            lines: ['5x - 3 = 12', 'add 3 to both sides', '5x = 15', 'divide both sides by 5', 'x = 3'],
            explain: 'Undo operations in reverse order: addition and subtraction first, then multiplication and division.'
          },
          {
            type: 'mcq',
            q: 'Whatever you do to one side of an equation you must...',
            options: ['do to the other side', 'do twice', 'reverse on the other side', 'write as a fraction'],
            answer: 0,
            explain: 'An equation is a balance. Equal changes on both sides keep it true.'
          },
          {
            type: 'numeric',
            q: 'A taxi charges 3 to start plus 2 per km. You paid 19. How many km did you travel?',
            answer: 8,
            tol: 0,
            explain: 'Solve 3 + 2k = 19, so 2k = 16 and k = 8 km.'
          }
        ]
      }
    ]
  },
  {
    id: 'm2',
    title: 'Geometry & Data',
    subtitle: 'Shapes, angles, averages',
    color: '#58cc02',
    icon: 'GEO',
    lessons: [
      {
        id: 'm2l1',
        title: 'Angles & Triangles',
        exercises: [
          {
            type: 'numeric',
            q: 'The angles inside any triangle add up to how many degrees?',
            answer: 180,
            tol: 0,
            explain: 'Tear off the three corners of any paper triangle and they form a straight line: 180 degrees.'
          },
          {
            type: 'numeric',
            q: 'A triangle has angles of 90 and 35 degrees. What is the third angle?',
            answer: 55,
            tol: 0,
            explain: '180 - 90 - 35 = 55 degrees.'
          },
          {
            type: 'match',
            q: 'Match each triangle to its description.',
            pairs: [['equilateral', 'all three sides equal'], ['isosceles', 'two sides equal'], ['scalene', 'no sides equal'], ['right', 'one 90 degree angle']],
            explain: 'An equilateral triangle also has three equal 60 degree angles.'
          },
          {
            type: 'numeric',
            q: 'A right triangle has legs of 3 and 4. How long is the hypotenuse?',
            answer: 5,
            tol: 0.01,
            explain: 'Pythagoras: 3^2 + 4^2 = 9 + 16 = 25, and the square root of 25 is 5.'
          },
          {
            type: 'mcq',
            q: 'Two angles on a straight line always add to...',
            options: ['180 degrees', '90 degrees', '360 degrees', '60 degrees'],
            answer: 0,
            explain: 'They are called supplementary angles.'
          },
          {
            type: 'numeric',
            q: 'How many degrees is each angle of a regular hexagon?',
            answer: 120,
            tol: 0,
            explain: 'Interior angle = (n - 2) x 180 / n = 4 x 180 / 6 = 120 degrees.'
          }
        ]
      },
      {
        id: 'm2l2',
        title: 'Area & Volume',
        exercises: [
          {
            type: 'numeric',
            q: 'A rectangle is 7 cm by 4 cm. What is its area in square cm?',
            answer: 28,
            tol: 0,
            explain: 'Area of a rectangle is length x width.'
          },
          {
            type: 'blank',
            q: 'Complete the formula for the area of a triangle.',
            code: 'area = ____ x base x height',
            bank: ['1/2', '2', '1/3', 'pi'],
            answer: ['1/2'],
            explain: 'A triangle is exactly half of the rectangle that surrounds it.'
          },
          {
            type: 'numeric',
            q: 'A circle has radius 3. What is its area? Use pi = 3.14.',
            answer: 28.26,
            tol: 0.2,
            explain: 'Area = pi x r^2 = 3.14 x 9 = 28.26.'
          },
          {
            type: 'numeric',
            q: 'A cube has sides of 4 cm. What is its volume in cubic cm?',
            answer: 64,
            tol: 0,
            explain: 'Volume of a cube is side x side x side.'
          },
          {
            type: 'mcq',
            q: 'If you double the radius of a circle, its area...',
            options: ['becomes four times bigger', 'doubles', 'stays the same', 'becomes eight times bigger'],
            answer: 0,
            explain: 'Area depends on r^2, so doubling r multiplies the area by 2^2 = 4.'
          },
          {
            type: 'numeric',
            q: 'A tank measures 2 m x 3 m x 0.5 m. How many cubic metres does it hold?',
            answer: 3,
            tol: 0.01,
            explain: '2 x 3 x 0.5 = 3 cubic metres, which is 3000 litres.'
          }
        ]
      },
      {
        id: 'm2l3',
        title: 'Averages & Chance',
        exercises: [
          {
            type: 'numeric',
            q: 'What is the mean of 4, 8 and 6?',
            answer: 6,
            tol: 0,
            explain: 'Add them (18) and divide by how many there are (3).'
          },
          {
            type: 'numeric',
            q: 'What is the median of 3, 9, 4, 1, 7?',
            answer: 4,
            tol: 0,
            explain: 'Sort them: 1, 3, 4, 7, 9. The middle value is 4.'
          },
          {
            type: 'match',
            q: 'Match each word to its meaning.',
            pairs: [['mean', 'total divided by count'], ['median', 'middle value when sorted'], ['mode', 'most common value'], ['range', 'largest minus smallest']],
            explain: 'The median is safer than the mean when a few extreme values would drag the average.'
          },
          {
            type: 'numeric',
            q: 'You roll a fair six-sided die. What is the probability of rolling a 3? Give it as a decimal to 3 places.',
            answer: 0.167,
            tol: 0.005,
            explain: 'One favourable outcome out of six equally likely ones: 1/6 = 0.167.'
          },
          {
            type: 'mcq',
            q: 'A coin has landed heads five times in a row. What is the chance of heads next?',
            options: ['Still 50%', 'Less than 50%', 'More than 50%', 'Zero'],
            answer: 0,
            explain: 'Coins have no memory. Expecting a change is the gambler fallacy.'
          },
          {
            type: 'numeric',
            q: 'In a class of 20, 5 students walk to school. What percentage walk?',
            answer: 25,
            tol: 0,
            explain: '5 out of 20 is 1/4, which is 25%.'
          }
        ]
      }
    ]
  }
];
