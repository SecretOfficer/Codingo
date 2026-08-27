export const biologyUnits = [
  {
    id: 'b1',
    title: 'Cells & the Body',
    subtitle: 'How living things work',
    color: '#7fa650',
    icon: 'BIO',
    lessons: [
      {
        id: 'b1l1',
        title: 'Cells',
        exercises: [
          {
            type: 'match',
            q: 'Match each cell part to its job.',
            pairs: [['nucleus', 'holds the DNA'], ['mitochondria', 'releases energy'], ['cell membrane', 'controls what enters'], ['chloroplast', 'makes food from light']],
            explain: 'Chloroplasts are found in plant cells only, which is why plants are green.'
          },
          {
            type: 'mcq',
            q: 'Which structure do plant cells have that animal cells do not?',
            options: ['a cell wall', 'a nucleus', 'a membrane', 'cytoplasm'],
            answer: 0,
            explain: 'The cellulose cell wall gives a plant cell its rigid shape.'
          },
          {
            type: 'mcq',
            q: 'Bacteria are different from plant and animal cells because they...',
            options: ['have no nucleus', 'have no DNA', 'cannot reproduce', 'are always harmful'],
            answer: 0,
            explain: 'Bacteria are prokaryotes: their DNA floats loose in the cytoplasm.'
          },
          {
            type: 'mcq',
            q: 'Diffusion is the movement of particles...',
            options: ['from high to low concentration', 'from low to high concentration', 'only in liquids', 'only through pumps'],
            answer: 0,
            explain: 'It is passive: it needs no energy from the cell.'
          },
          {
            type: 'blank',
            q: 'Complete the definition.',
            code: 'Osmosis is the movement of ____ across a partially permeable membrane',
            bank: ['water', 'oxygen', 'glucose', 'salt'],
            answer: ['water'],
            explain: 'Water moves toward the more concentrated solution.'
          },
          {
            type: 'order',
            q: 'Order these from smallest to largest.',
            lines: ['cell', 'tissue', 'organ', 'organ system', 'organism'],
            explain: 'Similar cells form tissues, tissues form organs, and organs work together as systems.'
          }
        ]
      },
      {
        id: 'b1l2',
        title: 'Body Systems',
        exercises: [
          {
            type: 'match',
            q: 'Match each organ to its system.',
            pairs: [['heart', 'circulatory'], ['lungs', 'respiratory'], ['stomach', 'digestive'], ['brain', 'nervous']],
            explain: 'Organs rarely work alone; systems pass materials between each other.'
          },
          {
            type: 'blank',
            q: 'Complete the word equation for aerobic respiration.',
            code: 'glucose + oxygen -> carbon dioxide + water + ____',
            bank: ['energy', 'protein', 'starch', 'light'],
            answer: ['energy'],
            explain: 'Respiration happens in every living cell, all the time, not just in the lungs.'
          },
          {
            type: 'mcq',
            q: 'Which blood vessel carries blood away from the heart?',
            options: ['artery', 'vein', 'capillary', 'ventricle'],
            answer: 0,
            explain: 'Arteries have thick muscular walls to survive the high pressure.'
          },
          {
            type: 'mcq',
            q: 'What is the job of red blood cells?',
            options: ['carrying oxygen', 'fighting infection', 'clotting wounds', 'digesting food'],
            answer: 0,
            explain: 'They are packed with haemoglobin and have no nucleus, leaving more room for oxygen.'
          },
          {
            type: 'order',
            q: 'Order the path of food through the digestive system.',
            lines: ['mouth', 'oesophagus', 'stomach', 'small intestine', 'large intestine'],
            explain: 'Most absorption of nutrients happens in the small intestine.'
          },
          {
            type: 'mcq',
            q: 'Enzymes speed up digestion. They are...',
            options: ['proteins that act as biological catalysts', 'types of sugar', 'living cells', 'made of fat'],
            answer: 0,
            explain: 'Each enzyme has a specific shape, so it only fits one kind of molecule.'
          }
        ]
      },
      {
        id: 'b1l3',
        title: 'Plants',
        exercises: [
          {
            type: 'blank',
            q: 'Complete the word equation for photosynthesis.',
            code: 'carbon dioxide + water -> glucose + ____',
            bank: ['oxygen', 'nitrogen', 'protein', 'energy'],
            answer: ['oxygen'],
            explain: 'The reaction is driven by light energy captured by chlorophyll.'
          },
          {
            type: 'mcq',
            q: 'Where does most photosynthesis happen in a plant?',
            options: ['the leaves', 'the roots', 'the stem', 'the flowers'],
            answer: 0,
            explain: 'Leaves are broad and thin to catch light and let gases in and out.'
          },
          {
            type: 'match',
            q: 'Match each plant part to its job.',
            pairs: [['root', 'takes in water'], ['stem', 'supports and transports'], ['leaf', 'makes food'], ['flower', 'reproduction']],
            explain: 'Xylem carries water up; phloem carries sugars around the plant.'
          },
          {
            type: 'mcq',
            q: 'Which factor does NOT limit the rate of photosynthesis?',
            options: ['soil colour', 'light intensity', 'carbon dioxide level', 'temperature'],
            answer: 0,
            explain: 'The rate rises with a limiting factor until something else becomes the bottleneck.'
          },
          {
            type: 'mcq',
            q: 'Water is lost from leaves through small pores called...',
            options: ['stomata', 'veins', 'cuticles', 'roots'],
            answer: 0,
            explain: 'That loss is transpiration; guard cells close the stomata to slow it.'
          },
          {
            type: 'mcq',
            q: 'At night, a plant...',
            options: ['respires but does not photosynthesise', 'does neither', 'only photosynthesises', 'stops all reactions'],
            answer: 0,
            explain: 'Respiration runs day and night; photosynthesis needs light.'
          }
        ]
      }
    ]
  },
  {
    id: 'b2',
    title: 'Genetics & Ecology',
    subtitle: 'Inheritance and the environment',
    color: '#c4553d',
    icon: 'DNA',
    lessons: [
      {
        id: 'b2l1',
        title: 'DNA & Inheritance',
        exercises: [
          {
            type: 'mcq',
            q: 'A gene is...',
            options: ['a section of DNA coding for a characteristic', 'a whole chromosome', 'a type of cell', 'a protein'],
            answer: 0,
            explain: 'Genes sit along chromosomes, which are long coiled molecules of DNA.'
          },
          {
            type: 'numeric',
            q: 'How many chromosomes are in a normal human body cell?',
            answer: 46,
            tol: 0,
            explain: '23 pairs: one of each pair from each parent.'
          },
          {
            type: 'mcq',
            q: 'A dominant allele shows in the organism when...',
            options: ['at least one copy is present', 'both copies are present', 'no copies are present', 'the environment allows it'],
            answer: 0,
            explain: 'A recessive characteristic needs two copies of the recessive allele.'
          },
          {
            type: 'numeric',
            q: 'Two parents are both Bb. What percentage of offspring are expected to be bb?',
            answer: 25,
            tol: 0,
            explain: 'The Punnett square gives BB, Bb, Bb, bb, so one quarter are bb.'
          },
          {
            type: 'match',
            q: 'Match each genetics word to its meaning.',
            pairs: [['allele', 'a version of a gene'], ['genotype', 'the alleles present'], ['phenotype', 'the visible characteristic'], ['homozygous', 'two identical alleles']],
            explain: 'Two organisms with different genotypes can share the same phenotype.'
          },
          {
            type: 'mcq',
            q: 'Which cell division produces sex cells with half the chromosomes?',
            options: ['meiosis', 'mitosis', 'diffusion', 'respiration'],
            answer: 0,
            explain: 'Mitosis makes identical body cells; meiosis halves the number for gametes.'
          }
        ]
      },
      {
        id: 'b2l2',
        title: 'Evolution',
        exercises: [
          {
            type: 'order',
            q: 'Order the steps of natural selection.',
            lines: ['variation exists in a population', 'the environment puts pressure on it', 'better suited individuals survive longer', 'they reproduce and pass on their alleles', 'the population changes over generations'],
            explain: 'Individuals do not evolve; populations do, across many generations.'
          },
          {
            type: 'mcq',
            q: 'Where does the variation natural selection acts on come from?',
            options: ['random mutation and sexual reproduction', 'the needs of the organism', 'exercise during life', 'the weather'],
            answer: 0,
            explain: 'Mutations happen at random; selection is what is not random.'
          },
          {
            type: 'mcq',
            q: 'Antibiotic resistance spreads because...',
            options: ['resistant bacteria survive and multiply', 'bacteria choose to resist', 'antibiotics create resistance genes', 'people build immunity'],
            answer: 0,
            explain: 'It is natural selection running fast, which is why courses should be finished.'
          },
          {
            type: 'mcq',
            q: 'Fossils are useful evidence because they...',
            options: ['show how species changed over time', 'contain living cells', 'are always complete', 'form quickly'],
            answer: 0,
            explain: 'The record is patchy because fossilisation needs rare conditions.'
          },
          {
            type: 'mcq',
            q: 'Two species that share a recent common ancestor tend to have...',
            options: ['more similar DNA', 'identical DNA', 'no shared genes', 'the same habitat'],
            answer: 0,
            explain: 'Comparing DNA is now the strongest way to work out relatedness.'
          },
          {
            type: 'mcq',
            q: 'Selective breeding differs from natural selection because...',
            options: ['humans choose which individuals breed', 'no genes are involved', 'it is faster than mutation', 'it only works on plants'],
            answer: 0,
            explain: 'Dogs, wheat and dairy cattle are all products of selective breeding.'
          }
        ]
      },
      {
        id: 'b2l3',
        title: 'Ecosystems',
        exercises: [
          {
            type: 'order',
            q: 'Order this food chain from producer to top predator.',
            lines: ['grass', 'grasshopper', 'frog', 'snake', 'hawk'],
            explain: 'Arrows in a food chain point in the direction the energy travels.'
          },
          {
            type: 'mcq',
            q: 'Producers in an ecosystem are usually...',
            options: ['plants that photosynthesise', 'the largest animals', 'decomposers', 'predators'],
            answer: 0,
            explain: 'Producers capture the energy that everything else in the chain depends on.'
          },
          {
            type: 'numeric',
            q: 'Roughly what percentage of energy passes from one trophic level to the next?',
            answer: 10,
            tol: 2,
            explain: 'About 90% is lost as heat, movement and waste, which is why food chains are short.'
          },
          {
            type: 'mcq',
            q: 'If the number of predators falls sharply, the prey population usually...',
            options: ['rises, then falls as food runs short', 'falls immediately', 'stays exactly the same', 'becomes extinct'],
            answer: 0,
            explain: 'Populations oscillate around a level the habitat can support.'
          },
          {
            type: 'match',
            q: 'Match each role to its description.',
            pairs: [['producer', 'makes its own food'], ['consumer', 'eats other organisms'], ['decomposer', 'breaks down dead matter'], ['habitat', 'where an organism lives']],
            explain: 'Decomposers return nutrients to the soil, closing the cycle.'
          },
          {
            type: 'mcq',
            q: 'Burning fossil fuels raises carbon dioxide, which...',
            options: ['traps heat and warms the climate', 'cools the planet', 'has no effect', 'destroys the ozone layer'],
            answer: 0,
            explain: 'Carbon dioxide and methane are greenhouse gases; ozone damage was a separate problem.'
          }
        ]
      }
    ]
  }
];
