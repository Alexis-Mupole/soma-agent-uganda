/**
 * Soma-Agent offline tutor.
 *
 * A deterministic, curriculum-aware fallback used whenever Gemini is not
 * configured or temporarily unavailable. This guarantees the demo always has
 * a useful, on-brand AI response.
 */

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorRequest {
  message: string;
  history?: TutorMessage[];
  context?: string;
  studentName?: string;
}

export interface LocalTutorReply {
  response: string;
  suggestions: string[];
  topic: string;
}

interface Topic {
  id: string;
  label: string;
  keywords: string[];
  answer: (name: string) => string;
  suggestions: string[];
}

const n = (name?: string) => (name ? name.split(' ')[0] : 'there');

const TOPICS: Topic[] = [
  {
    id: 'cell-biology',
    label: 'Cell Biology',
    keywords: ['cell', 'organelle', 'nucleus', 'mitochondri', 'ribosome', 'membrane', 'vacuole', 'chloroplast', 'cytoplasm'],
    suggestions: [
      'Compare plant and animal cells',
      'Quiz me on cell organelles',
      'Explain diffusion and osmosis',
    ],
    answer: (name) => `### Cell Biology — the building blocks of life

A **cell** is the smallest unit that can carry out all the processes of life. Every living thing at Gayaza — from the grass on the compound to you — is made of cells.

**The cell theory says:**
- All living organisms are made of one or more cells.
- New cells arise from existing cells.
- The cell is the basic unit of structure and function.

### Organelles you must know
| Organelle | Job |
| --- | --- |
| **Nucleus** | Holds DNA and controls cell activities |
| **Mitochondrion** | Site of aerobic respiration; releases energy |
| **Ribosome** | Builds proteins |
| **Cell membrane** | Selectively controls what enters and leaves |
| **Chloroplast** | Traps light for photosynthesis (plants only) |
| **Vacuole** | Stores sap; keeps plant cells firm |

### Plant vs animal cells
Plant cells have a **cellulose cell wall**, **chloroplasts** and a **large permanent vacuole**. Animal cells have none of these, but both have a nucleus, cytoplasm and a cell membrane.

> Exam tip: When comparing cells, pair every difference with its function — examiners award the function mark separately.

**Quick check:** Why does a root hair cell have no chloroplasts, ${n(name)}?

Would you like me to quiz you on this unit or explain diffusion next?`,
  },
  {
    id: 'photosynthesis',
    label: 'Plant Nutrition',
    keywords: ['photosynthes', 'chlorophyll', 'leaf', 'stomata', 'plant nutrition', 'limiting factor', 'glucose', 'xylem', 'phloem'],
    suggestions: [
      'Explain the limiting factors',
      'How is a leaf adapted for photosynthesis?',
      'Quiz me on plant nutrition',
    ],
    answer: () => `### Plant Nutrition — photosynthesis

**Photosynthesis** is how green plants make their own food using light energy trapped by **chlorophyll**.

**Carbon dioxide + water → glucose + oxygen**
*(light energy and chlorophyll are needed)*

### What the plant needs
- **Carbon dioxide** — diffuses in through the stomata.
- **Water** — absorbed by root hairs and carried up the xylem.
- **Light** — usually sunlight.
- **Chlorophyll** — the green pigment inside chloroplasts.

### Limiting factors
The rate of photosynthesis increases with **light intensity**, **CO₂ concentration** and **temperature** — until one of them becomes the limiting factor. That is why a greenhouse can boost growth.

### Leaf adaptations
A broad, flat lamina gives a **large surface area**; thin leaves allow short diffusion distances; air spaces let gases circulate; and veins bring water while removing glucose.

> Local analogy: A leaf is like a solar panel in a Kampala taxi park — the wider it faces the energy source, the more it collects.

**Quick check:** A plant in bright light still photosynthesises slowly. Name two possible limiting factors.

Ready for a 3-question mastery quiz on this unit?`,
  },
  {
    id: 'transport',
    label: 'Human Transport',
    keywords: ['blood', 'heart', 'circulat', 'artery', 'vein', 'capillar', 'transport', 'haemoglobin', 'platelet', 'ventricle'],
    suggestions: [
      'Explain the double circulation',
      'Compare arteries, veins and capillaries',
      'Quiz me on the heart',
    ],
    answer: () => `### Human Transport — blood and circulation

Your circulatory system is a delivery network: it moves **oxygen**, **nutrients**, **hormones** and **waste** around the body.

### Blood has four parts
- **Red blood cells** — packed with haemoglobin, which carries oxygen.
- **White blood cells** — defend against pathogens.
- **Platelets** — trigger clotting at a wound.
- **Plasma** — the liquid that carries dissolved substances.

### The heart
The heart has **four chambers**. The **left ventricle** has the thickest muscular wall because it pumps blood at high pressure to the whole body, while the right ventricle only pumps to the lungs. This is **double circulation** — blood passes through the heart twice per circuit.

### Vessels
- **Arteries** — away from the heart, thick elastic walls, high pressure.
- **Veins** — back to the heart, valves prevent backflow.
- **Capillaries** — one cell thick for fast exchange.

> Local analogy: Think of Kampala's roads. Arteries are the outbound routes, veins the return routes, and capillaries the narrow access lanes where the real business happens.

**Quick check:** Why are artery walls thicker than vein walls?

Say "quiz me" and I will test you on the heart and blood vessels.`,
  },
  {
    id: 'coordination',
    label: 'Coordination',
    keywords: ['coordinat', 'nervous', 'neurone', 'neuron', 'reflex', 'hormone', 'endocrine', 'brain', 'synapse', 'stimulus'],
    suggestions: [
      'Explain the reflex arc',
      'Nervous vs hormonal control',
      'Quiz me on coordination',
    ],
    answer: () => `### Coordination — nervous and endocrine control

**Coordination** is how the body detects change and responds in a controlled way. Two systems share the job: the **nervous system** (fast, electrical) and the **endocrine system** (slower, chemical).

### The reflex arc
**Stimulus → receptor → sensory neurone → relay neurone (spinal cord) → motor neurone → effector → response**

A reflex is rapid and automatic, which protects you before your brain has even processed the pain. That is why you pull your hand from a hot sufuria before thinking.

### Hormones
Hormones are chemical messengers carried in the blood:
- **Insulin** lowers blood glucose.
- **Adrenaline** prepares the body for action.
- **Thyroxine** controls metabolic rate.

> Exam tip: Nervous responses are fast and short-lived. Hormonal responses are slower but act for longer. Examiners love that comparison.

**Quick check:** In the reflex arc, what is the role of the relay neurone?

Would you like a diagram-style walkthrough or a quick quiz?`,
  },
  {
    id: 'homeostasis',
    label: 'Homeostasis',
    keywords: ['homeostas', 'temperature', 'glucose', 'insulin', 'kidney', 'osmoregulat', 'adh', 'sweat', 'vasodilat', 'shiver'],
    suggestions: [
      'How does the body control temperature?',
      'Explain blood glucose control',
      'Quiz me on homeostasis',
    ],
    answer: () => `### Homeostasis — keeping the internal environment steady

**Homeostasis** is the maintenance of a stable internal environment even when the outside world changes.

### Temperature control
Receptors in the skin detect change and the **hypothalamus** coordinates the response:
- **Too hot:** sweating, vasodilation, less shivering.
- **Too cold:** shivering, vasoconstriction, hair standing up.

### Blood glucose
- Glucose too high → pancreas releases **insulin** → liver stores glucose as **glycogen**.
- Glucose too low → pancreas releases **glucagon** → glycogen is converted back to glucose.

### Water balance
The kidneys adjust urine concentration. When dehydrated, **ADH** increases water reabsorption, producing darker, more concentrated urine.

> Local analogy: Homeostasis is like a boda rider balancing a heavy load — constant small corrections keep everything steady on a bumpy road.

**Quick check:** A student drinks very little water on a hot day. What happens to their ADH level and urine concentration?

Ready to practise? A quiz on this unit takes about three minutes.`,
  },
  {
    id: 'mathematics',
    label: 'Mathematics',
    keywords: ['math', 'quadratic', 'equation', 'factoris', 'algebra', 'discriminant', 'formula', 'simultaneous', 'graph', 'solve'],
    suggestions: [
      'Solve x² − 5x + 6 = 0 step by step',
      'Explain the discriminant',
      'Quiz me on quadratics',
    ],
    answer: () => `### Quadratic equations — a reliable method

A **quadratic equation** looks like **ax² + bx + c = 0**, where a ≠ 0. You have three dependable tools.

### 1. Factorisation
Split the middle term so the two parts multiply to give **ac** and add to give **b**.

**Example:** x² − 5x + 6 = 0
- Need two numbers: product 6, sum −5 → −2 and −3.
- (x − 2)(x − 3) = 0
- So **x = 2 or x = 3**.

### 2. Quadratic formula
**x = (−b ± √(b² − 4ac)) / 2a**
This always works, especially when factorising is messy.

### 3. Completing the square
Rewrite as **(x + p)² = q**, then take the square root. Useful for finding the turning point of a graph.

### The discriminant (b² − 4ac)
- **> 0** → two distinct real roots
- **= 0** → one repeated root
- **< 0** → no real roots

> Exam tip: Substitute your answers back into the original equation. It takes ten seconds and catches most lost marks.

**Quick check:** For x² + 4x + 4 = 0, what is the discriminant and how many real roots are there?

Give me any quadratic and I will solve it with you, step by step.`,
  },
  {
    id: 'physics',
    label: 'Physics',
    keywords: ['physic', 'electric', 'circuit', 'ohm', 'resistance', 'voltage', 'current', 'series', 'parallel', 'power', 'force', 'newton'],
    suggestions: [
      "State Ohm's law and use it",
      'Series vs parallel circuits',
      'Quiz me on electricity',
    ],
    answer: () => `### Electricity — current, voltage and resistance

**Current (I)** is the rate of flow of charge, in amperes. **Voltage (V)** is the energy transferred per unit charge, in volts. **Resistance (R)** opposes current, in ohms.

### Ohm's law
**V = I × R**, provided the temperature stays constant.

**Worked example:** A 12 V supply drives 3 A through a resistor.
R = V ÷ I = 12 ÷ 3 = **4 Ω**.

### Series vs parallel
| Series | Parallel |
| --- | --- |
| Same current everywhere | Same voltage across each branch |
| Voltage shared | Current shared |
| R total = R₁ + R₂ | 1/R = 1/R₁ + 1/R₂ |

### Power
**P = V × I**. Energy = power × time (in joules if time is in seconds).

> Local analogy: Voltage is the pressure in a taxi route, resistance is the traffic jam, and current is how many taxis actually get through per minute.

**Quick check:** Two 6 Ω resistors are connected in parallel. What is the total resistance?

Want me to set a circuit calculation drill?`,
  },
  {
    id: 'chemistry',
    label: 'Chemistry',
    keywords: ['chem', 'acid', 'base', 'ph', 'neutral', 'alkali', 'mole', 'reaction', 'litmus', 'salt'],
    suggestions: [
      'Explain the pH scale',
      'What happens in neutralisation?',
      'Quiz me on acids and bases',
    ],
    answer: () => `### Acids, bases and the pH scale

An **acid** is a proton (H⁺) donor. A **base** is a proton acceptor. The **pH scale** runs from 0 to 14:
- **pH < 7** → acidic (e.g. lemon juice, HCl)
- **pH = 7** → neutral (pure water)
- **pH > 7** → alkaline (e.g. NaOH, soap)

### How to test
Acids turn **blue litmus red**; alkalis turn **red litmus blue**. Universal indicator gives a colour match across the whole scale.

### Neutralisation
**Acid + Base → Salt + Water**
For example: HCl + NaOH → NaCl + H₂O.

### Important practical rules
- Always add **acid to water**, never water to acid.
- Use a dropper near the endpoint of a titration.
- Wear goggles — safety marks matter in practicals.

> Exam tip: When naming a salt, the metal comes from the base and the second part comes from the acid (hydrochloric → chloride, sulphuric → sulphate, nitric → nitrate).

**Quick check:** What salt forms when sulphuric acid reacts with potassium hydroxide?

I can walk you through a titration calculation next.`,
  },
  {
    id: 'english',
    label: 'English',
    keywords: ['english', 'comprehension', 'summary', 'essay', 'composition', 'grammar', 'passage', 'letter'],
    suggestions: [
      'How do I write a strong summary?',
      'Give me a comprehension strategy',
      'Review my essay structure',
    ],
    answer: () => `### Comprehension and summary — a repeatable method

Most marks in English are lost through technique, not vocabulary.

### The four-step method
1. **Read the passage twice.** First for meaning, second with the questions in mind.
2. **Underline command words** — *state*, *describe*, *explain*, *compare*. Each demands a different depth.
3. **Answer in your own words.** Lifting long chunks usually scores zero.
4. **Count your points.** Two marks normally means two separate points.

### For summary questions
- Identify the **topic sentence** of each paragraph.
- Remove examples, repetition and dialogue.
- Link your points into clear sentences.
- Stick to the word limit.

### Essay structure that examiners reward
**Introduction → three developed body paragraphs → conclusion.** Each body paragraph needs a point, evidence and explanation.

> Exam tip: Spend two minutes planning. A planned essay scores higher than a longer unplanned one.

**Quick check:** A summary question is worth four marks. How many distinct points should you include?

Paste a paragraph and I will help you summarise it.`,
  },
];

const STUDY_TOPIC: Topic = {
  id: 'study-skills',
  label: 'Study Skills',
  keywords: ['study', 'revise', 'revision', 'exam', 'timetable', 'plan', 'motivat', 'focus', 'memory', 'notes'],
  suggestions: ['Build me a 5-day revision plan', 'How do I revise effectively?', 'Help me beat exam anxiety'],
  answer: (name) => `### A study system that actually works

You do not need to study longer, ${n(name)} — you need to study in a way your brain can retrieve later.

### The 3-pass method
1. **Preview (5 min):** skim headings, diagrams and bold words. Your brain now has hooks.
2. **Active study (25 min):** close the notes and write what you remember. Check, correct, repeat.
3. **Retrieval (10 min):** answer past-paper questions without looking. This is where real learning happens.

### Spacing beats cramming
Revise a topic **today, in 2 days, then in 1 week**. Short spaced sessions beat one long night.

### A simple weekly rhythm
- **Mon–Thu:** 45 minutes of active revision + 10 practice questions.
- **Fri:** review your mistakes only.
- **Sat:** one timed past paper.
- **Sun:** rest and plan the next week.

> Local proverb: *"Knowledge is like a garden: if it is not cultivated, it cannot be harvested."*

**Quick check:** What is the difference between re-reading and retrieval practice?

Tell me your weakest subject and I will build a 5-day plan around it.`,
};

const GENERIC_TOPIC: Topic = {
  id: 'general',
  label: 'General Tutoring',
  keywords: [],
  suggestions: ['What should I revise today?', 'Quiz me on Biology', 'Explain a concept simply'],
  answer: (name) => `### Let's break this down together

I can help you master the Ugandan NCDC O-Level syllabus step by step, ${n(name)}. To give you the best explanation, tell me which subject and topic you are working on.

### A useful way to ask
- *"Explain photosynthesis like I'm in Senior 2."*
- *"Solve 2x² − 7x + 3 = 0 and show every step."*
- *"Quiz me on the human transport system."*
- *"I keep losing marks in comprehension — what should I change?"*

### While you decide
Try this **3-minute warm-up**: open your notebook, write down everything you remember about your last lesson, then check it. The gaps you find are exactly what to study next.

> Teacher tip: If you can explain a concept to a classmate without notes, you probably own it.

**Quick check:** Which topic gave you the most trouble this week?

Choose a subject below and I will build a focused practice session.`,
};

const SUMMARY_KEYWORDS = ['summarise', 'summarize', 'summary', 'progress report', 'insight', 'how is my child', 'weekly report'];
const FEEDBACK_KEYWORDS = ['draft feedback', 'write feedback', 'student feedback', 'guidance message'];

export function detectTopic(message: string): string {
  const m = message.toLowerCase();
  for (const topic of TOPICS) {
    if (topic.keywords.some((k) => m.includes(k))) return topic.id;
  }
  if (STUDY_TOPIC.keywords.some((k) => m.includes(k))) return STUDY_TOPIC.id;
  return GENERIC_TOPIC.id;
}

function isGreeting(message: string) {
  const m = message.toLowerCase().trim();
  return (
    m.length < 48 &&
    /(^|\b)(hi|hello|hey|yo|salama|good (morning|afternoon|evening)|soma|start|help)(\b|$)/.test(m)
  );
}

function isSyllabus(message: string) {
  const m = message.toLowerCase();
  return ['syllabus', 'topics', 'what can you do', 'what do you teach', 'menu', 'subjects'].some((k) => m.includes(k));
}

function progressSummary(context: string, name: string): string {
  return `### Weekly progress snapshot — ${n(name)}

${context || 'The learner is active on Soma-Agent and completing practice consistently.'}

### What the data suggests
- **Strength:** consistent engagement and improving retrieval accuracy.
- **Watch point:** mastery is uneven across subjects — the weakest topic deserves the next two sessions.
- **Recommended action:** 20 minutes of active recall every evening, followed by one short AI quiz.

### This week's focus
1. Revisit the lowest-scoring unit and rewrite key definitions from memory.
2. Complete one timed quiz (3 questions) per day.
3. Review mistakes the next morning — not the same night.

> Guardian tip: Celebrate effort and habit, not only marks. A steady 20 minutes daily outperforms a weekend cram.

**Quick check:** Which subject should we prioritise this week — and how many minutes can you commit each evening?`;
}

function feedbackDraft(context: string): string {
  return `### Draft guidance message

Dear ${n(context)},

You have made **clear progress** this week, especially when you engage with the practice quizzes rather than just re-reading notes. Your understanding of core concepts is developing well.

**Keep doing:** short daily active-recall sessions and explaining answers aloud in your own words.

**Next focus:** slow down on multi-step questions and always show your working. Two or three structured practice questions each evening will close the gap faster than a long cram session.

**Remember:** progress is built in small, consistent steps. I am confident you can move into the top band this term.

> Impact is closer than it looks — keep going.

**Quick draft note:** personalise the highlighted section before sending.`;
}

export function localTutorReply({ message, context = '', studentName }: TutorRequest): LocalTutorReply {
  const text = (message || '').trim();
  const lower = text.toLowerCase();
  const name = studentName || extractName(context);

  if (SUMMARY_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      response: progressSummary(context, name),
      suggestions: ['What should we focus on first?', 'Draft a revision plan', 'Message the teacher'],
      topic: 'summary',
    };
  }

  if (FEEDBACK_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      response: feedbackDraft(extractName(context) || 'student'),
      suggestions: ['Make it more encouraging', 'Add a specific next step', 'Shorten this message'],
      topic: 'feedback',
    };
  }

  if (isSyllabus(text)) {
    return {
      response: `### Your O-Level study map

Here is the **NCDC-aligned** path we can work through together. Pick any unit and I will teach it, then quiz you.

### Biology
1. **Cell Biology** — organelles and cell specialisation
2. **Plant Nutrition** — photosynthesis and limiting factors
3. **Human Transport** — blood, heart and vessels
4. **Coordination** — nervous and endocrine control
5. **Homeostasis** — temperature, glucose and water balance

### Also available
- **Mathematics** — quadratics, algebra, simultaneous equations
- **Physics** — electricity, circuits and Ohm's law
- **Chemistry** — acids, bases and pH
- **English** — comprehension, summary and essay structure

> Study tip: Master one unit at a time. Depth beats coverage in O-Level exams.

**Quick check:** Which unit feels least secure right now, ${n(name)}?`,
      suggestions: ['Start with Cell Biology', 'Quiz me on Human Transport', 'Build a revision plan'],
      topic: 'syllabus',
    };
  }

  if (isGreeting(text) && text.length < 40) {
    return {
      response: `### Salama, ${n(name)}!

I am **Soma**, your AI study specialist for the Ugandan O-Level syllabus. I can explain concepts, work through past-paper style questions, and quiz you until a topic feels easy.

### Where would you like to start?
- **Cell Biology** — the building blocks of life
- **Plant Nutrition** — photosynthesis made simple
- **Human Transport** — the heart and circulation
- **Coordination** — reflexes and hormones
- **Homeostasis** — keeping the body steady

Or try: *"Quiz me on quadratics"* or *"Summarise my progress this week."*

> "Knowledge is like a garden: if it is not cultivated, it cannot be harvested."

**Quick check:** Which subject is your next exam, ${n(name)}?`,
      suggestions: ['Explain Cell Biology', 'Quiz me on Biology', 'What should I revise today?'],
      topic: 'greeting',
    };
  }

  const topicId = detectTopic(text);
  const topic = TOPICS.find((t) => t.id === topicId) || (topicId === 'study-skills' ? STUDY_TOPIC : GENERIC_TOPIC);

  return {
    response: topic.answer(name),
    suggestions: topic.suggestions,
    topic: topic.id,
  };
}

function extractName(context: string): string {
  const match = context.match(/(?:student|learner|name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  return match?.[1] || '';
}

export const TUTOR_SUGGESTIONS = {
  starter: ['Explain Cell Biology', 'Quiz me on Human Transport', 'Build my revision plan'],
  afterQuiz: ['Explain a concept I missed', 'Give me another question', 'What should I revise next?'],
};
