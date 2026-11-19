import { useState, type CSSProperties, type PointerEvent } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  MapPin,
  RotateCw,
  Terminal,
  Zap,
} from 'lucide-react';
import { profile } from '../data/portfolio';
import { ExternalLink } from './ExternalLink';
import './story.css';

const education = {
  college: 'Amrutvahini College of Engineering',
  course: 'B.E. Information Technology',
  graduation: 'Expected 2028',
  cgpa: '8.0/10',
};

const hackathons = [
  {
    name: 'Smart India Hackathon',
    detail: 'Participated twice, working with teammates to solve problems and gain hands-on development experience.',
    accent: 'var(--lime, #c7ff69)',
  },
  {
    name: 'Aithon Hackathon',
    detail: 'Backend Developer on AI Behavior Firewall 2.0, a team hackathon prototype.',
    accent: 'var(--cyan, #3ddcff)',
    project: {
      repository: 'https://github.com/priyanshuz07/aithon-old',
      stack: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy', 'SQLite', 'REST APIs', 'scikit-learn'],
      contributions: [
        'Developed REST APIs for session management.',
        'Worked on event collection and analysis.',
        'Implemented Pydantic request validation.',
        'Added event deduplication and rate limiting.',
        'Used SQLAlchemy with SQLite for structured data storage.',
        'Implemented rule-based risk scoring.',
        'Supported Allow, Challenge, Delay, and Block decisions.',
      ],
      team: 'The wider prototype includes an optional classifier trained on synthetic data, a dashboard, and unit tests.',
    },
  },
];

interface Role {
  company: string;
  companyUrl: string;
  title: string;
  range: string;
  contributions: readonly string[];
  tags: readonly string[];
  accent: string;
}

const roles: readonly Role[] = [
  {
    company: 'Brevitus Technology',
    companyUrl: 'https://www.brevitustechnology.com/',
    title: 'Developer & Project Manager',
    range: 'September 2026 – Present',
    contributions: [
      'Contributed to the ZeroFX.club forex broker website, including HTML frontend implementation.',
      'Contributed to live and recorded lecture features for the Money Factory website and mobile app.',
      'Worked with the team on deployed Gym and Laundry Management Systems.',
      'Coordinate work with developers and handle client calls, deployments, and delivery.',
    ],
    tags: ['HTML', 'Project coordination', 'Client delivery', 'Deployments'],
    accent: 'var(--violet, #9b5cff)',
  },
  {
    company: 'RAG Genesis Global',
    companyUrl: 'https://ragenesisglobal.com/',
    title: 'Web Developer Intern',
    range: 'May 2026 – September 2026',
    contributions: [
      'Contributed to approximately five to six client website and application projects.',
      'Developed HTML frontend pages for AIM Germany.',
      'Debugged and tested applications and fixed build issues.',
    ],
    tags: ['HTML', 'Frontend development', 'Debugging', 'Builds'],
    accent: 'var(--cyan, #3ddcff)',
  },
];

const pointerMotion = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
const [city, ...region] = profile.location.split(', ');
const terminalName = profile.name.toLowerCase().replaceAll(' ', '-');

function trackPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch' || !pointerMotion || !pointerMotion.matches || document.documentElement.dataset.motion === 'paused') return;

  const element = event.currentTarget;
  const bounds = element.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));

  element.style.setProperty('--story-x', `${(x * 100).toFixed(1)}%`);
  element.style.setProperty('--story-y', `${(y * 100).toFixed(1)}%`);
  element.style.setProperty('--story-pitch', `${((0.5 - y) * 7).toFixed(2)}deg`);
  element.style.setProperty('--story-yaw', `${((x - 0.5) * 8).toFixed(2)}deg`);
}

function resetPointer(event: PointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  element.style.removeProperty('--story-x');
  element.style.removeProperty('--story-y');
  element.style.removeProperty('--story-pitch');
  element.style.removeProperty('--story-yaw');
}

function OrbitCard() {
  const [turn, setTurn] = useState(0);

  return (
    <button
      type="button"
      className="story-card story-orb reveal"
      onClick={() => setTurn((angle) => angle + 72)}
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
      style={{ '--story-turn': `${turn}deg` } as CSSProperties}
    >
      <span className="story-orb-field" aria-hidden="true">
        <span className="story-orb-shadow" />
        <span className="story-orb-space">
          <span className="story-orbit story-orbit-one"><i /></span>
          <span className="story-orbit story-orbit-two"><i /></span>
          <span className="story-orb-planet">
            <span className="story-orb-surface" />
            <span className="story-orb-glint" />
          </span>
        </span>
        <span className="story-orb-star story-orb-star-one">✦</span>
        <span className="story-orb-star story-orb-star-two">✧</span>
        <span className="story-orb-star story-orb-star-three">✦</span>
      </span>
      <span className="story-orb-control"><RotateCw size={15} aria-hidden="true" /> Rotate the orb</span>
    </button>
  );
}

function LocationContours() {
  return (
    <svg className="story-contours" viewBox="0 0 320 160" fill="none" aria-hidden="true">
      <path d="M-42 129C-1 82 75 135 105 88c27-42-28-80 50-106" />
      <path d="M-37 140C7 99 80 149 117 98c30-42-24-81 51-112" />
      <path d="M-34 151c48-37 116 11 162-42 36-42-19-84 54-116" />
      <path d="M-30 162c55-36 116 10 169-43 41-41-14-82 57-120" />
      <path d="M-22 171c53-30 111 5 170-40 49-38-8-84 65-127" />
      <path d="M0 183c62-33 103 1 157-39 58-43 1-85 75-137" />
      <path d="M50 179c38-8 86 9 127-29 44-39 23-90 79-131" />
      <path d="M96 187c40-6 83-9 104-34 37-45 28-83 72-111" />
      <path d="M160 174c34-8 56-33 64-57 12-39 29-61 55-72" />
      <path d="M211 166c16-11 25-29 31-48 8-26 21-40 52-53" />
    </svg>
  );
}

export function About() {
  const current = roles[0];

  return (
    <section id="about" className="story-section story-about" aria-labelledby="about-title">
      <div className="section-wrap">
        <header className="section-heading reveal">
          <p className="section-kicker">About me</p>
          <h2 id="about-title" className="section-title">Not your average developer.</h2>
        </header>
        <div className="story-bento">
          <div className="story-intro-wrap reveal" onPointerMove={trackPointer} onPointerLeave={resetPointer}>
            <article className="story-card story-intro">
              <p className="story-label">The human behind the code</p>
              <h3>{profile.name}</h3>
              <p>I’m a third-year IT engineering student and Python backend developer. I build web applications and REST APIs with FastAPI and Flask.</p>
              <span className="story-intro-glyph" aria-hidden="true">{'{ }'}</span>
            </article>
          </div>
          <OrbitCard />

          <article className="story-card story-code reveal">
            <div className="story-code-head">
              <h3 className="story-label"><Terminal size={14} aria-hidden="true" /> Terminal</h3>
              <span className="story-window-dots" aria-hidden="true"><i /><i /><i /></span>
            </div>
            <div className="story-code-body">
              <p><span aria-hidden="true">❯</span> <code>whoami</code></p>
              <p className="story-code-result">{terminalName}</p>
              <p><span aria-hidden="true">❯</span> <code>ls focus/</code></p>
              <p className="story-code-result">python&nbsp; fastapi&nbsp; flask&nbsp; rest-apis<span className="story-code-caret" aria-hidden="true" /></p>
            </div>
          </article>

          <a className="story-card story-education-teaser reveal" href="#education">
            <div className="story-card-top">
              <span className="story-icon"><GraduationCap size={18} aria-hidden="true" /></span>
              <ArrowUpRight className="story-card-arrow" size={18} aria-hidden="true" />
            </div>
            <h3 className="story-label">Education</h3>
            <p className="story-card-copy">{education.course}</p>
            <p className="story-card-meta">{education.graduation}</p>
          </a>

          <a className="story-card story-role reveal" href="#experience">
            <div className="story-card-top">
              <span className="story-icon"><BriefcaseBusiness size={17} aria-hidden="true" /></span>
              <ArrowUpRight className="story-card-arrow" size={18} aria-hidden="true" />
            </div>
            <h3 className="story-label">Current role</h3>
            <p className="story-card-copy">{current.title}</p>
            <p className="story-card-meta">{current.company}</p>
          </a>

          <article className="story-card story-location reveal">
            <LocationContours />
            <div className="story-location-content">
              <span className="story-icon"><MapPin size={18} aria-hidden="true" /></span>
              <h3 className="story-label">Based in</h3>
              <p className="story-card-copy">{city}</p>
              <p className="story-card-meta">{region.join(', ')}</p>
            </div>
          </article>

          <a className="story-card story-hackathon-teaser reveal" href="#education">
            <div className="story-card-top">
              <span className="story-icon"><Zap size={17} aria-hidden="true" /></span>
              <ArrowUpRight className="story-card-arrow" size={18} aria-hidden="true" />
            </div>
            <h3 className="story-label">Hackathons</h3>
            <p className="story-card-copy">Smart India Hackathon &amp; Aithon</p>
            <p className="story-card-meta">AI Behavior Firewall 2.0 backend contribution</p>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="story-section story-experience" aria-labelledby="experience-title">
      <div className="section-wrap">
        <header className="section-heading reveal">
          <p className="section-kicker">Experience</p>
          <h2 id="experience-title" className="section-title">Where I’ve turned ideas into reality.</h2>
        </header>

        <div className="story-timeline">
          <svg className="story-timeline-rail" width="2" height="100%" preserveAspectRatio="none" viewBox="0 0 2 100" aria-hidden="true">
            <defs>
              <linearGradient id="story-timeline-gradient" x1="1" y1="0" x2="1" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9b5cff" />
                <stop offset="1" stopColor="#3ddcff" />
              </linearGradient>
            </defs>
            <path d="M1 0V100" className="story-rail-track" />
            <path d="M1 0V100" pathLength="1" className="story-rail-fill" />
          </svg>
          <ol className="story-timeline-list">
            {roles.map((role) => (
              <li
                className="story-timeline-item reveal"
                key={role.company}
                style={{ '--story-accent': role.accent } as CSSProperties}
                onPointerMove={trackPointer}
                onPointerLeave={resetPointer}
              >
                <span className="story-timeline-node" aria-hidden="true" />
                <article className="story-timeline-card">
                  <header className="story-timeline-meta">
                    <ExternalLink href={role.companyUrl} className="story-label story-company-link">
                      {role.company} <ArrowUpRight size={13} aria-hidden="true" />
                    </ExternalLink>
                    <h3>{role.title}</h3>
                    <p className="story-timeline-range">{role.range}</p>
                  </header>
                  <div className="story-timeline-work">
                    <ul className="story-contributions">
                      {role.contributions.map((contribution) => <li key={contribution}>{contribution}</li>)}
                    </ul>
                    <ul className="story-role-tags" aria-label="Technologies and responsibilities">
                      {role.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Education() {
  return (
    <section id="education" className="story-section story-learning" aria-labelledby="education-title">
      <div className="section-wrap">
        <header className="section-heading reveal">
          <h2 id="education-title" className="section-title">Education &amp; hackathons.</h2>
        </header>
        <div className="story-learning-cards">
          <article className="story-card story-learning-card story-learning-college reveal" style={{ '--story-accent': 'var(--violet, #9b5cff)' } as CSSProperties}>
            <span className="story-icon"><GraduationCap size={22} aria-hidden="true" /></span>
            <h3>{education.college}</h3>
            <p>{education.course}</p>
            <dl className="story-learning-stats">
              <div><dt>Graduation</dt><dd>{education.graduation}</dd></div>
              <div><dt>CGPA</dt><dd>{education.cgpa}</dd></div>
            </dl>
          </article>
          {hackathons.map((hackathon) => (
            <article
              key={hackathon.name}
              className="story-card story-learning-card story-learning-hackathon reveal"
              style={{ '--story-accent': hackathon.accent } as CSSProperties}
            >
              <span className="story-icon"><Zap size={21} aria-hidden="true" /></span>
              <h3>{hackathon.name}</h3>
              <p>{hackathon.detail}</p>
              {hackathon.project && (
                <details className="story-hackathon-details">
                  <summary>View Details <ChevronDown size={15} aria-hidden="true" /></summary>
                  <div className="story-hackathon-content">
                    <h4>Tech stack</h4>
                    <p>{hackathon.project.stack.join(', ')}</p>
                    <h4>My backend contributions</h4>
                    <ul>
                      {hackathon.project.contributions.map((contribution) => <li key={contribution}>{contribution}</li>)}
                    </ul>
                    <h4>Wider team prototype</h4>
                    <p>{hackathon.project.team}</p>
                    <ExternalLink href={hackathon.project.repository} className="story-hackathon-link">
                      View on GitHub <ArrowUpRight size={13} aria-hidden="true" />
                    </ExternalLink>
                  </div>
                </details>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
