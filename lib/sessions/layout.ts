// ─────────────────────────────────────────────────────────────────────────────
// Sessions canvas layout helpers.
//
// Centralises the math used by both SessionWorkspace and SessionCanvas so the
// "card must stay inside the visible canvas" rule has exactly one definition.
//
// Card box constants here must match the values used by the absolute-positioned
// motion.div inside SessionCanvas. If you change CARD_W there, change it here.
// ─────────────────────────────────────────────────────────────────────────────

export const CARD_W       = 232
export const CARD_MIN_H   = 108
/** Distance reserved between the canvas edge and any card. */
export const CANVAS_INSET = 24
/** Gap between cards in the "Reset view" grid layout. */
export const RESET_GAP    = 24

export interface CanvasSize { w: number; h: number }

export function isCanvasMeasured(s: CanvasSize): boolean {
  return s.w > 0 && s.h > 0
}

function clamp(v: number, lo: number, hi: number): number {
  if (hi < lo) return lo
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Bound the given (x, y) so the card body — assumed CARD_W × CARD_MIN_H —
 * stays inside the canvas with CANVAS_INSET padding on every side.
 *
 * On a canvas smaller than a card (very narrow viewport), maxX/maxY collapse
 * back to CANVAS_INSET so the card pins to the top-left rather than going
 * negative.
 */
export function clampToCanvas(
  x: number, y: number, canvas: CanvasSize,
  cardW: number = CARD_W, cardH: number = CARD_MIN_H,
): { x: number; y: number } {
  const pad  = CANVAS_INSET
  const maxX = Math.max(pad, canvas.w - cardW - pad)
  const maxY = Math.max(pad, canvas.h - cardH - pad)
  return { x: clamp(x, pad, maxX), y: clamp(y, pad, maxY) }
}

/**
 * "Spawn point" for a new card — roughly the centre of the visible canvas,
 * jittered by `index` so multiple new cards don't pile on top of each other.
 * Result is always inside the canvas via clampToCanvas.
 */
export function nextCardSpawn(canvas: CanvasSize, index: number): { x: number; y: number } {
  const jitterX = (index % 5) * 18
  const jitterY = (index % 4) * 14
  const cx = canvas.w / 2 - CARD_W     / 2 + jitterX
  const cy = canvas.h / 2 - CARD_MIN_H / 2 + jitterY
  return clampToCanvas(cx, cy, canvas)
}

/**
 * Compute a tidy grid layout for the "Reset view" action — fits as many
 * cards per row as the canvas allows. Returns one (x, y) per input card,
 * matching index order.
 */
export function gridResetPositions(count: number, canvas: CanvasSize): Array<{ x: number; y: number }> {
  if (count <= 0) return []
  const pad  = CANVAS_INSET
  const rowH = CARD_MIN_H + 64  // extra room so the textarea + metadata don't overlap the next row
  const cols = Math.max(1, Math.floor((canvas.w - pad * 2 + RESET_GAP) / (CARD_W + RESET_GAP)))

  const out: Array<{ x: number; y: number }> = []
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    out.push({
      x: pad + col * (CARD_W     + RESET_GAP),
      y: pad + row * (rowH       + 0          ),
    })
  }
  return out
}
