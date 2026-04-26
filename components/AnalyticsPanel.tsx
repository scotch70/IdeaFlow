'use client'

export interface DailyPoint {
  label: string
  count: number
  isToday: boolean
}

export interface Contributor {
  name: string
  count: number
}

interface AnalyticsPanelProps {
  totalIdeas: number
  totalLikes: number
  ideasThisWeek: number
  activeMembers: number
  topContributors: Contributor[]
  dailyActivity: DailyPoint[]
  topIdea: { title: string; likes: number } | null
  /** Optional section heading shown above the stat cards. Omit on pages that
   *  already have their own page-level heading (e.g. /dashboard/analytics). */
  heading?: string
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--tint-border)',
        borderRadius: '1rem',
        padding: '1.1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
      }}
    >
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: 'rgba(249,115,22,0.07)',
          border: '1px solid rgba(249,115,22,0.13)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c2540a',
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0d1f35',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#5a7fa8',
            marginTop: '0.2rem',
          }}
        >
          {label}
        </p>
        {sub && (
          <p style={{ fontSize: '0.68rem', color: 'var(--ink-light)', marginTop: '0.15rem' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPanel({
  totalIdeas,
  totalLikes,
  ideasThisWeek,
  activeMembers,
  topContributors,
  dailyActivity,
  topIdea,
  heading,
}: AnalyticsPanelProps) {
  const maxActivity = Math.max(...dailyActivity.map(d => d.count), 1)
  const maxContrib = Math.max(...topContributors.map(c => c.count), 1)
  const avgLikes = totalIdeas > 0 ? (totalLikes / totalIdeas).toFixed(1) : '0'

  return (
    <div>
      {heading && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.2rem' }}>
            Analytics
          </p>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
            {heading}
          </h2>
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <StatCard
          label="Total ideas"
          value={totalIdeas}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <StatCard
          label="Total likes"
          value={totalLikes}
          sub={`${avgLikes} avg per idea`}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
        />
        <StatCard
          label="Ideas this week"
          value={ideasThisWeek}
          sub={ideasThisWeek === 0 ? 'No ideas yet this week' : ideasThisWeek === 1 ? '1 idea posted' : `${ideasThisWeek} ideas posted`}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Active members"
          value={activeMembers}
          sub={activeMembers === 1 ? '1 member posted an idea' : `${activeMembers} members posted`}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {/* Weekly activity */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--tint-border)',
            borderRadius: '1rem',
            padding: '1.25rem',
          }}
        >
          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#0d1f35',
              marginBottom: '0.2rem',
            }}
          >
            Weekly activity
          </p>
          <p style={{ fontSize: '0.72rem', color: '#5a7fa8', marginBottom: '1.25rem' }}>
            Ideas posted in the last 7 days
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.375rem',
              height: '5rem',
            }}
          >
            {dailyActivity.map((day, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.375rem',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  title={`${day.count} idea${day.count !== 1 ? 's' : ''}`}
                  style={{
                    width: '100%',
                    height:
                      day.count === 0
                        ? '3px'
                        : `${Math.max((day.count / maxActivity) * 82, 10)}%`,
                    background: day.isToday
                      ? 'var(--orange)'
                      : day.count > 0
                      ? 'rgba(249,115,22,0.35)'
                      : 'var(--tint-bg)',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.25s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: day.isToday ? 700 : 400,
                    color: day.isToday ? '#c2540a' : '#5a7fa8',
                    lineHeight: 1,
                  }}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributors */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--tint-border)',
            borderRadius: '1rem',
            padding: '1.25rem',
          }}
        >
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.2rem' }}>
            Most active members
          </p>
          <p style={{ fontSize: '0.72rem', color: '#5a7fa8', marginBottom: '1.25rem' }}>
            Ranked by ideas submitted
          </p>

          {topContributors.length === 0 ? (
            <p style={{ fontSize: '0.825rem', color: '#5a7fa8' }}>
              No ideas posted yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {topContributors.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          color: i === 0 ? '#c2540a' : 'rgba(90,127,168,0.45)',
                          fontVariantNumeric: 'tabular-nums',
                          minWidth: '1rem',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontWeight: 600, color: '#0d1f35' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#5a7fa8', fontVariantNumeric: 'tabular-nums' }}>
                      {c.count} idea{c.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'var(--tint-bg)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(c.count / maxContrib) * 100}%`,
                        background:
                          i === 0
                            ? 'var(--orange)'
                            : i === 1
                            ? 'rgba(249,115,22,0.55)'
                            : 'rgba(249,115,22,0.30)',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top liked idea */}
        {topIdea && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(249,115,22,0.14)',
              borderRadius: '1rem',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60%',
                height: '100%',
                background: 'radial-gradient(ellipse at top right, rgba(249,115,22,0.05), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.2rem' }}>
              Top liked idea
            </p>
            <p style={{ fontSize: '0.72rem', color: '#5a7fa8', marginBottom: '1.25rem' }}>
              Most supported by the team
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0d1f35',
                lineHeight: 1.5,
                marginBottom: '0.75rem',
              }}
            >
              {topIdea.title}
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '9999px',
                padding: '0.25rem 0.625rem',
                background: 'rgba(249,115,22,0.09)',
                border: '1px solid rgba(249,115,22,0.18)',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#c2540a',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {topIdea.likes} likes
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
