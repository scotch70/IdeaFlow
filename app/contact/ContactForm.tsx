'use client'

/**
 * ContactForm — client form on /contact.
 *
 * No backend route yet, so on submit we build a mailto: URL from the field
 * values and hand off to the user's email client. That keeps the page
 * functional without introducing a new API endpoint, and the user's reply
 * still lands in the team inbox (ideaflow@appstimize.nl).
 */

import { useState } from 'react'

const TO_EMAIL = 'ideaflow@appstimize.nl'

export default function ContactForm() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = `IdeaFlow inquiry${company ? ` — ${company}` : ''}`
    const body =
`Hi IdeaFlow team,

${message}

—
${name}${email ? `\n${email}` : ''}${company ? `\n${company}` : ''}`
    const url = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
    // Defer briefly so the success state paints before the email client takes focus.
    setTimeout(() => { window.location.href = url }, 80)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
      }}
    >
      <Field label="Name">
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Jane Doe"
          style={inputStyle}
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jane@company.com"
          style={inputStyle}
        />
      </Field>

      <Field label="Company">
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Acme Inc. (optional)"
          style={inputStyle}
        />
      </Field>

      <Field label="Message">
        <textarea
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell us what you're looking for…"
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '6rem', fontFamily: 'inherit', lineHeight: 1.55 }}
        />
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: '#13162a', color: '#fff',
            fontSize: '0.9rem', fontWeight: 700,
            padding: '0.75rem 1.35rem', borderRadius: '0.7rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(13,22,42,0.18)',
            fontFamily: 'inherit',
          }}
        >
          Send message →
        </button>
        {sent && (
          <span style={{ fontSize: '0.78rem', color: '#5d667a' }}>
            Opening your email client…
          </span>
        )}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#9faab8',
      }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  fontSize: '0.95rem', color: '#1f2330',
  background: '#fff',
  border: '1px solid #e7e2d8',
  borderRadius: '0.6rem',
  padding: '0.7rem 0.85rem',
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.4,
  transition: 'border-color 0.12s, box-shadow 0.12s',
}
