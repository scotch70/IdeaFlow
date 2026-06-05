// ─────────────────────────────────────────────────────────────────────────────
// Brainstorm Circle radial layout.
//
// Given a measured canvas (or a default fallback when the canvas hasn't been
// measured yet), returns:
//   • the centre admin card's top-left position
//   • 8 member positions, starting at the top (12 o'clock) and stepping
//     clockwise: Top → TopRight → Right → BottomRight → Bottom → BottomLeft
//     → Left → TopLeft (Member 1..8 per the brief).
//
// Positions are pixel coordinates inside the canvas, suitable for
// session_cards.x / y. The radius targets ~320px on roomy canvases and
// shrinks only when the canvas physically can't fit a larger circle.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CANVAS_INSET, CARD_H, CARD_W, CanvasSize, clampToCanvas, isCanvasMeasured,
} from './layout'

/** Bigger logical box for the admin card so it reads as the clear focal
 *  point. Matches the DemoBrainstormCircle proportions. */
export const ADMIN_CARD_W = 340
export const ADMIN_CARD_H = 200

interface CirclePositions {
  admin:   { x: number; y: number }
  members: Array<{ x: number; y: number }>
}

/**
 * Pick the largest radius that fits the 8 member cards inside the canvas
 * without clipping. The binding constraint is whichever axis is smaller
 * (width or height) minus the relevant card half-dimension and the canvas
 * inset.
 *
 * On generous canvases we target ~320 px (mid of the 300–360 range the
 * brief asks for) so the layout reads as airy. On tight canvases the
 * ceiling wins and we still produce a recognisable circle (floor 240 px).
 * Auto-collapsing the side panels on Brainstorm Circle open is what
 * actually gives the canvas the room it needs to hit the target.
 */
function pickRadius(canvas: CanvasSize): number {
  // Axis-specific ceilings. Cards span ±CARD_W/2 horizontally and
  // ±CARD_H/2 vertically from their centre, so the horizontal ceiling
  // uses CARD_W and the vertical ceiling uses CARD_H.
  const ceilingX = canvas.w / 2 - CARD_W / 2 - CANVAS_INSET
  const ceilingY = canvas.h / 2 - CARD_H / 2 - CANVAS_INSET
  const ceiling  = Math.min(ceilingX, ceilingY)
  return Math.max(240, Math.min(320, ceiling))
}

/**
 * Compute the radial layout for a Brainstorm Circle session.
 *
 * Falls back to a 1264 × 760 logical canvas when nothing has been measured
 * yet — matches the typical session viewport after the dashboard sidebar,
 * session-steps rail, and guide panel auto-collapse. The auto-correct
 * effect in SessionWorkspace re-runs once the real canvas size is known.
 *
 * Admin card sits exactly at canvas centre. The 8 member cards are placed
 * evenly around it at 45° intervals (clockwise from the top).
 */
export function brainstormCirclePositions(canvas?: CanvasSize): CirclePositions {
  const c: CanvasSize = (canvas && isCanvasMeasured(canvas)) ? canvas : { w: 1264, h: 760 }

  const cx = c.w / 2
  const cy = c.h / 2
  const r  = pickRadius(c)

  // Admin top-left = canvas centre minus half admin size — pinned dead centre.
  const adminRaw = {
    x: cx - ADMIN_CARD_W / 2,
    y: cy - ADMIN_CARD_H / 2,
  }
  const admin = clampToCanvas(adminRaw.x, adminRaw.y, c, ADMIN_CARD_W, ADMIN_CARD_H)

  // 8 members at 45° steps, starting at top (-π/2) clockwise — Member 1 is
  // at the top, Member 2 at the top-right, … Member 8 at the top-left.
  const members = Array.from({ length: 8 }, (_, i) => {
    const angle = -Math.PI / 2 + i * (Math.PI / 4)
    const rawCx = cx + Math.cos(angle) * r
    const rawCy = cy + Math.sin(angle) * r
    const raw   = { x: rawCx - CARD_W / 2, y: rawCy - CARD_H / 2 }
    return clampToCanvas(raw.x, raw.y, c)
  })

  return { admin, members }
}
