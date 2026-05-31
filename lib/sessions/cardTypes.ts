// ─────────────────────────────────────────────────────────────────────────────
// Card type metadata — colors, labels, suggested width.
//
// Colors are tuned for the dark canvas (sessions only). Each one is a calm
// muted hue with enough saturation to distinguish the eight types at a glance
// without screaming for attention.
// ─────────────────────────────────────────────────────────────────────────────

import type { CardType } from '@/types/sessions'

export interface CardTypeMeta {
  type:    CardType
  label:   string
  /** Used as the card's left accent stripe and the type chip background tint. */
  accent:  string
  /** Solid color for the type chip text. */
  ink:     string
  /** Subtle background tint applied to the card body. */
  bg:      string
  hint:    string
}

export const CARD_TYPE_META: Record<CardType, CardTypeMeta> = {
  problem:  { type: 'problem',  label: 'Problem',    accent: '#f97316', ink: '#fdba74', bg: 'rgba(249,115,22,0.07)',  hint: 'What hurts, what’s broken' },
  audience: { type: 'audience', label: 'Audience',   accent: '#3b82f6', ink: '#93c5fd', bg: 'rgba(59,130,246,0.07)',  hint: 'Who is this for' },
  pain:     { type: 'pain',     label: 'Pain point', accent: '#ef4444', ink: '#fca5a5', bg: 'rgba(239,68,68,0.07)',   hint: 'How the problem feels' },
  cause:    { type: 'cause',    label: 'Cause',      accent: '#a78bfa', ink: '#c4b5fd', bg: 'rgba(167,139,250,0.07)', hint: 'Why it happens' },
  idea:     { type: 'idea',     label: 'Idea',       accent: '#10b981', ink: '#6ee7b7', bg: 'rgba(16,185,129,0.07)',  hint: 'A possible solution' },
  risk:     { type: 'risk',     label: 'Risk',       accent: '#f59e0b', ink: '#fcd34d', bg: 'rgba(245,158,11,0.07)',  hint: 'What could go wrong' },
  decision: { type: 'decision', label: 'Decision',   accent: '#06b6d4', ink: '#67e8f9', bg: 'rgba(6,182,212,0.07)',   hint: 'A locked-in choice' },
  task:     { type: 'task',     label: 'Task',       accent: '#94a3b8', ink: '#cbd5e1', bg: 'rgba(148,163,184,0.08)', hint: 'A concrete next step' },
  // Custom is intentionally neutral — the user's `custom_label` becomes the
  // chip text at render time, so the metadata here is only the visual styling.
  custom:   { type: 'custom',   label: 'Custom',     accent: '#7c93b3', ink: '#cbd5e1', bg: 'rgba(124,147,179,0.07)', hint: 'Your own category' },
}

/**
 * Returns the chip text for a card. Falls back to the built-in meta label
 * unless the card carries a custom_label (and is type='custom').
 */
export function cardChipLabel(c: { type: CardType; custom_label: string | null }): string {
  if (c.type === 'custom' && c.custom_label && c.custom_label.trim()) {
    return c.custom_label.trim()
  }
  return CARD_TYPE_META[c.type].label
}

export const CARD_TYPES_ORDERED: CardType[] = [
  'problem', 'audience', 'pain', 'cause', 'idea', 'risk', 'decision', 'task', 'custom',
]
