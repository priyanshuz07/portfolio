import { useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, Box, ChartNoAxesCombined, CircleDollarSign,
  Dumbbell, Globe2, Hotel, Radar, RadioTower, ShieldCheck, Utensils, WashingMachine, Waves, X,
} from 'lucide-react'
import { ExternalLink } from './ExternalLink'
import './projects.css'

type ProjectLink = { label: string; href: string }

type ProjectSection = {
  title: string
  description: string
  note?: string
  tags?: string[]
  links?: ProjectLink[]
  analyticsPreview?: boolean
}

type Project = {
  id: 'firewall' | 'discovery' | 'laundry'
  title: string
  kind: string
  description: string
  tags: string[]
  details?: string[]
  sections?: ProjectSection[]
  links?: ProjectLink[]
  disclosure: string
}

const projects: Project[] = [
  {
    id: 'firewall',
    title: 'AI Behavior Firewall 2.0',
    kind: 'Team hackathon prototype · Backend developer',
    description: 'A FastAPI backend that evaluates session events and returns one of four actions based on risk.',
    tags: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy', 'SQLite', 'REST APIs', 'scikit-learn'],
    details: [
      'Session management and event collection endpoints support request validation, deduplication, and rate limiting.',
      'Rule-based scoring selects among Allow, Challenge, Delay, and Block outcomes.',
      'The prototype includes dashboard data endpoints and an optional machine-learning classifier using synthetic data.',
    ],
    links: [{ label: 'View GitHub repository', href: 'https://github.com/priyanshuz07/aithon-old' }],
    disclosure: 'Preview uses simulated events and risk levels.',
  },
  {
    id: 'discovery',
    title: 'Restaurant Recommendation & Analytics',
    kind: 'Academic web application · Analytics dashboard',
    description: 'Two projects exploring restaurant discovery and operations.',
    tags: [],
    sections: [
      {
        title: 'Restaurant Recommendation System',
        description: 'An academic application built with Python and Flask for restaurant recommendations.',
        note: 'FoodFinder is a separate React and Vite recommendation implementation.',
        links: [{ label: 'FoodFinder (React/Vite) · GitHub', href: 'https://github.com/aditipimpare07/AIML' }],
      },
      {
        title: 'Restaurant Performance Analytics',
        description: 'A dashboard focused on restaurant performance, inventory optimisation, local food trends, and cost-related insights.',
        analyticsPreview: true,
      },
    ],
    disclosure: 'Illustrative interface preview. The analytics charts use simulated data.',
  },
  {
    id: 'laundry',
    title: 'Laundry Management System',
    kind: 'Full-stack application · Browser demo',
    description: 'A full-stack management system for laundry operations and a separate browser-based FreshWash demo.',
    tags: [],
    sections: [
      {
        title: 'Laundry management application',
        description: 'The main repository documents customer, order, and staff management, as well as billing, QR-based lookups, payment recording, and reports.',
        tags: ['React', 'Vite', 'FastAPI', 'MongoDB Atlas', 'Python', 'TypeScript'],
        links: [{ label: 'Main application repository', href: 'https://github.com/priyanshuz07/laundry-new' }],
      },
      {
        title: 'FreshWash browser demo',
        description: 'A separate browser-based implementation that stores data locally in the browser.',
        links: [
          { label: 'FreshWash repository', href: 'https://github.com/priyanshuz07/laundry' },
          { label: 'Visit FreshWash demo', href: 'https://laundry-delta-ashen.vercel.app/' },
        ],
      },
    ],
    disclosure: 'Preview illustrates the main application.',
  },
]

const contributions = [
  {
    title: 'Money Factory',
    description: 'Worked on the website and mobile app with the development team, including live and recorded lecture features.',
    icon: RadioTower,
    color: 'pink',
    href: 'https://moneyfactoryindicator.com/',
  },
  {
    title: 'ZeroFX',
    description: 'Contributed to HTML frontend implementation for the forex broker website.',
    icon: CircleDollarSign,
    color: 'purple',
    href: 'https://www.zerofx.club/',
  },
  {
    title: 'AIM Germany',
    description: 'Developed HTML frontend pages during my web development internship at RAG Genesis Global.',
    icon: Globe2,
    color: 'orange',
    href: 'https://aimgermany.com/',
  },
  {
    title: 'Gym Management System',
    description: 'Worked with the Brevitus Technology team on a deployed system for gym operations.',
    icon: Dumbbell,
    color: 'lime',
  },
  {
    title: 'Hostel Management System',
    description: 'A system intended to support hostel administration and management.',
    icon: Hotel,
    color: 'cyan',
  },
]

function FirewallPreview() {
  return (
    <div className="p-firewall">
      <div className="p-abf-grid" />
      <div className="p-abf-scope">
        <span className="p-abf-orbit p-abf-orbit-inner" />
        <span className="p-abf-orbit p-abf-orbit-middle" />
        <span className="p-abf-orbit p-abf-orbit-outer" />
        <span className="p-abf-sweep" />
        <span className="p-abf-dot p-abf-dot-a" />
        <span className="p-abf-dot p-abf-dot-b" />
        <span className="p-abf-dot p-abf-dot-c" />
        <span className="p-abf-shield"><ShieldCheck /></span>
      </div>
      <div className="p-abf-top">
        <span><Box size={14} /> ABF <b>2.0</b></span>
        <span className="p-simulated"><i /> SIMULATED</span>
      </div>
      <div className="p-abf-legend"><Radar size={13} /> SESSION ACTIVITY</div>
      <div className="p-abf-events">
        <div className="p-abf-event-heading"><span>EVENT STREAM</span><Activity size={13} /></div>
        <div className="p-abf-event"><span>Session start</span><b className="p-status-allow">Allow</b></div>
        <div className="p-abf-event"><span>Risk signal</span><b className="p-status-challenge">Challenge</b></div>
        <div className="p-abf-event"><span>Rate spike</span><b className="p-status-delay">Delay</b></div>
        <div className="p-abf-event"><span>High risk</span><b className="p-status-block">Block</b></div>
      </div>
    </div>
  )
}

function DiscoveryPreview() {
  return (
    <div className="p-discovery">
      <div className="p-discovery-noise" />
      <span className="p-discovery-label"><Utensils size={13} /> RESTAURANT DISCOVERY</span>
      <div className="p-discovery-type">Find your<br />next table<span>.</span></div>
      <svg className="p-plate" viewBox="0 0 256 256" focusable="false">
        <defs>
          <radialGradient id="plate-edge">
            <stop stopColor="#ede2c9" />
            <stop offset=".74" stopColor="#ffeccc" />
            <stop offset=".85" stopColor="#eccca1" />
            <stop offset=".94" stopColor="#fff1d6" />
            <stop offset="1" stopColor="#c89b70" />
          </radialGradient>
          <linearGradient id="plate-pasta" x2="1" y2="1">
            <stop stopColor="#ffd174" />
            <stop offset="1" stopColor="#d36831" />
          </linearGradient>
        </defs>
        <circle cx="128" cy="128" r="120" fill="url(#plate-edge)" />
        <circle cx="128" cy="128" r="98" fill="none" stroke="#bd8c64" strokeWidth="1" strokeDasharray="1 3" />
        <circle cx="128" cy="128" r="86" fill="#edd4ad" />
        <circle cx="128" cy="128" r="82" fill="#f4ddb7" />
        <path d="M62 130c2-46 40-73 74-64s69 19 62 70-54 62-89 55-51-31-47-61Z" fill="#be5328" opacity=".24" />
        <g stroke="#a94822" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".35" transform="translate(2 3)">
          <path d="M72 140c-10-47 82-79 115-39s-22 96-78 76" />
          <path d="M65 124c10 41 70 56 91 21s-16-73-56-53-21 73 18 68 62-61 28-65-65 36-44 59 72 11 73-20-51-40-67-9 29 40 44 10" />
          <path d="M89 169c32 35 96-2 100-33m-89-18c16-38 82-20 86 23" />
        </g>
        <g stroke="url(#plate-pasta)" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M72 140c-10-47 82-79 115-39s-22 96-78 76" />
          <path d="M65 124c10 41 70 56 91 21s-16-73-56-53-21 73 18 68 62-61 28-65-65 36-44 59 72 11 73-20-51-40-67-9 29 40 44 10" />
          <path d="M89 169c32 35 96-2 100-33m-89-18c16-38 82-20 86 23" />
        </g>
        <g fill="#3a662e">
          <path d="M118 109q-28-1-31-30 29-2 31 30Zm3 1q9-22 32-19-4 25-32 19Z" />
          <path d="M154 147q18-13 34 4-15 13-34-4Zm-2 4q21 12 9 33-20-10-9-33Z" />
          <path d="M96 143q-15-10-25 7 17 8 25-7Z" />
        </g>
        <g fill="#b83f2e" stroke="#f29555" strokeWidth="3">
          <circle cx="105" cy="139" r="6" />
          <circle cx="156" cy="119" r="9" />
          <circle cx="135" cy="168" r="7" />
          <circle cx="171" cy="89" r="5" />
        </g>
        <g fill="#ffe9b9">
          <path d="m136 90 16 6-5 4-16-5Zm-46 46 13-2 1 4-14 3Zm27 39 14 8-4 4-13-8Zm50-42 21-4 1 4-20 4Z" />
        </g>
      </svg>
      <div className="p-discovery-foot"><span /> <ArrowDownRight size={15} /></div>
    </div>
  )
}

function AnalyticsPreview() {
  return (
    <div className="p-analytics">
      <div className="p-analytics-top">
        <span><ChartNoAxesCombined size={15} /> RESTAURANT PERFORMANCE</span>
        <span className="p-simulated"><i /> SIMULATED</span>
      </div>
      <div className="p-chart">
        <div className="p-chart-title"><span>Performance overview</span><Activity size={15} /></div>
        <svg className="p-chart-lines" viewBox="0 0 300 110" preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id="chart-glow" x1="0" x2="0" y2="1">
              <stop stopColor="#44d6ee" stopOpacity=".42" />
              <stop offset="1" stopColor="#44d6ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 20h300M0 42h300M0 64h300M0 86h300M0 108h300" stroke="#2a424b" strokeWidth="1" />
          <path d="M0 82C20 86 22 66 43 67S70 77 86 65s27-37 43-32 24 23 43 20 27-21 43-20 27 10 43-2 27-18 42-20v97H0Z" fill="url(#chart-glow)" />
          <path className="p-chart-stroke" d="M0 82C20 86 22 66 43 67S70 77 86 65s27-37 43-32 24 23 43 20 27-21 43-20 27 10 43-2 27-18 42-20" fill="none" stroke="#53e4fa" strokeWidth="2.5" pathLength="1" vectorEffect="non-scaling-stroke" />
          <path d="M0 96C19 94 27 85 43 88s24-7 43-6 25-16 43-14 24 14 43 10 24-10 43-8 27 3 43-8 27-19 42-15" fill="none" stroke="#a67fff" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="p-analytics-metrics">
        <div><i /> Inventory</div>
        <div><i /> Food trends</div>
        <div><i /> Cost insights</div>
      </div>
    </div>
  )
}

function LaundryPreview() {
  return (
    <div className="p-laundry">
      <div className="p-analytics-top"><span><WashingMachine size={15} /> LAUNDRY MANAGEMENT</span></div>
      <div className="p-laundry-washer">
        <span className="p-laundry-controls"><i /><i /><i /></span>
        <span className="p-laundry-drum"><Waves /></span>
      </div>
      <ul className="p-laundry-functions">
        <li>Order management</li>
        <li>QR-based lookups</li>
        <li>Billing & reports</li>
      </ul>
    </div>
  )
}

const previews: Record<Project['id'], ReactNode> = {
  firewall: <FirewallPreview />,
  discovery: <DiscoveryPreview />,
  laundry: <LaundryPreview />,
}

function ProjectLinks({ links }: { links: ProjectLink[] }) {
  return (
    <div className="p-project-links">
      {links.map(({ href, label }) => (
        <ExternalLink key={href} href={href} className="p-project-link">
          <span>{label}</span><ArrowUpRight size={14} aria-hidden="true" />
        </ExternalLink>
      ))}
    </div>
  )
}

function tiltCard(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const motion = document.documentElement.dataset.motion
  const paused = motion === undefined ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : motion === 'paused'
  if (paused) return
  const target = event.currentTarget
  const bounds = target.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width
  const y = (event.clientY - bounds.top) / bounds.height
  target.style.setProperty('--p-light-x', `${x * 100}%`)
  target.style.setProperty('--p-light-y', `${y * 100}%`)
  target.style.setProperty('--p-rotate-x', `${(0.5 - y) * 6}deg`)
  target.style.setProperty('--p-rotate-y', `${(x - 0.5) * 7}deg`)
}

function resetCard(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty('--p-rotate-x')
  event.currentTarget.style.removeProperty('--p-rotate-y')
}

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  const details = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (selected && details.current && !details.current.open) details.current.showModal()
  }, [selected])

  return (
    <section id="projects" className="p-section" aria-labelledby="projects-heading">
      <div className="section-wrap">
        <header className="section-heading reveal p-section-heading">
          <p className="section-kicker">Featured projects</p>
          <h2 className="section-title" id="projects-heading">Projects from<br className="p-heading-break" /> my universe<span>.</span></h2>
          <p>Academic work, a hackathon prototype, and the backend systems that bring them to life.</p>
        </header>

        <div className="p-project-grid">
          {projects.map((project) => (
            <article
              key={project.id}
              className={`p-card p-card-${project.id} reveal`}
              onPointerMove={tiltCard}
              onPointerLeave={resetCard}
            >
              <div className="p-card-shell">
                <div className="p-card-visual" aria-hidden="true">{previews[project.id]}</div>
                <div className="p-card-body">
                  <p className="p-kind">{project.kind}</p>
                  <h3>{project.title}</h3>
                  {project.id === 'discovery' ? (
                    <dl className="p-restaurant-summary">
                      {project.sections?.map(({ title, description }) => (
                        <div key={title}>
                          <dt>{title}</dt>
                          <dd>{description}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : <p className="p-description">{project.description}</p>}
                  {project.tags.length > 0 && (
                    <ul className="p-tags" aria-label="Project tags">
                      {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  )}
                  <div className="p-card-footer">
                    <span className="p-project-disclosure">{project.disclosure}</span>
                    <span className="p-explore" aria-hidden="true">Explore <ArrowUpRight size={15} /></span>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-card-trigger"
                  aria-label={`Explore ${project.title}`}
                  aria-haspopup="dialog"
                  data-cursor="View project"
                  onClick={(event) => {
                    trigger.current = event.currentTarget
                    setSelected(project)
                  }}
                />
              </div>
            </article>
          ))}
        </div>

        <section className="p-contributions reveal" aria-labelledby="contribution-heading">
          <div className="p-contribution-heading">
            <h3 id="contribution-heading">Professional contributions</h3>
            <p>Projects I worked on as part of a team.</p>
          </div>
          <ul className="p-team-list" role="list">
            {contributions.map(({ title, description, icon: Icon, color, href }) => {
              const cardClass = `p-team-card p-team-${color}`
              const content = (
                <>
                  <div className="p-team-icon"><Icon size={18} aria-hidden="true" /></div>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </>
              )
              return (
                <li key={title}>
                  {href ? (
                    <ExternalLink href={href} className={cardClass} aria-label={`${title} website`}>
                      {content}
                      <ArrowUpRight size={14} className="p-team-link-arrow" aria-hidden="true" />
                    </ExternalLink>
                  ) : <div className={cardClass}>{content}</div>}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      <dialog
        className={`p-dialog p-card-${selected?.id ?? 'firewall'}`}
        ref={details}
        aria-labelledby="project-detail-title"
        aria-describedby="project-detail-intro"
        onClose={() => {
          setSelected(null)
          trigger.current?.focus({ preventScroll: true })
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) details.current?.close()
        }}
      >
        {selected && (
          <div className="p-dialog-body">
            <button type="button" className="p-dialog-close" aria-label="Close project details" autoFocus onClick={() => details.current?.close()}>
              <X size={21} />
            </button>
            <p className="p-kind">{selected.kind}</p>
            <h2 id="project-detail-title">{selected.title}</h2>
            <p id="project-detail-intro">{selected.description}</p>
            {selected.details && (
              <ul className="p-dialog-points">
                {selected.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            )}
            {selected.tags.length > 0 && (
              <ul className="p-tags" aria-label="Project tags">
                {selected.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            )}
            {selected.sections?.map((section) => (
              <section key={section.title} className="p-dialog-section">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                {section.note && <p>{section.note}</p>}
                {section.tags && (
                  <ul className="p-tags" aria-label={`${section.title} technologies`}>
                    {section.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                )}
                {section.links && <ProjectLinks links={section.links} />}
                {section.analyticsPreview && (
                  <div className="p-card-visual p-dialog-visual" aria-hidden="true"><AnalyticsPreview /></div>
                )}
              </section>
            ))}
            {selected.links && <ProjectLinks links={selected.links} />}
            <p className="p-dialog-disclosure">{selected.disclosure}</p>
          </div>
        )}
      </dialog>
    </section>
  )
}
