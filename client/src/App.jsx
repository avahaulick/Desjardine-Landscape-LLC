import { useEffect, useMemo, useState } from 'react'
import './App.css'

const CONTACT = {
  phoneDisplay: '(303) 656-7807',
  phoneHref: 'tel:+13036567807',
  emailDisplay: 'Desjardinelandscape@gmail.com',
  emailHref: 'mailto:Desjardinelandscape@gmail.com',
  facebookHref: 'https://www.facebook.com/share/1Cx52uzPaf/',
}

function ContactIcon({ type }) {
  if (type === 'phone') {
    return (
      <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.6 10.8A15.6 15.6 0 0 0 13.2 17.4l2.2-2.2c.3-.3.8-.4 1.1-.3a12 12 0 0 0 3.8.6c.6 0 1 .4 1 1v3.5c0 .6-.4 1-1 1C10.1 21 3 13.9 3 5.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1l-2.2 2.2Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (type === 'email') {
    return (
      <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 6.8A1.8 1.8 0 0 1 4.8 5h14.4A1.8 1.8 0 0 1 21 6.8v10.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.2V6.8Zm2.2.4 6.6 4.7a.3.3 0 0 0 .4 0l6.6-4.7H5.2Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.3 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.2v2.2H8v3.1h2.2v8h3.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function formatProjectName(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function BeforeAfterCard({ project }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const pair = project.pairs[activeIndex]
  const beforeImage = pair?.before
  const afterImage = pair?.after
  const [split, setSplit] = useState(50)
  const compareHeadingId = `compare-heading-${project.slug}`

  if (!beforeImage || !afterImage) {
    return null
  }

  return (
    <article className="project-card" aria-labelledby={compareHeadingId}>
      <header className="project-card-header">
        <h3 id={compareHeadingId}>{project.name}</h3>
        <p>{project.afterCount} finished photos</p>
      </header>

      <div className="compare-stage" aria-label={`Before and after for ${project.name}`}>
        <img src={afterImage.url} alt={afterImage.alt} className="after-image" loading="lazy" />
        <div className="before-clip" style={{ width: `${split}%` }}>
          <img src={beforeImage.url} alt={beforeImage.alt} className="before-image" loading="lazy" />
        </div>
        <div className="split-line" style={{ left: `${split}%` }}>
          <span>Drag</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          aria-label={`Compare before and after for ${project.name}`}
          aria-valuetext={`${split}% before image visibility`}
          className="split-slider"
        />
      </div>

      <div className="pair-controls">
        {project.pairs.map((_, idx) => (
          <button
            type="button"
            key={`${project.slug}-pair-${idx}`}
            className={idx === activeIndex ? 'pair-dot pair-dot-active' : 'pair-dot'}
            onClick={() => {
              setActiveIndex(idx)
              setSplit(50)
            }}
            aria-pressed={idx === activeIndex}
            aria-label={`Show comparison set ${idx + 1} for ${project.name}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </article>
  )
}

function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState({ state: 'idle', message: '' })

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        const response = await fetch('/api/projects', {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (isMounted) {
          setProjects(data.projects ?? [])
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load gallery projects at this time.')
          setLoading(false)
        }
      }
    }

    loadProjects()
    return () => {
      isMounted = false
    }
  }, [])

  const totalJobs = useMemo(() => projects.length, [projects])

  function validateContactForm(values) {
    const nextErrors = {}

    if (!values.name.trim() || values.name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name.'
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (values.phone.trim() && !/^[0-9()+\-\s.]{7,25}$/.test(values.phone.trim())) {
      nextErrors.phone = 'Please enter a valid phone number.'
    }

    if (values.message.trim().length < 10) {
      nextErrors.message = 'Please share at least 10 characters about your project.'
    }

    return nextErrors
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: '' }))
    if (submitStatus.state !== 'idle') {
      setSubmitStatus({ state: 'idle', message: '' })
    }
  }

  async function handleContactSubmit(event) {
    event.preventDefault()

    const validationErrors = validateContactForm(formState)
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      setSubmitStatus({ state: 'error', message: 'Please correct the highlighted fields.' })
      return
    }

    setSubmitStatus({ state: 'loading', message: 'Sending your message...' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          message: formState.message.trim(),
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'Message could not be sent.')
      }

      setSubmitStatus({
        state: 'success',
        message: payload.message || 'Your message has been sent successfully.',
      })
      setFormState({ name: '', email: '', phone: '', message: '' })
      setFormErrors({})
    } catch (submitError) {
      setSubmitStatus({
        state: 'error',
        message: submitError.message || 'Unable to send your message right now.',
      })
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <p className="eyebrow">Desjardine Landscaping LLC</p>
            <h1>Before and After Transformations That Speak for Themselves</h1>
            <p className="hero-text">
              Premium landscape transformations built for curb appeal, durability, and long-term value.
              Explore real projects and see the difference from day one to completed install.
            </p>
            <div className="cta-row">
              <a className="cta-primary link-with-icon" href={CONTACT.phoneHref}>
                <ContactIcon type="phone" />
                <span>Call {CONTACT.phoneDisplay}</span>
              </a>
              <a className="cta-secondary link-with-icon" href={CONTACT.emailHref}>
                <ContactIcon type="email" />
                <span>Email Us</span>
              </a>
              <a
                className="cta-secondary link-with-icon"
                href={CONTACT.facebookHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ContactIcon type="facebook" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          <figure className="hero-logo-wrap" aria-label="Company logo">
            <img
              src="/media/company-logo.jpg"
              alt="Desjardine Landscaping LLC company logo"
              className="hero-logo"
              loading="eager"
              decoding="async"
            />
            <figcaption className="sr-only">Desjardine Landscaping LLC logo.</figcaption>
          </figure>
        </div>
      </header>

      <section className="metrics">
        <article>
          <span>{totalJobs}</span>
          <p>Completed Showcased Jobs</p>
        </article>
        <article>
          <span>100%</span>
          <p>Real Project Photography</p>
        </article>
        <article>
          <span>Local</span>
          <p>Colorado-Focused Service</p>
        </article>
      </section>

      <main className="gallery" id="main-content" aria-busy={loading}>
        <div className="section-heading">
          <h2>Project Showcase</h2>
          <p>Each project card features before/after sliders sourced directly from your job folders.</p>
        </div>

        {loading && (
          <p className="status-message" role="status" aria-live="polite">
            Loading project gallery...
          </p>
        )}
        {error && (
          <p className="status-message error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="project-grid">
            {projects.map((project) => (
              <BeforeAfterCard
                key={project.slug}
                project={{
                  ...project,
                  name: project.name || formatProjectName(project.slug),
                }}
              />
            ))}
          </div>
        )}
      </main>

      <section className="about" id="about">
        <h2>About Us</h2>
        <p>
          Desjardine Landscaping LLC is committed to craftsmanship, clear communication, and reliable
          project execution. From stone pathways to full backyard makeovers, each install is designed to
          fit the property and stand up to the seasons.
        </p>
      </section>

      <section className="contact-section" id="contact">
        <h2>Request A Quote</h2>
        <p>Send us your project details and we will get back to you with next steps.</p>

        <form className="contact-form" onSubmit={handleContactSubmit} noValidate>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formState.name}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.name)}
            aria-describedby={formErrors.name ? 'name-error' : undefined}
            required
          />
          {formErrors.name && (
            <p className="field-error" id="name-error">
              {formErrors.name}
            </p>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formState.email}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.email)}
            aria-describedby={formErrors.email ? 'email-error' : undefined}
            required
          />
          {formErrors.email && (
            <p className="field-error" id="email-error">
              {formErrors.email}
            </p>
          )}

          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formState.phone}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.phone)}
            aria-describedby={formErrors.phone ? 'phone-error' : undefined}
          />
          {formErrors.phone && (
            <p className="field-error" id="phone-error">
              {formErrors.phone}
            </p>
          )}

          <label htmlFor="message">Project Details</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formState.message}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.message)}
            aria-describedby={formErrors.message ? 'message-error' : undefined}
            required
          />
          {formErrors.message && (
            <p className="field-error" id="message-error">
              {formErrors.message}
            </p>
          )}

          <button type="submit" className="cta-primary form-submit" disabled={submitStatus.state === 'loading'}>
            {submitStatus.state === 'loading' ? 'Sending...' : 'Send Request'}
          </button>

          {submitStatus.message && (
            <p
              className={
                submitStatus.state === 'success' ? 'form-status form-status-success' : 'form-status form-status-error'
              }
              role={submitStatus.state === 'error' ? 'alert' : 'status'}
              aria-live={submitStatus.state === 'error' ? 'assertive' : 'polite'}
            >
              {submitStatus.message}
            </p>
          )}
        </form>
      </section>

      <footer className="footer">
        <a className="link-with-icon" href={CONTACT.phoneHref}>
          <ContactIcon type="phone" />
          <span>{CONTACT.phoneDisplay}</span>
        </a>
        <a className="link-with-icon" href={CONTACT.emailHref}>
          <ContactIcon type="email" />
          <span>{CONTACT.emailDisplay}</span>
        </a>
        <a className="link-with-icon" href={CONTACT.facebookHref} target="_blank" rel="noopener noreferrer">
          <ContactIcon type="facebook" />
          <span>Follow on Facebook</span>
        </a>
      </footer>
    </div>
  )
}

export default App
