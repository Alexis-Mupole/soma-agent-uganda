import { QuizQuestion } from '@/types';
import { detectTopic } from './engine';

interface BankQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const BANKS: Record<string, BankQuestion[]> = {
  'cell-biology': [
    {
      question: 'Which organelle is the main site of aerobic respiration?',
      options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Golgi apparatus'],
      correctIndex: 1,
      explanation: 'Mitochondria release energy as ATP during aerobic respiration. The nucleus controls activities and ribosomes build proteins.',
    },
    {
      question: 'Which structure is found in plant cells but NOT in animal cells?',
      options: ['Cell membrane', 'Cytoplasm', 'Chloroplast', 'Nucleus'],
      correctIndex: 2,
      explanation: 'Chloroplasts contain chlorophyll for photosynthesis. Both plant and animal cells have a membrane, cytoplasm and nucleus.',
    },
    {
      question: 'A root hair cell has a long, thin extension. What is the main reason?',
      options: [
        'To store more glucose',
        'To increase surface area for water absorption',
        'To carry out more respiration',
        'To protect the root from insects',
      ],
      correctIndex: 1,
      explanation: 'A larger surface area increases the rate of absorption of water and mineral salts from the soil.',
    },
    {
      question: 'Which statement best describes the cell membrane?',
      options: [
        'It is freely permeable to all substances',
        'It is selectively permeable and controls movement of substances',
        'It is made of cellulose and supports the cell',
        'It contains chlorophyll and traps light',
      ],
      correctIndex: 1,
      explanation: 'The cell membrane is selectively permeable: it allows some substances through while restricting others.',
    },
    {
      question: 'A student observes a cell with a large permanent vacuole and a cellulose wall. The cell is most likely from:',
      options: ['A human cheek', 'A plant leaf', 'A frog muscle', 'A bacterium'],
      correctIndex: 1,
      explanation: 'A cellulose cell wall and a large permanent vacuole are characteristic features of plant cells.',
    },
  ],
  photosynthesis: [
    {
      question: 'Which gas is taken in by a leaf during photosynthesis?',
      options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      correctIndex: 2,
      explanation: 'Carbon dioxide diffuses through the stomata and is used with water to make glucose; oxygen is released.',
    },
    {
      question: 'What is the main role of chlorophyll?',
      options: [
        'To absorb water from the soil',
        'To trap light energy',
        'To transport glucose',
        'To open and close stomata',
      ],
      correctIndex: 1,
      explanation: 'Chlorophyll is the green pigment that absorbs light energy for photosynthesis.',
    },
    {
      question: 'A plant is kept in bright light with plenty of water but in air with very little carbon dioxide. What limits photosynthesis?',
      options: ['Light intensity', 'Carbon dioxide concentration', 'Water supply', 'Chlorophyll amount'],
      correctIndex: 1,
      explanation: 'When light and water are plentiful, carbon dioxide becomes the limiting factor.',
    },
    {
      question: 'Which word equation represents photosynthesis?',
      options: [
        'Glucose + oxygen → carbon dioxide + water',
        'Carbon dioxide + water → glucose + oxygen',
        'Water + oxygen → glucose + carbon dioxide',
        'Glucose + water → oxygen + carbon dioxide',
      ],
      correctIndex: 1,
      explanation: 'Carbon dioxide and water, using light energy and chlorophyll, produce glucose and oxygen.',
    },
    {
      question: 'Which adaptation of a leaf increases the surface area for light absorption?',
      options: ['Waxy cuticle', 'Broad, flat lamina', 'Thick stem', 'Deep roots'],
      correctIndex: 1,
      explanation: 'A broad, flat lamina exposes a large area to sunlight, increasing light absorption.',
    },
  ],
  transport: [
    {
      question: 'Which blood component mainly carries oxygen?',
      options: ['Plasma', 'Platelets', 'Red blood cells', 'White blood cells'],
      correctIndex: 2,
      explanation: 'Red blood cells contain haemoglobin, which combines with oxygen to transport it around the body.',
    },
    {
      question: 'Why does the left ventricle have a thicker wall than the right ventricle?',
      options: [
        'It holds more blood',
        'It pumps blood at higher pressure to the whole body',
        'It pumps blood only to the lungs',
        'It contains more valves',
      ],
      correctIndex: 1,
      explanation: 'The left ventricle must generate enough pressure to send blood around the entire body; the right ventricle only pumps to the lungs.',
    },
    {
      question: 'Which blood vessels contain valves to prevent backflow?',
      options: ['Arteries', 'Veins', 'Capillaries', 'Aortas'],
      correctIndex: 1,
      explanation: 'Blood in veins is at low pressure, so valves prevent it from flowing backwards.',
    },
    {
      question: 'Capillary walls are one cell thick. Why is this important?',
      options: [
        'It increases blood pressure',
        'It allows rapid exchange of substances',
        'It prevents blood clotting',
        'It stores more oxygen',
      ],
      correctIndex: 1,
      explanation: 'A thin wall gives a short diffusion distance, making exchange of gases and nutrients efficient.',
    },
    {
      question: 'Double circulation means that blood:',
      options: [
        'Flows twice as fast',
        'Passes through the heart twice in one complete circuit',
        'Contains two types of plasma',
        'Circulates only in the lungs',
      ],
      correctIndex: 1,
      explanation: 'In double circulation, blood passes through the heart on the pulmonary circuit and again on the systemic circuit.',
    },
  ],
  coordination: [
    {
      question: 'Which sequence correctly describes a reflex arc?',
      options: [
        'Receptor → motor neurone → relay neurone → sensory neurone → effector',
        'Receptor → sensory neurone → relay neurone → motor neurone → effector',
        'Effector → sensory neurone → spinal cord → motor neurone → receptor',
        'Receptor → relay neurone → sensory neurone → effector → motor neurone',
      ],
      correctIndex: 1,
      explanation: 'The impulse travels from receptor along the sensory neurone, through a relay neurone in the spinal cord, then along a motor neurone to the effector.',
    },
    {
      question: 'Which hormone lowers blood glucose concentration?',
      options: ['Adrenaline', 'Glucagon', 'Insulin', 'Thyroxine'],
      correctIndex: 2,
      explanation: 'Insulin causes the liver to convert excess glucose into glycogen, lowering blood glucose.',
    },
    {
      question: 'Why are reflex actions useful?',
      options: [
        'They are slow and controlled',
        'They protect the body from harm before the brain processes the pain',
        'They require conscious thought',
        'They only occur during sleep',
      ],
      correctIndex: 1,
      explanation: 'Reflexes are rapid and automatic, protecting the body from injury without waiting for conscious processing.',
    },
    {
      question: 'Which part of the nervous system coordinates the response to a change in body temperature?',
      options: ['Cerebrum', 'Cerebellum', 'Hypothalamus', 'Medulla'],
      correctIndex: 2,
      explanation: 'The hypothalamus acts as the body\'s thermostat, coordinating temperature-regulating responses.',
    },
    {
      question: 'Compared with nervous control, hormonal control is usually:',
      options: [
        'Faster and shorter-lived',
        'Slower but longer-lasting',
        'Faster and longer-lasting',
        'Slower and shorter-lived',
      ],
      correctIndex: 1,
      explanation: 'Hormones travel in the blood, so responses are slower but tend to last longer than nerve impulses.',
    },
  ],
  homeostasis: [
    {
      question: 'What is homeostasis?',
      options: [
        'The process of cell division',
        'Maintenance of a stable internal environment',
        'The breakdown of glucose without oxygen',
        'The movement of water across a membrane',
      ],
      correctIndex: 1,
      explanation: 'Homeostasis keeps internal conditions such as temperature, pH and glucose concentration within a stable range.',
    },
    {
      question: 'When the body is too hot, which response helps cool it down?',
      options: ['Vasoconstriction', 'Shivering', 'Sweating', 'Hair standing up'],
      correctIndex: 2,
      explanation: 'Sweating cools the body as water evaporates from the skin surface.',
    },
    {
      question: 'A dehydrated person will usually produce urine that is:',
      options: [
        'More dilute and larger in volume',
        'More concentrated and smaller in volume',
        'Unchanged in concentration',
        'More dilute and smaller in volume',
      ],
      correctIndex: 1,
      explanation: 'ADH increases water reabsorption in the kidneys, producing a smaller volume of more concentrated urine.',
    },
    {
      question: 'Which organ is mainly responsible for controlling water balance?',
      options: ['Liver', 'Kidney', 'Pancreas', 'Lungs'],
      correctIndex: 1,
      explanation: 'The kidneys filter blood and adjust the amount of water reabsorbed, controlling water balance.',
    },
    {
      question: 'After a carbohydrate-rich meal, what happens to blood glucose and insulin?',
      options: [
        'Glucose rises and insulin rises',
        'Glucose rises and insulin falls',
        'Glucose falls and insulin rises',
        'Both glucose and insulin fall',
      ],
      correctIndex: 0,
      explanation: 'Digestion raises blood glucose; the pancreas then releases insulin to bring it back to normal.',
    },
  ],
  mathematics: [
    {
      question: 'Solve x² − 7x + 12 = 0.',
      options: ['x = 3 or x = 4', 'x = −3 or x = −4', 'x = 2 or x = 6', 'x = 1 or x = 12'],
      correctIndex: 0,
      explanation: 'Factorise: (x − 3)(x − 4) = 0, so x = 3 or x = 4.',
    },
    {
      question: 'What is the discriminant of the equation 2x² + 3x + 5 = 0?',
      options: ['−31', '31', '49', '−49'],
      correctIndex: 0,
      explanation: 'b² − 4ac = 3² − 4(2)(5) = 9 − 40 = −31. Since it is negative, there are no real roots.',
    },
    {
      question: 'If x² + 10x + 21 = 0, which pair of numbers factorises the expression?',
      options: ['3 and 7', '−3 and −7', '−3 and 7', '3 and −7'],
      correctIndex: 1,
      explanation: 'We need two numbers with product 21 and sum −10: −3 and −7, giving (x − 3)(x − 7) = 0.',
    },
    {
      question: 'For a quadratic equation, a discriminant equal to zero means:',
      options: ['Two distinct real roots', 'One repeated real root', 'No real roots', 'Infinite roots'],
      correctIndex: 1,
      explanation: 'When b² − 4ac = 0, the two roots coincide, so there is one repeated real root.',
    },
    {
      question: 'Solve 2x² − 8 = 0.',
      options: ['x = 2 only', 'x = −2 only', 'x = 2 or x = −2', 'x = 4 or x = −4'],
      correctIndex: 2,
      explanation: '2x² = 8 → x² = 4 → x = ±2.',
    },
  ],
  physics: [
    {
      question: 'A 12 V supply drives a current of 3 A through a resistor. What is its resistance?',
      options: ['36 Ω', '9 Ω', '4 Ω', '0.25 Ω'],
      correctIndex: 2,
      explanation: 'Using Ohm\'s law, R = V ÷ I = 12 ÷ 3 = 4 Ω.',
    },
    {
      question: 'Two 6 Ω resistors are connected in parallel. What is the total resistance?',
      options: ['12 Ω', '6 Ω', '3 Ω', '1.5 Ω'],
      correctIndex: 2,
      explanation: 'For parallel resistors, 1/R = 1/6 + 1/6 = 1/3, so R = 3 Ω.',
    },
    {
      question: 'In a series circuit, which quantity is the same through every component?',
      options: ['Voltage', 'Current', 'Resistance', 'Power'],
      correctIndex: 1,
      explanation: 'In a series circuit there is only one path, so the current is the same at every point.',
    },
    {
      question: 'Which formula correctly gives electrical power?',
      options: ['P = V ÷ I', 'P = V × I', 'P = I ÷ V', 'P = V × R'],
      correctIndex: 1,
      explanation: 'Power equals voltage multiplied by current: P = VI.',
    },
    {
      question: 'A 60 W bulb is used for 5 minutes. How much energy is transferred?',
      options: ['300 J', '1,800 J', '18,000 J', '30,000 J'],
      correctIndex: 2,
      explanation: 'Energy = power × time = 60 × (5 × 60) = 18,000 J.',
    },
  ],
  chemistry: [
    {
      question: 'What is the pH of a neutral solution at room temperature?',
      options: ['0', '7', '10', '14'],
      correctIndex: 1,
      explanation: 'Pure water is neutral with a pH of 7 at room temperature.',
    },
    {
      question: 'Which salt is formed when hydrochloric acid reacts with sodium hydroxide?',
      options: ['Sodium sulphate', 'Sodium chloride', 'Sodium nitrate', 'Sodium carbonate'],
      correctIndex: 1,
      explanation: 'HCl + NaOH → NaCl + H₂O. Hydrochloric acid produces chlorides.',
    },
    {
      question: 'Which of these turns red litmus paper blue?',
      options: ['Lemon juice', 'Hydrochloric acid', 'Sodium hydroxide solution', 'Vinegar'],
      correctIndex: 2,
      explanation: 'Alkalis such as sodium hydroxide turn red litmus blue, while acids turn blue litmus red.',
    },
    {
      question: 'What is the product of a neutralisation reaction?',
      options: ['Salt and water', 'Acid and base', 'Hydrogen and oxygen', 'Salt and hydrogen'],
      correctIndex: 0,
      explanation: 'Acid + base → salt + water. This is neutralisation.',
    },
    {
      question: 'Why should acid always be added to water, rather than water to acid?',
      options: [
        'It produces more salt',
        'It prevents a violent reaction and splashing',
        'It makes the acid weaker',
        'It changes the pH to 7',
      ],
      correctIndex: 1,
      explanation: 'Adding water to concentrated acid can release heat rapidly and cause splashing; adding acid to water is safer.',
    },
  ],
  english: [
    {
      question: 'A summary question is worth four marks. What is the safest approach?',
      options: [
        'Copy two long sentences from the passage',
        'Write four distinct points in your own words',
        'Include every example from the passage',
        'Write one detailed paragraph with quotations',
      ],
      correctIndex: 1,
      explanation: 'Marks are awarded per distinct point, so give four separate, concise points in your own words.',
    },
    {
      question: 'Which command word asks for the greatest depth of explanation?',
      options: ['List', 'State', 'Explain', 'Name'],
      correctIndex: 2,
      explanation: '"Explain" requires reasons and mechanisms, not just a list of facts.',
    },
    {
      question: 'What is the best first step when answering a comprehension passage?',
      options: [
        'Answer the questions while reading once',
        'Read the passage twice, then read the questions',
        'Copy the entire passage',
        'Start with the longest question',
      ],
      correctIndex: 1,
      explanation: 'Reading twice builds understanding before you focus on command words and specific questions.',
    },
  ],
  'study-skills': [
    {
      question: 'Which revision technique is scientifically most effective?',
      options: [
        'Re-reading notes several times',
        'Highlighting the textbook',
        'Retrieval practice without notes',
        'Listening to a recording while sleeping',
      ],
      correctIndex: 2,
      explanation: 'Retrieval practice strengthens memory far more than passive re-reading or highlighting.',
    },
    {
      question: 'What is spaced repetition?',
      options: [
        'Studying for many hours without breaks',
        'Revising the same topic after increasing time intervals',
        'Reading notes only before an exam',
        'Studying only your favourite subject',
      ],
      correctIndex: 1,
      explanation: 'Spacing revisits over increasing intervals, which improves long-term retention.',
    },
    {
      question: 'A 25-minute focused study block followed by a 5-minute break is known as:',
      options: ['Cramming', 'The Pomodoro technique', 'Rote learning', 'Spaced testing'],
      correctIndex: 1,
      explanation: 'The Pomodoro technique uses focused work blocks separated by short breaks.',
    },
  ],
};

const GENERIC_BANK: BankQuestion[] = [
  ...BANKS['cell-biology'],
  ...BANKS['photosynthesis'],
  ...BANKS['transport'],
  ...BANKS['mathematics'],
  ...BANKS['physics'],
  ...BANKS['chemistry'],
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function localQuiz(topic: string, content = '', count = 3): QuizQuestion[] {
  const combined = `${topic} ${content.slice(0, 400)}`.toLowerCase();
  const isGeneral = /general|daily|mixed|mastery challenge|science/.test(combined) && !/biology|cell|plant/.test(combined);

  let bank: BankQuestion[] = [];
  if (isGeneral) {
    bank = GENERIC_BANK;
  } else {
    const detected = detectTopic(combined);
    bank = BANKS[detected] || [];
    if (bank.length === 0) bank = GENERIC_BANK;
  }

  const picked = shuffle(bank).slice(0, Math.max(1, Math.min(count, bank.length)));

  return picked.map((q, index) => {
    const correctText = q.options[q.correctIndex];
    const options = shuffle(q.options);
    return {
      id: `q-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
      question: q.question,
      options,
      correctIndex: options.indexOf(correctText),
      explanation: q.explanation,
    };
  });
}

/** Validate and normalise raw Gemini JSON output. */
export function normaliseQuestions(raw: unknown, count = 3): QuizQuestion[] | null {
  const candidate =
    raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray((raw as { questions?: unknown }).questions)
      ? (raw as { questions: unknown[] }).questions
      : Array.isArray(raw)
        ? raw
        : null;

  if (!candidate || candidate.length === 0) return null;

  const out: QuizQuestion[] = [];
  for (const item of candidate) {
    if (!item || typeof item !== 'object') continue;
    const q = item as Record<string, unknown>;
    const question = typeof q.question === 'string' ? q.question.trim() : '';
    const options = Array.isArray(q.options)
      ? q.options.filter((o): o is string => typeof o === 'string' && o.trim().length > 0).map((o) => o.trim())
      : [];
    if (!question || options.length < 2) continue;

    let correctIndex =
      typeof q.correctIndex === 'number' ? Math.round(q.correctIndex) : typeof q.answerIndex === 'number' ? Math.round(q.answerIndex) : -1;

    if (correctIndex < 0 && typeof q.correctAnswer === 'string') {
      correctIndex = options.findIndex((o) => o.toLowerCase() === (q.correctAnswer as string).toLowerCase());
    }
    if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;

    out.push({
      id: `q-${out.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
      question,
      options: options.slice(0, 4),
      correctIndex,
      explanation:
        typeof q.explanation === 'string' && q.explanation.trim()
          ? q.explanation.trim()
          : 'Review this concept in your lesson notes, then try a similar question.',
    });
    if (out.length >= count) break;
  }

  return out.length >= Math.min(2, count) ? out : null;
}
