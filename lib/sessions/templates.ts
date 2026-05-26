// ─────────────────────────────────────────────────────────────────────────────
// Session templates
//
// Each template defines the 5 guided steps (Define → Action Plan) and a
// per-step prompt + tip set rendered in the right-hand GuidePanel. Templates
// also suggest a starter card the user can spawn with one click — this is
// the only "AI-ish" feel that's truly required for the MVP.
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
  steps:        Record<StepKey, StepGuide>
}

// ── Reusable guide blocks ────────────────────────────────────────────────────
const DEFAULT_CONNECT: StepGuide = {
  title:     'Link related thoughts',
  prompt:    'Drag from one card to another to draw a connection. Which ideas, risks, or causes belong together?',
  tips:      [
    'Connect each Idea back to the Problem it solves.',
    'Group Causes that contribute to the same Pain Point.',
    'Don’t over-connect — clarity beats completeness.',
  ],
  suggested: [],
}

const DEFAULT_PRIORITIZE: StepGuide = {
  title:     'Rank by impact',
  prompt:    'Star the cards that matter most. Aim for 1–3 “must-do” ideas, not ten.',
  tips:      [
    'Ask: if we could only do one of these, which would have the biggest impact?',
    'Move winning cards to the centre of the canvas.',
    'Use Risk cards to challenge top ideas before locking them in.',
  ],
  suggested: ['decision'],
}

const DEFAULT_ACTION: StepGuide = {
  title:     'Turn ideas into next steps',
  prompt:    'For each prioritized idea, add Task cards. Each task should be small enough to start tomorrow.',
  tips:      [
    'Use verbs: “Draft…”, “Interview…”, “Ship…”',
    'Assign a tentative owner in the card content if it helps.',
    'When you finish, Export to save the action plan.',
  ],
  suggested: ['task'],
}

// ── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATES: SessionTemplate[] = [
  {
    type:        'startup-idea',
    name:        'Startup Idea',
    emoji:       '🚀',
    description: 'Pressure-test a startup idea end-to-end — problem, audience, why now, risks.',
    steps: {
      define: {
        title:  'What is the idea, in one sentence?',
        prompt: 'Write the problem you’re solving and who you’re solving it for.',
        tips:   [
          'If you can’t name the audience, the idea is too broad.',
          'Lead with the pain, not the product.',
        ],
        suggested: ['problem', 'audience'],
      },
      explore: {
        title:  'Why now? Why this?',
        prompt: 'Brainstorm causes, alternatives, and the unique angle. What’s changed in the world that makes this possible?',
        tips:   [
          'List 3 competitors and what they get wrong.',
          'Note any “unfair advantages” you have.',
        ],
        suggested: ['cause', 'idea', 'risk'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:        'product-feature',
    name:        'Product Feature',
    emoji:       '✨',
    description: 'Plan a new feature: who it’s for, what problem it solves, and what to build first.',
    steps: {
      define: {
        title:  'What feature, for whom?',
        prompt: 'State the feature in one line and the user it serves.',
        tips:   ['Pin the user job-to-be-done, not the UI.'],
        suggested: ['problem', 'audience'],
      },
      explore: {
        title:  'Variations and trade-offs',
        prompt: 'Sketch 3 different ways to solve this. What does each give up?',
        tips:   ['Include a “do nothing” option to clarify cost of inaction.'],
        suggested: ['idea', 'risk'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:        'marketing-campaign',
    name:        'Marketing Campaign',
    emoji:       '📣',
    description: 'Shape a campaign’s audience, message, channels, and what success looks like.',
    steps: {
      define: {
        title:  'Audience and outcome',
        prompt: 'Who is the campaign for and what do you want them to do?',
        tips:   ['Be specific: “mid-market HR leaders” beats “businesses”.'],
        suggested: ['audience', 'problem'],
      },
      explore: {
        title:  'Channels, hooks, and proof',
        prompt: 'Brainstorm channels, headlines, and the proof you’ll lead with.',
        tips:   ['One strong hook beats five weak ones.'],
        suggested: ['idea', 'cause'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:        'content-planning',
    name:        'Content Planning',
    emoji:       '✍️',
    description: 'Build a content slate: pillars, audiences, formats, and what to ship first.',
    steps: {
      define: {
        title:  'Topic and reader',
        prompt: 'What’s the central topic and who is reading it?',
        tips:   ['Pin one reader. Generic content reaches no one.'],
        suggested: ['audience', 'problem'],
      },
      explore: {
        title:  'Angles and formats',
        prompt: 'Brainstorm headlines, formats (essay, video, thread), and adjacent angles.',
        tips:   ['Each angle should make a clear claim a reader can disagree with.'],
        suggested: ['idea'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:        'problem-solving',
    name:        'Problem Solving',
    emoji:       '🧩',
    description: 'Untangle a hairy problem — surface causes, audiences, and candidate solutions.',
    steps: {
      define: {
        title:  'State the problem',
        prompt: 'What’s broken? Who feels it? What’s the cost of leaving it alone?',
        tips:   ['Avoid solutions disguised as problems.'],
        suggested: ['problem', 'audience', 'pain'],
      },
      explore: {
        title:  'Causes and possible fixes',
        prompt: 'List underlying causes, then brainstorm a wide set of possible fixes.',
        tips:   ['Aim for quantity here — 10 ideas, not 2.'],
        suggested: ['cause', 'idea', 'risk'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: DEFAULT_PRIORITIZE,
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:        'decision-making',
    name:        'Decision Making',
    emoji:       '⚖️',
    description: 'Make a tough call: lay out options, trade-offs, risks, and pick one.',
    steps: {
      define: {
        title:  'What’s the decision?',
        prompt: 'State the choice clearly. Why does it need to be made now?',
        tips:   ['If “do nothing” is a real option, name it.'],
        suggested: ['problem', 'decision'],
      },
      explore: {
        title:  'Options and consequences',
        prompt: 'Add each option as a card. For each, what’s the risk and the upside?',
        tips:   ['Be honest about second-order effects.'],
        suggested: ['idea', 'risk'],
      },
      connect:    DEFAULT_CONNECT,
      prioritize: {
        title:     'Score the options',
        prompt:    'Star your top option. Use Risk cards to stress-test it.',
        tips:      ['Best decision = most robust under bad cases, not just best in the best case.'],
        suggested: ['decision'],
      },
      action:     DEFAULT_ACTION,
    },
  },
  {
    type:        'freeform',
    name:        'Freeform Session',
    emoji:       '🌿',
    description: 'A blank canvas. No prompts, no rules — just space to think.',
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

export function getTemplate(type: TemplateType): SessionTemplate {
  return TEMPLATE_BY_TYPE[type] ?? TEMPLATE_BY_TYPE['freeform']
}
