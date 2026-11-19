import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, KeyboardEvent, PointerEvent } from 'react'
import { Braces, Code2, Cpu, Database, GitBranch, Layers3, Orbit, Terminal as TerminalIcon } from 'lucide-react'
import { profile } from '../data/portfolio'
import { ExternalLink } from './ExternalLink'
import './skills.css'

type Skill = { name: string; mark: string; description: string }

const skillGroups = [
  {
    name: 'Backend', color: '#bc9aff', icon: Braces,
    skills: [
      { name: 'FastAPI', mark: 'ϟ', description: 'Python framework for HTTP APIs. I used it for the backend endpoints in AI Behavior Firewall 2.0.' },
      { name: 'Flask', mark: 'Fl', description: 'Lightweight Python web framework I used for my academic Restaurant Recommendation System.' },
      { name: 'REST APIs', mark: '</>', description: 'HTTP interfaces for applications, including the session, event, and dashboard endpoints in my hackathon prototype.' },
      { name: 'Pydantic', mark: 'Py', description: 'Python models for parsing and validating requests. I used it in AI Behavior Firewall 2.0.' },
      { name: 'SQLAlchemy', mark: 'SA', description: 'Python database toolkit I used with SQLite in AI Behavior Firewall 2.0.' },
    ],
  },
  {
    name: 'Programming', color: '#c7ff69', icon: Code2,
    skills: [
      { name: 'Python', mark: 'Py', description: 'My main backend language, used in the hackathon prototype and the Restaurant Recommendation System.' },
      { name: 'JavaScript', mark: 'JS', description: 'Language for interactive behavior in web applications.' },
      { name: 'HTML', mark: 'HT', description: 'Web page markup I used for frontend contributions to ZeroFX.club and AIM Germany.' },
      { name: 'CSS', mark: 'CS', description: 'Layout, styling, and responsive design for web interfaces.' },
      { name: 'SQL', mark: 'SQ', description: 'Query language for retrieving and working with relational data.' },
    ],
  },
  {
    name: 'Databases', color: '#70e4ff', icon: Database,
    skills: [
      { name: 'SQLite', mark: 'SL', description: 'Embedded relational database I used in AI Behavior Firewall 2.0.' },
      { name: 'MySQL (basic)', mark: 'MY', description: 'Basic exposure to the MySQL relational database.' },
    ],
  },
  {
    name: 'Tools', color: '#ffaedc', icon: GitBranch,
    skills: [
      { name: 'Git', mark: '⎇', description: 'Version control for tracking changes and collaborating on code.' },
      { name: 'GitHub', mark: 'GH', description: 'Repository hosting and collaboration around Git projects.' },
      { name: 'VS Code', mark: 'VS', description: 'Code editor for working with projects across the stack.' },
      { name: 'Cursor', mark: 'CU', description: 'Code editor with integrated AI assistance.' },
      { name: 'GitHub Copilot', mark: 'CP', description: 'AI coding assistant with contextual suggestions.' },
      { name: 'Vercel', mark: '▲', description: 'Platform for deploying and previewing web applications.' },
    ],
  },
  {
    name: 'Computer science', color: '#ffba80', icon: Layers3,
    skills: [
      { name: 'Data structures & algorithms', mark: 'DS', description: 'Foundations for organizing data and reasoning about how a program solves a problem.' },
      { name: 'Arrays', mark: '[ ]', description: 'Indexed collections and common traversal patterns.' },
      { name: 'Strings', mark: 'Ab', description: 'Representing, scanning, and manipulating text.' },
      { name: 'Sorting', mark: '⇅', description: 'Arranging a collection by a consistent ordering.' },
      { name: 'Searching', mark: '⌕', description: 'Finding values and positions in a collection.' },
      { name: 'Recursion', mark: '↻', description: 'Solving smaller versions of a problem until reaching a base case.' },
    ],
  },
  {
    name: 'Additional exposure', color: '#adadff', icon: Cpu,
    skills: [
      { name: 'scikit-learn', mark: 'ML', description: 'Python machine-learning library used for the optional classifier on synthetic data in the hackathon prototype.' },
    ],
  },
] satisfies { name: string; color: string; icon: typeof Code2; skills: Skill[] }[]

const nodeHeights = [-49, 53, -69, 58, -32, 42]

function SkillOrbit({ group, skill, onSelect }: {
  group: (typeof skillGroups)[number]
  skill: string
  onSelect: (name: string) => void
}) {
  const stage = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const Icon = group.icon

  useEffect(() => {
    if (!stage.current) return
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 })
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])

  function moveStage(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || document.documentElement.dataset.motion === 'paused') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--orbit-tilt-x', `${vertical * -11}deg`)
    event.currentTarget.style.setProperty('--orbit-tilt-y', `${horizontal * 15}deg`)
  }

  function returnStage(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty('--orbit-tilt-x')
    event.currentTarget.style.removeProperty('--orbit-tilt-y')
  }

  return (
    <div className="skill-orbit" ref={stage} data-visible={visible} onPointerMove={moveStage} onPointerLeave={returnStage}>
      <div className="skill-orbit__frame" aria-hidden="true" />
      <div className="skill-orbit__label" aria-hidden="true"><Orbit size={15} /> {group.name}</div>
      <div className="skill-orbit__perspective">
        <div className="skill-orbit__tilt">
          <div className="skill-orbit__rings" aria-hidden="true"><i /><i /><i /></div>
          <div className="skill-orbit__core" aria-hidden="true"><i /><i /><Icon size={38} strokeWidth={1.35} /></div>
          <div className="skill-orbit__rotor" aria-label={`${group.name} skill orbit`} role="group">
            {group.skills.map((item, index) => (
              <div
                className="skill-orbit__arm"
                key={item.name}
                style={{
                  '--orbit-angle': `${54 + index * 360 / group.skills.length}deg`,
                  '--orbit-height': `${nodeHeights[index]}px`,
                } as CSSProperties}
              >
                <div className="skill-orbit__counter">
                  <button className="skill-orbit__node" type="button" aria-pressed={skill === item.name} onClick={() => onSelect(item.name)}>
                    <span aria-hidden="true">{item.mark}</span>
                    <span className="skill-orbit__node-name">{item.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Skills() {
  const [groupIndex, setGroupIndex] = useState(0)
  const [skill, setSkill] = useState(skillGroups[0].skills[0])
  const group = skillGroups[groupIndex]
  const GroupIcon = group.icon

  function selectGroup(index: number) {
    setGroupIndex(index)
    setSkill(skillGroups[index].skills[0])
  }

  function selectSkill(name: string) {
    const item = group.skills.find((entry) => entry.name === name)
    if (item) setSkill(item)
  }

  return (
    <section className="section-wrap skills-section" id="skills" aria-labelledby="skills-heading">
      <div className="section-heading reveal">
        <p className="section-kicker">Skills</p>
        <h2 className="section-title" id="skills-heading">Tools I use to make things happen.</h2>
      </div>
      <div className="skill-categories reveal" aria-label="Skill categories" role="group">
        {skillGroups.map(({ name, icon: Icon }, index) => (
          <button key={name} type="button" aria-pressed={index === groupIndex} onClick={() => selectGroup(index)}>
            <Icon size={16} aria-hidden="true" />{name}
          </button>
        ))}
      </div>
      <div className="skill-layout reveal" style={{ '--skill-color': group.color } as CSSProperties}>
        <SkillOrbit group={group} skill={skill.name} onSelect={selectSkill} />
        <div className="skill-inspector">
          <div className="skill-inspector__title"><GroupIcon size={17} aria-hidden="true" /><h3>{group.name}</h3></div>
          <div className="skill-inspector__grid" aria-label={`${group.name} skills`} role="group">
            {group.skills.map((item) => (
              <button type="button" key={item.name} aria-pressed={skill.name === item.name} onClick={() => setSkill(item)}>{item.name}</button>
            ))}
          </div>
          <div className="skill-inspector__details" aria-live="polite" aria-atomic="true">
            <span className="skill-inspector__dot" aria-hidden="true" />
            <h4>{skill.name}</h4>
            <p>{skill.description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

type TerminalLine = string | { text: string; href: string }
type TerminalEntry = { command: string; lines: readonly TerminalLine[] }

const commandOutput = {
  help: ['Available commands', 'help · about · skills · projects · experience · education · contact · github · clear'],
  about: [
    profile.name,
    `IT engineering student and Python backend developer in ${profile.location}.`,
    'I work with Python, FastAPI, Flask, REST APIs, and web applications.',
    { text: 'About me', href: '#about' },
  ],
  skills: [
    ...skillGroups.map(({ name, skills }) => `${name}: ${skills.map((item) => item.name).join(', ')}`),
    { text: 'Explore skills', href: '#skills' },
  ],
  projects: [
    'AI Behavior Firewall 2.0 — backend contribution to a hackathon prototype',
    'Restaurant Recommendation System — academic Python and Flask web application',
    'Restaurant Performance Analytics — performance, stock, food trends, and cost insights',
    { text: 'Explore projects', href: '#projects' },
  ],
  experience: [
    'Brevitus Technology — Developer & Project Manager (September 2026–present)',
    'RAG Genesis Global — Web Developer Intern (May–September 2026)',
    { text: 'See experience', href: '#experience' },
  ],
  education: [
    'Amrutvahini College of Engineering — B.E. Information Technology',
    'Expected graduation: 2028 · CGPA: 8.0/10',
    { text: 'Education and hackathons', href: '#education' },
  ],
  contact: [{ text: profile.email, href: `mailto:${profile.email}` }],
  github: [{ text: profile.github.replace('https://', ''), href: profile.github }],
} satisfies Record<string, readonly TerminalLine[]>

function isCommand(command: string): command is keyof typeof commandOutput {
  return Object.prototype.hasOwnProperty.call(commandOutput, command)
}

export function Terminal() {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyOffset, setHistoryOffset] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const draft = useRef('')
  const output = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight
  }, [entries])

  function runCommand(valueToRun: string) {
    const entered = valueToRun.trim()
    if (!entered) return
    const command = entered.toLowerCase()
    setHistory((previous) => [...previous, entered])
    setHistoryOffset(0)
    setValue('')
    draft.current = ''

    if (command === 'clear') {
      setShowWelcome(false)
      setEntries([])
      return
    }

    setEntries((previous) => [
      ...previous,
      { command: entered, lines: isCommand(command) ? commandOutput[command] : ['Unknown command. Type help to see what you can run.'] },
    ])
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    runCommand(value)
  }

  function browseHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    if (history.length === 0) return
    event.preventDefault()

    if (event.key === 'ArrowUp' && historyOffset === 0) draft.current = value
    const direction = event.key === 'ArrowUp' ? 1 : -1
    const offset = Math.max(0, Math.min(history.length, historyOffset + direction))
    setHistoryOffset(offset)
    setValue(offset === 0 ? draft.current : history[history.length - offset])
  }

  return (
    <section className="section-wrap portfolio-terminal" id="terminal" aria-labelledby="terminal-heading">
      <div className="portfolio-terminal__intro section-heading reveal">
        <p className="section-kicker">Terminal</p>
        <h2 className="section-title" id="terminal-heading">Want to explore my world? Try the terminal.</h2>
        <p>Run a command with Enter. Use the arrow keys to revisit your command history.</p>
        <div className="portfolio-terminal__suggestions" role="group" aria-label="Example commands">
          {['help', 'projects', 'contact'].map((command) => (
            <button key={command} type="button" onClick={() => { runCommand(command); input.current?.focus({ preventScroll: true }) }}>
              <span aria-hidden="true">&gt;</span> {command}
            </button>
          ))}
        </div>
      </div>
      <div className="portfolio-terminal__window reveal">
        <div className="portfolio-terminal__chrome">
          <span className="portfolio-terminal__dots" aria-hidden="true"><i /><i /><i /></span>
          <span><TerminalIcon size={15} aria-hidden="true" /> portfolio-shell</span>
        </div>
        <div className="portfolio-terminal__output" role="log" aria-label="Terminal output" ref={output} tabIndex={0}>
          {showWelcome && <p className="portfolio-terminal__welcome">Welcome to my portfolio. Try <code>help</code> to see the available commands.</p>}
          {entries.map((entry, entryIndex) => (
            <div className="portfolio-terminal__entry" key={entryIndex}>
              <p className="portfolio-terminal__line"><span aria-hidden="true">&gt;</span> {entry.command}</p>
              {entry.lines.map((line, lineIndex) => {
                if (typeof line === 'string') return <p key={lineIndex}>{line}</p>
                const Link = line.href.startsWith('https://') ? ExternalLink : 'a'
                return <p key={lineIndex}><Link href={line.href}>{line.text} <span aria-hidden="true">↗</span></Link></p>
              })}
            </div>
          ))}
        </div>
        <form className="portfolio-terminal__form" onSubmit={submit}>
          <label htmlFor="portfolio-command" className="portfolio-terminal__sr-only">Terminal command</label>
          <span className="portfolio-terminal__prompt" aria-hidden="true">priyanshu<span>@</span>portfolio <span>~</span> $</span>
          <input
            id="portfolio-command"
            ref={input}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={browseHistory}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="Type a command"
          />
          <button type="submit" aria-label="Run command"><span aria-hidden="true">↵</span></button>
        </form>
      </div>
    </section>
  )
}
