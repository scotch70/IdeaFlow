// ─────────────────────────────────────────────────────────────────────────────
// Guided Thinking Frameworks — current shape of Sessions.
//
// Two frameworks are visible in the picker today:
//
//   1. Brainstorm Circle  (featured / default)
//        One central admin topic + 8 fixed member spokes around it. Members
//        write their input, everyone hearts the strongest ideas. Cards in this
//        framework are locked in place and rendered with hearts (see
//        SessionCanvas + SessionWorkspace which special-case the template).
//
//   2. Starbursting
//        Central topic + 6 question spokes (Who/What/When/Where/Why/How).
//        Free-form drag canvas behind the scenes.
//
// Legacy template types (swot, decision-matrix, customer-discovery,
// problem-solving) live in TEMPLATE_TYPES so old session rows still type-check
// and load; getTemplate() falls back to FREEFORM_FALLBACK for any unrecognised
// value so legacy sessions render rather than crash.
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
  type:           TemplateType
  name:           string
  emoji:          string
  description:    string
  sampleOutcome:  string
  estimateMinutes: number
  /** Featured frameworks render with a subtle highlight on the picker. */
  featured?:      boolean
  /** Hide the Add Card form in the Guide panel and show an instructions
   *  block instead — used by structured frameworks where the card set is
   *  pre-seeded (e.g. Brainstorm Circle, Starbursting). */
  hideAddCardForm?: boolean
  /** Lock card positions on the canvas. Drag is suppressed; Reset View can
   *  restore the original radial layout. */
  lockedLayout?:    boolean
  /** Hearts on cards in this session — likes are fetched from the
   *  session_card_likes table. */
  showHearts?:      boolean
  steps:          Record<StepKey, StepGuide>
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

// ── The two visible frameworks ───────────────────────────────────────────────

export const BRAINSTORM_CIRCLE_TEMPLATE: SessionTemplate = {
  type:            'brainstorm-circle',
  name:            'Brainstorm Circle',
  emoji:           '○',
  description:     'Collect input from up to 8 members around one central topic.',
  sampleOutcome:   'A ranked set of member ideas around a shared question.',
  estimateMinutes: 15,
  featured:        true,
  hideAddCardForm: true,
  lockedLayout:    true,
  showHearts:      true,
  steps: {
    define: {
      title:  'Set the central topic',
      prompt: 'Edit the admin card in the middle. What question do you want the team to weigh in on?',
      tips:   [
        'One concrete question works best ("Should we…", "How might we…").',
        'You can rename the topic any time.',
      ],
      suggested: [],
    },
    explore: {
      title:  'Gather member input',
      prompt: 'Each member edits their card with their honest take. Short sentences read best.',
      tips:   ['Eight members are pre-seeded; only fill the ones you have.'],
      suggested: [],
    },
    connect: {
      title:     'Heart the strongest ideas',
      prompt:    'Read every member card and click the heart on the ideas you most agree with.',
      tips:      ['One person, one heart per card — duplicates cancel out.'],
      suggested: [],
    },
    prioritize: {
      title:     'Surface the favourite',
      prompt:    'The most-hearted member cards are your priorities. Star them too if you want them in the outcome.',
      tips:      [],
      suggested: ['decision'],
    },
    action:     DEFAULT_ACTION,
  },
}

export const STARBURSTING_TEMPLATE: SessionTemplate = {
  type:            'starbursting',
  name:            'Starbursting',
  emoji:           '✦',
  description:     'Explore an idea from every angle with Who, What, When, Where, Why and How.',
  sampleOutcome:   'A complete 360° view of the topic with the key questions surfaced and answered.',
  estimateMinutes: 20,
  steps: {
    define: {
      title:  'Name the central topic',
      prompt: 'In one short phrase, what are you exploring? Example: "Launch IdeaFlow Pro".',
      tips:   ['Keep it concrete — a decision, a launch, a problem.'],
      suggested: ['problem'],
    },
    explore: {
      title:  'Answer the six questions',
      prompt: 'For each spoke (Who, What, When, Where, Why, How) capture the most important answers.',
      tips:   ['Aim for 1–3 answers per spoke. Quality over quantity.'],
      suggested: ['idea', 'audience'],
    },
    connect:    DEFAULT_CONNECT,
    prioritize: DEFAULT_PRIORITIZE,
    action:     DEFAULT_ACTION,
  },
}

/** Fallback used for unknown / legacy template_type values. Not shown in the
 *  picker but keeps old sessions from crashing. */
const FREEFORM_FALLBACK: SessionTemplate = {
  type:            'freeform',
  name:            'Freeform',
  emoji:           '◯',
  description:     'A blank canvas.',
  sampleOutcome:   'An open visual map of whatever’s in your head.',
  estimateMinutes: 0,
  steps: {
    define:     { title: 'Start anywhere',     prompt: 'Drop a thought on the canvas.',  tips: [], suggested: ['idea'] },
    explore:    { title: 'Expand',             prompt: 'Add more cards.',                tips: [], suggested: ['idea'] },
    connect:    DEFAULT_CONNECT,
    prioritize: DEFAULT_PRIORITIZE,
    action:     DEFAULT_ACTION,
  },
}

/** Ordered list shown in the picker. Featured templates first. */
export const TEMPLATES: SessionTemplate[] = [
  BRAINSTORM_CIRCLE_TEMPLATE,
  STARBURSTING_TEMPLATE,
]

const TEMPLATE_BY_TYPE: Record<string, SessionTemplate> = {
  [BRAINSTORM_CIRCLE_TEMPLATE.type]: BRAINSTORM_CIRCLE_TEMPLATE,
  [STARBURSTING_TEMPLATE.type]:      STARBURSTING_TEMPLATE,
  freeform:                          FREEFORM_FALLBACK,
}

/**
 * Look up a template by type. Returns the freeform fallback for any unknown /
 * legacy value (e.g. old 'swot' / 'startup-idea' rows still in the DB), so old
 * sessions continue to load without crashing.
 */
export function getTemplate(type: TemplateType | string): SessionTemplate {
  return TEMPLATE_BY_TYPE[type] ?? FREEFORM_FALLBACK
}
