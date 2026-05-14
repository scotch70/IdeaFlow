export interface DemoComment {
  id: string
  author: string
  avatar: string
  text: string
  ago: string
}

export interface DemoIdea {
  id: string
  title: string
  body: string
  author: string
  avatar: string
  ago: string
  votes: number
  status: 'open' | 'planned' | 'done'
  comments: DemoComment[]
  tags?: string[]
}

export interface DemoFlow {
  id: string
  name: string
  prompt: string
  status: 'active' | 'draft' | 'closed'
  memberCount: number
  ideas: DemoIdea[]
}

const avatars: Record<string, string> = {
  Sara: 'SA',
  James: 'JM',
  Priya: 'PR',
  Tom: 'TK',
  Elena: 'EL',
  Marcus: 'MC',
  Lena: 'LH',
  Finn: 'FO',
  Dani: 'DV',
  Kenji: 'KT',
}

export const DEMO_FLOWS: DemoFlow[] = [
  {
    id: 'product',
    name: 'Product Improvements',
    prompt: 'What should we build, fix, or improve in our product this quarter?',
    status: 'active',
    memberCount: 14,
    ideas: [
      {
        id: 'p1',
        title: 'Keyboard shortcuts for power users',
        body: 'Add a global shortcut panel (⌘K) so team members can navigate, create, and vote without touching the mouse. Would dramatically speed up daily usage.',
        author: 'Sara', avatar: avatars.Sara, ago: '2 days ago', votes: 31, status: 'planned',
        tags: ['UX', 'Power users'],
        comments: [
          { id: 'c1', author: 'James', avatar: avatars.James, text: 'Yes — I\'d use this every single day. Huge +1.', ago: '1 day ago' },
          { id: 'c2', author: 'Priya', avatar: avatars.Priya, text: 'Could we also add keyboard nav for idea cards?', ago: '18h ago' },
        ],
      },
      {
        id: 'p2',
        title: 'Weekly digest email with top ideas',
        body: 'Send a summary every Monday with the top 3 ideas by votes from the previous week. Keeps everyone in the loop without logging in.',
        author: 'Tom', avatar: avatars.Tom, ago: '3 days ago', votes: 27, status: 'open',
        tags: ['Notifications', 'Engagement'],
        comments: [
          { id: 'c3', author: 'Elena', avatar: avatars.Elena, text: 'We\'ve been asking for this — great idea.', ago: '2 days ago' },
        ],
      },
      {
        id: 'p3',
        title: 'Anonymous submission mode',
        body: 'Let admins enable an anonymous mode per IdeaFlow. Some topics (culture, management feedback) get better participation when people aren\'t worried about attribution.',
        author: 'Marcus', avatar: avatars.Marcus, ago: '4 days ago', votes: 24, status: 'open',
        tags: ['Privacy', 'Engagement'],
        comments: [
          { id: 'c4', author: 'Lena', avatar: avatars.Lena, text: 'This would unlock a whole category of feedback we can\'t collect today.', ago: '3 days ago' },
          { id: 'c5', author: 'Tom', avatar: avatars.Tom, text: 'Agreed. Would make the culture flow much more honest.', ago: '2 days ago' },
        ],
      },
      {
        id: 'p4',
        title: 'Slack integration for new idea notifications',
        body: 'Post a message to a Slack channel whenever a new idea is added or reaches a vote threshold. Keeps visibility high without everyone having to check the dashboard.',
        author: 'Priya', avatar: avatars.Priya, ago: '5 days ago', votes: 19, status: 'open',
        tags: ['Integrations'],
        comments: [],
      },
      {
        id: 'p5',
        title: 'Pin ideas to keep them visible',
        body: 'Admins should be able to pin 1–2 ideas to the top of the list, even if they\'re not the highest voted. Useful for ideas we\'re actively discussing.',
        author: 'Finn', avatar: avatars.Finn, ago: '6 days ago', votes: 12, status: 'open',
        tags: ['Admin tools'],
        comments: [
          { id: 'c6', author: 'Sara', avatar: avatars.Sara, text: 'Would be useful for the review section too.', ago: '5 days ago' },
        ],
      },
      {
        id: 'p6',
        title: 'Idea status changelog visible to submitters',
        body: 'When an admin updates an idea from Open to Planned or Done, the person who submitted it should get a notification and see a status trail.',
        author: 'Dani', avatar: avatars.Dani, ago: '1 week ago', votes: 9, status: 'done',
        tags: ['Transparency'],
        comments: [],
      },
    ],
  },
  {
    id: 'culture',
    name: 'Team Culture',
    prompt: 'How can we make Meridian a better place to work? Share ideas for culture, wellbeing, and ways of working.',
    status: 'active',
    memberCount: 22,
    ideas: [
      {
        id: 'cu1',
        title: 'No-meeting Wednesdays',
        body: 'Block out every Wednesday as a deep work day with no internal meetings. Even just one day a week of uninterrupted focus would compound over time.',
        author: 'Elena', avatar: avatars.Elena, ago: '1 day ago', votes: 38, status: 'planned',
        tags: ['Focus', 'Meetings'],
        comments: [
          { id: 'c7', author: 'Marcus', avatar: avatars.Marcus, text: 'This is the single thing I hear most from engineers. Please.', ago: '1 day ago' },
          { id: 'c8', author: 'Kenji', avatar: avatars.Kenji, text: 'Could we start with bi-weekly and see how it goes?', ago: '20h ago' },
        ],
      },
      {
        id: 'cu2',
        title: 'Monthly learning budget — €100/person',
        body: 'Give each person €100/month for books, courses, or conferences. No approval needed under €100. Trust people to invest in themselves.',
        author: 'Lena', avatar: avatars.Lena, ago: '2 days ago', votes: 29, status: 'open',
        tags: ['L&D', 'Benefits'],
        comments: [
          { id: 'c9', author: 'Dani', avatar: avatars.Dani, text: 'Even €50 would make a difference. Easy yes.', ago: '2 days ago' },
        ],
      },
      {
        id: 'cu3',
        title: 'Async-first update culture',
        body: 'Shift status updates to Loom videos or written recaps instead of live standup. Would work better for our distributed team and let people actually prepare.',
        author: 'James', avatar: avatars.James, ago: '3 days ago', votes: 22, status: 'open',
        tags: ['Async', 'Remote'],
        comments: [],
      },
      {
        id: 'cu4',
        title: 'Quarterly team offsites — even remote-friendly',
        body: 'A 2-day offsite focused on connection, not work. Can be hybrid with the remote team joining the first day over video for shared activities.',
        author: 'Finn', avatar: avatars.Finn, ago: '5 days ago', votes: 17, status: 'open',
        tags: ['Connection', 'Remote'],
        comments: [
          { id: 'c10', author: 'Sara', avatar: avatars.Sara, text: 'I joined mid-pandemic and still haven\'t met half the team in person.', ago: '4 days ago' },
        ],
      },
      {
        id: 'cu5',
        title: 'Anonymous end-of-quarter culture survey',
        body: 'A short 5-question pulse survey every quarter, fully anonymous. Results shared with the whole company, not just leadership.',
        author: 'Priya', avatar: avatars.Priya, ago: '1 week ago', votes: 14, status: 'open',
        tags: ['Feedback', 'Transparency'],
        comments: [],
      },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    prompt: 'What processes, tools, or workflows could we improve to help everyone work more effectively?',
    status: 'active',
    memberCount: 11,
    ideas: [
      {
        id: 'op1',
        title: 'Single source of truth for internal docs',
        body: 'Our documentation is split across Notion, Google Docs, Confluence, and Slack messages. We need one definitive place — and a rule that nothing else counts.',
        author: 'Tom', avatar: avatars.Tom, ago: '1 day ago', votes: 25, status: 'planned',
        tags: ['Documentation', 'Tools'],
        comments: [
          { id: 'c11', author: 'Marcus', avatar: avatars.Marcus, text: 'The Notion migration never finished and it\'s causing real confusion.', ago: '20h ago' },
        ],
      },
      {
        id: 'op2',
        title: 'Standardize our sprint review format',
        body: 'Each team runs their sprint review differently. A shared lightweight template would make cross-team demos easier to follow and archive.',
        author: 'Kenji', avatar: avatars.Kenji, ago: '3 days ago', votes: 16, status: 'open',
        tags: ['Process', 'Meetings'],
        comments: [],
      },
      {
        id: 'op3',
        title: 'Automate new hire onboarding checklist',
        body: 'Our onboarding is still done manually via a spreadsheet. A proper Notion template or automated task system would save the ops team several hours per hire.',
        author: 'Dani', avatar: avatars.Dani, ago: '4 days ago', votes: 13, status: 'open',
        tags: ['HR', 'Automation'],
        comments: [
          { id: 'c12', author: 'Lena', avatar: avatars.Lena, text: 'I spent 3 hours doing this manually last month. Automate it please.', ago: '3 days ago' },
        ],
      },
      {
        id: 'op4',
        title: 'Deprecate the Tuesday all-hands',
        body: 'Our all-hands has grown to 90 minutes and covers things better suited to async updates. Could we move to a monthly written update + quarterly live session?',
        author: 'Elena', avatar: avatars.Elena, ago: '6 days ago', votes: 10, status: 'open',
        tags: ['Meetings', 'Async'],
        comments: [],
      },
    ],
  },
  {
    id: 'hiring',
    name: 'Hiring & Growth',
    prompt: 'How should we grow the team? What roles, skills, or approaches should we prioritize?',
    status: 'draft',
    memberCount: 6,
    ideas: [
      {
        id: 'h1',
        title: 'Hire a dedicated design lead',
        body: 'Design is currently spread thin across 3 engineers who all "can do Figma". We need a proper design lead before the next product push — someone who owns the system.',
        author: 'Sara', avatar: avatars.Sara, ago: '2 days ago', votes: 21, status: 'open',
        tags: ['Design', 'Leadership'],
        comments: [
          { id: 'c13', author: 'Finn', avatar: avatars.Finn, text: 'Agreed. Design debt is starting to slow down engineering too.', ago: '1 day ago' },
        ],
      },
      {
        id: 'h2',
        title: 'Build an engineering referral bonus program',
        body: 'Referrals consistently produce better hires than job boards. A €2,000 bonus for a hire who passes probation would pay for itself many times over.',
        author: 'James', avatar: avatars.James, ago: '4 days ago', votes: 18, status: 'open',
        tags: ['Recruitment', 'Engineering'],
        comments: [],
      },
      {
        id: 'h3',
        title: 'Intern program — summer 2026',
        body: 'A 3-month summer internship program for 2–3 students. Structured, with real projects and a mentor assigned. Good for pipeline and good for our brand.',
        author: 'Priya', avatar: avatars.Priya, ago: '5 days ago', votes: 14, status: 'open',
        tags: ['Pipeline', 'Brand'],
        comments: [
          { id: 'c14', author: 'Tom', avatar: avatars.Tom, text: 'We had a great experience doing this at my last company.', ago: '4 days ago' },
        ],
      },
      {
        id: 'h4',
        title: 'Add a paid take-home over live coding interviews',
        body: 'Live coding causes anxiety and doesn\'t reflect how engineers actually work. A compensated take-home task shows real problem-solving and treats candidates better.',
        author: 'Marcus', avatar: avatars.Marcus, ago: '1 week ago', votes: 11, status: 'planned',
        tags: ['Interviews', 'Engineering'],
        comments: [],
      },
    ],
  },
]
