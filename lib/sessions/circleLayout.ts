// ─────────────────────────────────────────────────────────────────────────────
// Brainstorm Circle layout.
//
// Fixed 3-column / 3-row grid (no radial math) so card positions are
// predictable and never overlap. Per the brief:
//
//     ┌──────────┬──────────┬──────────┐
//     │ Member 8 │ Member 1 │ Member 2 │   top row
//     ├──────────┼──────────┼──────────┤
//     │ Member 7 │  ADMIN   │ Member 3 │   middle row
//     ├──────────┼──────────┼──────────┤
//     │ Member 6 │ Member 5 │ Member 4 │   bottom row
//     └──────────┴──────────┴──────────┘
//
// All positions returned are top-left pixel coordinates ready for
// session_cards.x / y.
//
// Overlap prevention is structural, not "hope and clamp":
//   • horizontalGap ≥ (ADMIN_CARD_W + CARD_W) / 2 + breathing → admin and any
//     same-row member can never touch.
//   • verticalGap   ≥ (ADMIN_CARD_H + CARD_H) / 2 + breathing → admin and any
//     same-column member can never touch.
//   • Adjacent members never overlap because they're either a full gap apart
//     (so the gap itself > card half-size on its axis) or sit on different
//     rows entirely.
//
// On generous canvases the gaps sit at their ideal values (350 × 220), giving
// the airy "demo" feel. On tight canvases the gaps shrink toward the floor —
// they never go below the no-overlap minimum, even if that means a member
// card clips outside the canvas inset (we prefer clipping over overlap).
// ─────────────────────────────────────────────────────────────────────────────

import {
  CANVAS_INSET, CARD_H, CARD_W, CanvasSize, clampToCanvas, isCanvasMeasured,
} from './layout'

/** The admin card now uses the same physical size as the member cards.
 *  The ivory background + orange border applied in SessionCanvas is enough
 *  visual differentiation on its own, and matching sizes make the 3×3
 *  grid read as a single composition instead of "one big box surrounded
 *  by eight smaller ones". */
export const ADMIN_CARD_W = CARD_W
export const ADMIN_CARD_H = CARD_H

interface BrainstormCirclePositions {
  admin:   { x: number; y: number }
  members: Array<{ x: number; y: number }>
}

// ── Gap math ────────────────────────────────────────────────────────────────

/** Ideal horizontal distance from canvas centre to a side member's centre. */
const IDEAL_HG = 350
/** Ideal vertical distance from canvas centre to a top/bottom member's centre. */
const IDEAL_VG = 220
/** Minimum gap that guarantees admin ↔ member non-overlap on the X axis. */
const MIN_HG   = (ADMIN_CARD_W + CARD_W) / 2 + 12   // 244 (admin = member)
/** Minimum gap that guarantees admin ↔ member non-overlap on the Y axis. */
const MIN_VG   = (ADMIN_CARD_H + CARD_H) / 2 + 12   // 152 (admin = member)

/**
 * Pick gaps that fit the canvas without clipping a member card, scaled down
 * proportionally when the canvas is tight. Never returns less than the
 * no-overlap minimum — if even that doesn't fit, a member will clip outside
 * the canvas inset rather than overlap the admin.
 */
function pickGaps(canvas: CanvasSize): { hg: number; vg: number } {
  // Largest gaps the canvas can hold (member centre at ±gap, card edge at
  // ±gap ± half-card-size, must stay within canvas - INSET).
  const maxHG = canvas.w / 2 - CARD_W / 2 - CANVAS_INSET
  const maxVG = canvas.h / 2 - CARD_H / 2 - CANVAS_INSET

  // Step 1: clamp ideal to what the canvas can hold.
  let hg = Math.min(IDEAL_HG, maxHG)
  let vg = Math.min(IDEAL_VG, maxVG)

  // Step 2: enforce the no-overlap minimum. If the canvas is too small to
  // hit even MIN, the result is the MIN — clipping is the failure mode,
  // not overlap.
  if (hg < MIN_HG) hg = MIN_HG
  if (vg < MIN_VG) vg = MIN_VG

  return { hg, vg }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the 3 × 3 layout for a Brainstorm Circle session.
 *
 * Falls back to a 1264 × 760 logical canvas when nothing has been measured
 * yet — matches the typical session viewport after auto-collapse.
 */
export function brainstormCirclePositions(canvas?: CanvasSize): BrainstormCirclePositions {
  const c: CanvasSize = (canvas && isCanvasMeasured(canvas)) ? canvas : { w: 1264, h: 760 }

  const cx = c.w / 2
  const cy = c.h / 2
  const { hg, vg } = pickGaps(c)

  // Admin: top-left = canvas centre minus half admin dimensions.
  const admin = clampToCanvas(
    cx - ADMIN_CARD_W / 2,
    cy - ADMIN_CARD_H / 2,
    c, ADMIN_CARD_W, ADMIN_CARD_H,
  )

  // 8 member CENTER points per the brief's mapping (Member 1 = top centre,
  // clockwise to Member 8 = top-left).
  const memberCenters: Array<{ cx: number; cy: number }> = [
    { cx: cx,      cy: cy - vg },  // 1  top centre
    { cx: cx + hg, cy: cy - vg },  // 2  top right
    { cx: cx + hg, cy: cy      },  // 3  middle right
    { cx: cx + hg, cy: cy + vg },  // 4  bottom right
    { cx: cx,      cy: cy + vg },  // 5  bottom centre
    { cx: cx - hg, cy: cy + vg },  // 6  bottom left
    { cx: cx - hg, cy: cy      },  // 7  middle left
    { cx: cx - hg, cy: cy - vg },  // 8  top left
  ]

  // Convert centres to top-left (subtract half card dimensions), then clamp
  // ONLY as a final safety pass — the gap math already guarantees the
  // intended layout. The clamp is here so that on undersized canvases where
  // the floor gap pushed a card outside, we still keep its top-left ≥ inset.
  const members = memberCenters.map(p =>
    clampToCanvas(p.cx - CARD_W / 2, p.cy - CARD_H / 2, c)
  )

  return { admin, members }
}
