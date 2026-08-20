export const chemistryUnits = [
  {
    id: 'c1',
    title: 'Atoms & Elements',
    subtitle: 'What everything is made of',
    color: '#ce82ff',
    icon: 'ATM',
    lessons: [
      {
        id: 'c1l1',
        title: 'Inside the Atom',
        exercises: [
          {
            type: 'match',
            q: 'Match each particle to its charge.',
            pairs: [['proton', 'positive'], ['neutron', 'none'], ['electron', 'negative'], ['nucleus', 'positive overall']],
            explain: 'Protons and neutrons sit in the nucleus; electrons orbit around it in shells.'
          },
          {
            type: 'numeric',
            q: 'Carbon has atomic number 6. How many protons does a carbon atom have?',
            answer: 6,
            tol: 0,
            explain: 'The atomic number is the proton count, and it decides which element it is.'
          },
          {
            type: 'numeric',
            q: 'A neutral atom has 11 protons. How many electrons does it have?',
            answer: 11,
            tol: 0,
            explain: 'Neutral means the positive and negative charges balance exactly.'
          },
          {
            type: 'mcq',
            q: 'Two atoms of the same element with different neutron counts are called...',
            options: ['isotopes', 'ions', 'molecules', 'compounds'],
            answer: 0,
            explain: 'Carbon-12 and carbon-14 are isotopes: same protons, different neutrons.'
          },
          {
            type: 'numeric',
            q: 'Sodium has mass number 23 and atomic number 11. How many neutrons?',
            answer: 12,
            tol: 0,
            explain: 'Neutrons = mass number - atomic number = 23 - 11 = 12.'
          },
          {
            type: 'mcq',
            q: 'An atom that has lost an electron becomes...',
            options: ['a positive ion', 'a negative ion', 'a new element', 'a neutron'],
            answer: 0,
            explain: 'Losing a negative charge leaves the atom with a net positive charge.'
          }
        ]
      },
      {
        id: 'c1l2',
        title: 'The Periodic Table',
        exercises: [
          {
            type: 'mcq',
            q: 'Elements in the same column (group) share...',
            options: ['similar chemical behaviour', 'the same mass', 'the same number of neutrons', 'the same colour'],
            answer: 0,
            explain: 'A group shares the number of outer-shell electrons, which drives how it reacts.'
          },
          {
            type: 'match',
            q: 'Match each element to its symbol.',
            pairs: [['oxygen', 'O'], ['sodium', 'Na'], ['iron', 'Fe'], ['potassium', 'K']],
            explain: 'Several symbols come from Latin names: natrium, ferrum, kalium.'
          },
          {
            type: 'mcq',
            q: 'Group 18 elements (helium, neon, argon) barely react because...',
            options: ['their outer shell is full', 'they are very heavy', 'they are radioactive', 'they are liquids'],
            answer: 0,
            explain: 'A full outer shell is stable, so noble gases have almost no drive to bond.'
          },
          {
            type: 'mcq',
            q: 'Where are metals found on the periodic table?',
            options: ['On the left and centre', 'On the far right', 'Only the bottom row', 'Scattered randomly'],
            answer: 0,
            explain: 'A staircase line separates metals on the left from non-metals on the right.'
          },
          {
            type: 'numeric',
            q: 'How many electrons fit in the first shell of an atom?',
            answer: 2,
            tol: 0,
            explain: 'The first shell holds 2, the next two hold 8 each at school level.'
          },
          {
            type: 'blank',
            q: 'Complete the sentence about rows.',
            code: 'A row of the periodic table is called a ____',
            bank: ['period', 'group', 'shell', 'family'],
            answer: ['period'],
            explain: 'Columns are groups, rows are periods. The period number equals the number of shells.'
          }
        ]
      },
      {
        id: 'c1l3',
        title: 'Bonding',
        exercises: [
          {
            type: 'mcq',
            q: 'In an ionic bond, electrons are...',
            options: ['transferred from metal to non-metal', 'shared equally', 'destroyed', 'turned into protons'],
            answer: 0,
            explain: 'The resulting opposite ions attract, as in sodium chloride.'
          },
          {
            type: 'mcq',
            q: 'In a covalent bond, atoms...',
            options: ['share a pair of electrons', 'swap protons', 'lose their nucleus', 'repel each other'],
            answer: 0,
            explain: 'Water and carbon dioxide are held together by shared electron pairs.'
          },
          {
            type: 'match',
            q: 'Match each formula to its name.',
            pairs: [['H2O', 'water'], ['CO2', 'carbon dioxide'], ['NaCl', 'sodium chloride'], ['CH4', 'methane']],
            explain: 'The small number after a symbol counts the atoms of that element in the molecule.'
          },
          {
            type: 'numeric',
            q: 'How many atoms in total are in one molecule of H2SO4?',
            answer: 7,
            tol: 0,
            explain: '2 hydrogen + 1 sulfur + 4 oxygen = 7 atoms.'
          },
          {
            type: 'mcq',
            q: 'Why do metals conduct electricity?',
            options: ['They have free-moving delocalised electrons', 'They are shiny', 'They are dense', 'Their protons move'],
            answer: 0,
            explain: 'The same sea of electrons also makes metals good conductors of heat.'
          },
          {
            type: 'mcq',
            q: 'Ionic compounds have high melting points because...',
            options: ['the attraction between ions is very strong', 'they contain metals', 'they are crystals', 'they dissolve in water'],
            answer: 0,
            explain: 'Breaking a giant ionic lattice takes a great deal of energy.'
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Reactions & Solutions',
    subtitle: 'Change, acids, rates',
    color: '#2ec4b6',
    icon: 'RXN',
    lessons: [
      {
        id: 'c2l1',
        title: 'Chemical Reactions',
        exercises: [
          {
            type: 'mcq',
            q: 'In a chemical reaction the total mass of the products is...',
            options: ['equal to the total mass of the reactants', 'always less', 'always more', 'unrelated'],
            answer: 0,
            explain: 'Conservation of mass: atoms are rearranged, never created or destroyed.'
          },
          {
            type: 'numeric',
            q: 'Balance: __ H2 + O2 -> 2 H2O. What number goes in the blank?',
            answer: 2,
            tol: 0,
            explain: 'Two hydrogen molecules supply the four hydrogen atoms the two water molecules need.'
          },
          {
            type: 'match',
            q: 'Match each reaction type to its description.',
            pairs: [['combustion', 'burning in oxygen'], ['oxidation', 'gaining oxygen'], ['neutralisation', 'acid plus base'], ['thermal decomposition', 'broken apart by heat']],
            explain: 'Reaction type is a shortcut for predicting the products.'
          },
          {
            type: 'mcq',
            q: 'A reaction that gives out heat is called...',
            options: ['exothermic', 'endothermic', 'catalytic', 'reversible'],
            answer: 0,
            explain: 'Exothermic reactions warm their surroundings; endothermic ones cool them.'
          },
          {
            type: 'order',
            q: 'Order the steps of a fair test on reaction rate.',
            lines: ['choose one variable to change', 'keep all other variables the same', 'measure the time for the reaction', 'repeat and take a mean', 'plot the results'],
            explain: 'Changing only one variable at a time is what makes the conclusion trustworthy.'
          },
          {
            type: 'mcq',
            q: 'A catalyst speeds up a reaction by...',
            options: ['lowering the activation energy', 'raising the temperature', 'being used up', 'adding more reactant'],
            answer: 0,
            explain: 'A catalyst is not consumed, so a small amount works over and over.'
          }
        ]
      },
      {
        id: 'c2l2',
        title: 'Acids & Bases',
        exercises: [
          {
            type: 'numeric',
            q: 'What is the pH of a neutral solution such as pure water?',
            answer: 7,
            tol: 0,
            explain: 'Below 7 is acidic, above 7 is alkaline.'
          },
          {
            type: 'mcq',
            q: 'What colour does universal indicator turn in a strong acid?',
            options: ['red', 'blue', 'green', 'purple'],
            answer: 0,
            explain: 'Green is neutral, and blue or purple means alkaline.'
          },
          {
            type: 'blank',
            q: 'Complete the neutralisation word equation.',
            code: 'acid + base -> salt + ____',
            bank: ['water', 'oxygen', 'hydrogen', 'carbon dioxide'],
            answer: ['water'],
            explain: 'Hydrogen ions from the acid join hydroxide ions from the base to make water.'
          },
          {
            type: 'mcq',
            q: 'Acids release which ion in water?',
            options: ['H+', 'OH-', 'Na+', 'Cl-'],
            answer: 0,
            explain: 'The concentration of H+ is exactly what pH measures.'
          },
          {
            type: 'numeric',
            q: 'A solution of pH 3 is how many times more acidic than one of pH 5?',
            answer: 100,
            tol: 0,
            explain: 'Each pH step is a factor of ten, so two steps is 10 x 10 = 100.'
          },
          {
            type: 'match',
            q: 'Match each substance to its likely pH.',
            pairs: [['lemon juice', '2'], ['pure water', '7'], ['soap', '9'], ['oven cleaner', '13']],
            explain: 'Most foods are mildly acidic; cleaning products are usually alkaline.'
          }
        ]
      },
      {
        id: 'c2l3',
        title: 'States & Mixtures',
        exercises: [
          {
            type: 'match',
            q: 'Match each change of state to its name.',
            pairs: [['solid to liquid', 'melting'], ['liquid to gas', 'evaporating'], ['gas to liquid', 'condensing'], ['liquid to solid', 'freezing']],
            explain: 'These changes are physical: no new substance is made, so they can be reversed.'
          },
          {
            type: 'mcq',
            q: 'In a gas, the particles...',
            options: ['move quickly and are far apart', 'vibrate in fixed positions', 'are packed and slide past each other', 'do not move'],
            answer: 0,
            explain: 'That spacing is why gases can be compressed but solids cannot.'
          },
          {
            type: 'match',
            q: 'Match each separation method to what it separates.',
            pairs: [['filtration', 'insoluble solid from liquid'], ['evaporation', 'dissolved solid from solution'], ['distillation', 'liquids with different boiling points'], ['chromatography', 'coloured dyes']],
            explain: 'The right method depends on the physical property that differs between the parts.'
          },
          {
            type: 'numeric',
            q: 'At what temperature in Celsius does pure water boil at sea level?',
            answer: 100,
            tol: 0,
            explain: 'It freezes at 0 and boils at 100 under standard atmospheric pressure.'
          },
          {
            type: 'mcq',
            q: 'A solution is made of...',
            options: ['a solute dissolved in a solvent', 'two solids stuck together', 'a gas only', 'pure water'],
            answer: 0,
            explain: 'Salt water is the solute (salt) dissolved in the solvent (water).'
          },
          {
            type: 'mcq',
            q: 'Why does a sugar cube dissolve faster when crushed?',
            options: ['More surface area touches the water', 'It becomes lighter', 'It changes chemically', 'The water gets hotter'],
            answer: 0,
            explain: 'Surface area, temperature and stirring all raise the rate of dissolving.'
          }
        ]
      }
    ]
  }
];
