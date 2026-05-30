// ─────────────────────────────────────────────────────────────────────────────
// Guided Thinking Frameworks — the new shape of Sessions.
//
// Sessions are no longer "pick a topic, get a blank canvas". Instead the user
// picks a thinking method that gives the session structure from the start.
// Each framework keeps the same 5-step backbone (Define → Action plan) so the
// rest of the workspace UI continues to work, but the per-step copy is now
// framework-specific and grounded in proven thinking techniques.
//
// Frameworks shipped here:
//   1. Starbursting        — flagship, central topic + 6 question spokes
//   2. SWOT Analysis       — Strengths / Weaknesses / Opportunities / Threats
//   3. Decision Matrix     — score options across weighted criteria
//   4. Customer Discovery  — probe a customer segment's pains and goals
//   5. Problem Solving     — root cause → candidate solutions
//   6. Freeform Canvas     — blank canvas, escape hatch for unstructured work
// ─────────────────────────────────────────────────────────────────────────────

import type { TemplateType, StepKey, CardType } from '@/types/sessions'

export const STEP_ORDER: readonly StepKey[] = [
  'define', 'explore', 'connect', 'prioritize', 'action',
] as const

export const STEP_LABEL: Record<StepKey, string> = {
  define:     'Define',
  explore:    'Explore',
  connect:    'Connect',
  prioritize: 'Prioritize',
  action:     'Action plan',
}

/**
 * One-line plain-English summary of what each step is for. Shown in the
 * collapsible sidebar under the active step so users understand the meaning
 * at a glance, without reading the longer per-framework prompts.
 */
export const STEP_HELPER: Record<StepKey, string> = {
  define:     'Clarify what you are solving — the topic, the audience, the goal.',
  explore:    'Open up the space — add ideas, angles, and questions.',
  connect:    'Link related thoughts so the structure starts to emerge.',
  prioritize: 'Choose what matters most.',
  action:     'Turn the best ideas into concrete next steps.',
}

export interface StepGuide {
  title:  string
  prompt: string
  tips:   string[]
  /** Card types the user is encouraged to add at this step */
  suggested: CardType[]
}

export interface SessionTemplate {
  type:         TemplateType
  name:         string
  emoji:        string
  description:  string
  /** What the user will have when they finish — concrete, not hand-wavy. */
  sampleOutcome: string
  /** Rough minutes to completion — sets expectation up-front. */
  estimateMinutes: number
  /** Featured frameworks render with a subtle "Featured" highlight on the picker. */
  featured?:    boolean
  steps:        Record<StepKey, StepGuide>
}

// ── Reusable guide blocks ────────────────────────────────────────────────────
const DEFAULT_CONNECT: StepGuide = {
  title:     'Link related thoughts',
  prompt:    'Draw connections between related cards. Which ideas, causes, or angles belong together?',
  tips:      [
    'Don’t over-connect — clarity beats completeness.',
    'Group cards that explore the same theme close together.',
  ],
  suggested: [],
}

const DEFAULT_PRIORITIZE: StepGuide = {
  title:     'Rank by impact',
  prompt:    'Star the cards that matter most. Aim for 1–3 “must-do” items, not ten.',
  tips:      [
    'Ask: if we could only do one of these, which has the biggest impact?',
    'Use Risk cards to stress-test your top picks before locking them in.',
  ],
  suggested: ['decision'],
}

const DEFAULT_ACTION: StepGuide = {
  title:     'Turn ideas into next steps',
  prompt:    'For each prioritized item, add Task cards small enough to start tomorrow.',
  tips:      [
    'Use verbs: "Draft…", "Interview…", "Ship…"',
    'Assign a tentative owner in the card content if it helps.',
  ],
  suggested: ['task'],
}

// ── Frameworks ───────────────────────────────────────────────────────────────

export const TEMPLATES: SessionTemplate[] = [
  {
    type:           'starbursting',
    name:           'Starbursting',
    emoji:          '✦',
    description:    'Explore a topic from every angle — Who, What, When, Where, Why, How.',
    sampleOutcome:  'A complete 360° view of the topic with the key questions surfaced and answered.',
    estimateMinutes: 20,
    featured:       true,
    steps: {
      define: {
        title:  'Name the central topic',
        prompt: 'In one short phrase, what are you exploring? Example: "Launch IdeaFlow Pro".',
        tips:   [
          'Keep it concrete — a decision, a launch, a problem.',
          'You can rename the topic any time from the central card.',
        ],
        suggested: ['problem'],
      },
      explore: {
        title:  'Answer the six questions',
        prompt: 'For each spoke (Who, What, When, Where, Why, How) capture the most important answers.',
        tips:   [
          'Aim for 1–3 answers per spoke. Quality over quantity.',
          'It’s OK to leave one spoke lighter than the others.',
        ],
        suggested: ['idea', 'audience'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:           'swot',
    name:           'SWOT Analysis',
    emoji:          '⊞',
    description:    'Map Strengths, Weaknesses, Opportunities, and Threats for a decision.',
    sampleOutcome:  'A balanced view of internal capabilities and external forces around the decision.',
    estimateMinutes: 15,
    steps: {
      define: {
        title:  'What are you analysing?',
        prompt: 'State the decision, project, or product you’re weighing.',
        tips:   ['Be specific — "Launch in Germany" beats "International expansion".'],
        suggested: ['problem', 'decision'],
      },
      explore: {
        title:  'Strengths, Weaknesses, Opportunities, Threats',
        prompt: 'Add cards in each quadrant. Strengths and Weaknesses are internal; Opportunities and Threats are external.',
        tips:   [
          'Be honest about weaknesses — that’s where the real insight is.',
          'Threats often hint at the next big opportunity.',
        ],
        suggested: ['idea', 'risk', 'cause'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:           'decision-matrix',
    name:           'Decision Matrix',
    emoji:          '⚖',
    description:    'Score options across weighted criteria to find the clear winner.',
    sampleOutcome:  'A ranked list of options with reasoning the team can stand behind.',
    estimateMinutes: 15,
    steps: {
      define: {
        title:  'List the options',
        prompt: 'Add a card per option you’re choosing between. Then list the criteria you care about.',
        tips:   ['Don’t skip "do nothing" — it’s a real option.'],
        suggested: ['idea', 'decision'],
      },
      explore: {
        title:  'Score each option',
        prompt: 'Walk each criterion and rate each option (1–5). Note your reasoning in the card.',
        tips:   ['Weight the criteria that matter most before scoring.'],
        suggested: ['idea', 'risk'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: {
        title:     'Pick the winner',
        prompt:    'Star the option with the strongest score. Add a Decision card to lock it in.',
        tips:      ['If two options tie, your criteria are probably wrong.'],
        suggested: ['decision'],
      },
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:           'customer-discovery',
    name:           'Customer Discovery',
    emoji:          '◎',
    description:    'Probe a customer segment — pains, goals, and existing solutions.',
    sampleOutcome:  'Validated assumptions about a specific customer, ready to test in interviews.',
    estimateMinutes: 25,
    steps: {
      define: {
        title:  'Pin the customer',
        prompt: 'One audience card. Be specific: "mid-market HR leaders", not "businesses".',
        tips:   ['Anyone you can’t name is too generic.'],
        suggested: ['audience', 'problem'],
      },
      explore: {
        title:  'Pains, goals, current alternatives',
        prompt: 'Add Pain Point cards for what they struggle with, Idea cards for goals, and Cause cards for what they use today.',
        tips:   ['Walk through their day — what makes them sigh, what makes them smile.'],
        suggested: ['pain', 'cause', 'idea'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     {
        title:     'Plan the interviews',
        prompt:    'Add Task cards for the 5–10 people you should talk to next week.',
        tips:      ['Use names if you have them.'],
        suggested: ['task'],
      },
    },
  },
  {
    type:           'problem-solving',
    name:           'Problem Solving',
    emoji:          '◇',
    description:    'Trace a problem to its root causes and brainstorm fixes.',
    sampleOutcome:  'A clear root cause plus 3 prioritised candidate solutions.',
    estimateMinutes: 20,
    steps: {
      define: {
        title:  'State the problem',
        prompt: 'What’s broken? Who feels it? What’s the cost of leaving it alone?',
        tips:   ['Avoid solutions disguised as problems.'],
        suggested: ['problem', 'audience', 'pain'],
      },
      explore: {
        title:  'Find the causes, then the fixes',
        prompt: 'List underlying causes first. Only then brainstorm a wide set of possible fixes.',
        tips:   ['Aim for 10 ideas at first — quantity, then editing.'],
        suggested: ['cause', 'idea', 'risk'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:           'freeform',
    name:           'Freeform Canvas',
    emoji:          '◯',
    description:    'A blank canvas. Bring your own structure.',
    sampleOutcome:  'An open visual map of whatever’s in your head.',
    estimateMinutes: 0,   // 0 = "open-ended"
    steps: {
      define: {
        title:  'Start anywhere',
        prompt: 'Drop a thought on the canvas. You can rename steps later.',
        tips:   ['Use the card types as scaffolding when you need structure.'],
        suggested: ['idea'],
      },
      explore: {
        title:  'Expand',
        prompt: 'Add more cards. Don’t edit yet — just get them out.',
        tips:   ['Quantity first, polish later.'],
        suggested: ['idea'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
]

export const TEMPLATE_BY_TYPE: Record<TemplateType, SessionTemplate> =
  TEMPLATES.reduce((acc, t) => { acc[t.type] = t; return acc }, {} as Record<TemplateType, SessionTemplate>)

/**
 * Look up a template by type. Returns the freeform template for any
 * unknown / legacy value (e.g. old 'startup-idea' rows still in the DB),
 * so old sessions continue to load without crashing.
 */
export function getTemplate(type: TemplateType | string): SessionTemplate {
  return (TEMPLATE_BY_TYPE as Record<string, SessionTemplate>)[type] ?? TEMPLATE_BY_TYPE['freeform']
}
