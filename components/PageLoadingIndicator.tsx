/**
 * PageLoadingIndicator
 *
 * A slim, premium loading indicator used by all route loading.tsx files.
 * Two visual elements:
 *   1. A 2px animated progress bar that fills from left to ~88% (indeterminate)
 *   2. A tiny spinner + text label (optional)
 *
 * Design rationale:
 *   - Orange (#f97316) matches the app's primary accent
 *   - Bar stays under 3px so it doesn't compete with page content
 *   - Text is muted ink-light so it doesn't draw attention away from content
 *   - No generic browser spinner — custom CSS ring instead
 *
 * Usage:
 *   <PageLoadingIndicator label="Loading workspace…" />
 *   <PageLoadingIndicator />   ← bar only, no label
 */

interface Props {
  /** Optional label shown next to spinner. Defaults to "Loading…" if omitted. */
  label?: string
  /** Show the spinner + label row. Defaults true. */
  showLabel?: boolean
}

export default function PageLoadingIndicator({
  label = 'Loading…',
  showLabel = true,
}: Props) {
  return (
    <div>
      {/* Slim indeterminate progress bar */}
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>

      {/* Spinner + label */}
      {showLabel && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 0 0',
          }}
        >
          <div className="loading-spinner" aria-hidden="true" />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--ink-faint)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
