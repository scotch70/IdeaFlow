// ─────────────────────────────────────────────────────────────────────────────
// Brainstorm Circle radial layout.
//
// Given a measured canvas (or a default fallback when the canvas hasn't been
// measured yet), returns:
//   • the centre admin card's top-left position
//   • 8 member positions, starting at the top (12 o'clock) and stepping
//     clockwise so the order is Top → TopRight → Right → BottomRight →
//     Bottom → BottomLeft → Left → TopLeft (Member 1..8 per the brief).
//
// Positions are pixel coordinates inside the canvas, suitable for
// session_cards.x / y. The radius scales with canvas size so a wider workspace
// spreads the members further out without ever clipping them — `clampToCanvas`
// is applied as a final guard.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CANVAS_INSET, CARD_H, CARD_W, CanvasSize, clampToCanvas, isCanvasMeasured,
} from './layout'

/** Slightly bigger logical box for the admin card so it reads as the centrepiece. */
export const ADMIN_CARD_W = 264
export const ADMIN_CARD_H = 156

interface CirclePositions {
  admin:   { x: number; y: number }
  members: Array<{ x: number; y: number }>
}

/**
 * Picks a sensible radius for the 8 member cards. Aims for a circle that
 * sits comfortably between the admin card and the canvas edges; clamps to
 * a minimum so the layout looks intentional even on narrow viewports.
 */
function pickRadius(canvas: CanvasSize): number {
  // Half the smaller axis minus admin card + a margin so members never overlap
  // the admin and don't kiss the canvas edge.
  const inner = Math.min(canvas.w, canvas.h) / 2
  const r     = inner - Math.max(ADMIN_CARD_H, ADMIN_CARD_W) / 2 - CANVAS_INSET - 16
  return Math.max(180, r)
}

/**
 * Compute the radial layout for a Brainstorm Circle session.
 *
 * Falls back to a default 1000×680 canvas when nothing is measured yet — the
 * positions still get clamped at render time, and the auto-correct effect in
 * SessionWorkspace re-runs once the real canvas size is known.
 */
export function brainstormCirclePositions(canvas?: CanvasSize): CirclePositions {
  const c: CanvasSize = (canvas && isCanvasMeasured(canvas)) ? canvas : { w: 1000, h: 680 }

  const cx = c.w / 2
  const cy = c.h / 2
  const r  = pickRadius(c)

  // Admin top-left = canvas centre - half admin size
  const adminRaw = {
    x: cx - ADMIN_CARD_W / 2,
    y: cy - ADMIN_CARD_H / 2,
  }
  const admin = clampToCanvas(adminRaw.x, adminRaw.y, c, ADMIN_CARD_W, ADMIN_CARD_H)

  // 8 members at 45° steps, starting at top (-π/2) clockwise.
  const members = Array.from({ length: 8 }, (_, i) => {
    const angle = -Math.PI / 2 + i * (Math.PI / 4)
    const rawCx = cx + Math.cos(angle) * r
    const rawCy = cy + Math.sin(angle) * r
    const raw   = { x: rawCx - CARD_W / 2, y: rawCy - CARD_H / 2 }
    return clampToCanvas(raw.x, raw.y, c)
  })

  return { admin, members }
}
