import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowDownRight, ArrowUpRight, CodeXml, Menu, Pause, Play, Shuffle, X } from 'lucide-react'
import HeroArtwork from './components/HeroArtwork'
import Projects from './components/Projects'
import { About, Education, Experience } from './components/Story'
import { Skills, Terminal } from './components/Skills'
import { Contact, Footer, Toy } from './components/Closing'
import { profile } from './data/portfolio'

const HeroScene = lazy(() => import('./components/HeroScene'))
const navItems = [
  ['home', 'Home'],
  ['about', 'About'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
] as const

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a className="brand" href="#home" aria-label="Priyanshu Sangale, home" onClick={onClick}>
      <span className="brand-mark"><CodeXml aria-hidden="true" size={21} strokeWidth={1.7} /></span>
      <span>{profile.initials}<span className="brand-point">.</span></span>
    </a>
  )
}

function Navigation({ active }: { active: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  const desktop = useMedia('(min-width: 851px)')
  const expanded = menuOpen && !desktop

  useEffect(() => {
    if (!expanded) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuToggle.current?.focus()
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [expanded])

  return (
    <header className="site-header">
      <div className="progress-track" aria-hidden="true"><div className="progress-bar" /></div>
      <nav className="nav-wrap" aria-label="Main navigation">
        <Logo onClick={() => setMenuOpen(false)} />
        <button ref={menuToggle} type="button" className="nav-toggle" aria-label={expanded ? 'Close menu' : 'Open menu'} aria-controls="navigation-links" aria-expanded={expanded} onClick={() => setMenuOpen(!expanded)}>
          {expanded ? <X size={22} /> : <Menu size={22} />}
        </button>
        <ul className="nav-links" id="navigation-links" data-open={expanded}>
          {navItems.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="nav-cta" href="#contact" data-magnetic="">Let’s talk <ArrowUpRight aria-hidden="true" size={15} /></a>
      </nav>
    </header>
  )
}

function useScrollEffects(paused: boolean) {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const sections = navItems.map(([id]) => document.getElementById(id)).filter((section) => section !== null)
    const progress = document.querySelector<HTMLElement>('.progress-bar')
    let frame: number | undefined
    let last = ''

    const update = () => {
      frame = undefined
      const range = document.documentElement.scrollHeight - window.innerHeight
      const ratio = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0
      if (progress) progress.style.transform = `scaleX(${ratio})`
      const line = Math.max(112, window.innerHeight * 0.28)
      let id = sections[0]?.id ?? 'home'
      for (const section of sections) {
        if (section.getBoundingClientRect().top > line) break
        id = section.id
      }
      if (ratio >= 0.997) id = 'contact'
      if (id !== last) {
        last = id
        setActive(id)
      }
    }
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const layout = new ResizeObserver(schedule)
    layout.observe(document.body)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== undefined) cancelAnimationFrame(frame)
      layout.disconnect()
    }
  }, [])

  useEffect(() => {
    if (paused) return
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.06 })
    for (const element of elements) {
      if (!element.classList.contains('is-revealed')) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [paused])

  useEffect(() => {
    if (paused) return
    const section = document.getElementById('experience')
    const axis = section?.querySelector('.story-rail-fill')
    if (!section || !axis) return
    let cleanup: (() => void) | undefined
    let cancelled = false

    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      near.disconnect()
      void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger)
        const timeline = gsap.fromTo(axis, { strokeDashoffset: 1 }, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 78%', end: 'bottom 68%', scrub: 0.55 },
        })
        cleanup = () => {
          timeline.scrollTrigger?.kill()
          timeline.revert()
        }
      }).catch(() => { /* The timeline remains visible if the animation chunk cannot load. */ })
    }, { rootMargin: '450px 0px' })
    near.observe(section)

    return () => {
      cancelled = true
      near.disconnect()
      cleanup?.()
    }
  }, [paused])

  return active
}

function PointerEffects({ enabled }: { enabled: boolean }) {
  const halo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pointer = halo.current
    if (!enabled || !pointer) return
    let frame = 0
    let x = 0
    let y = 0
    let targetX = 0
    let targetY = 0
    let visible = false
    let previous = 0
    let magnetic: HTMLElement | null = null
    const label = pointer.querySelector('span')
    const draw = (time: number) => {
      frame = 0
      const mix = 1 - Math.exp(-Math.min(previous ? time - previous : 16.7, 32) / 48)
      previous = time
      x += (targetX - x) * mix
      y += (targetY - y) * mix
      pointer.style.transform = `translate3d(${x}px,${y}px,0)`
      if (Math.abs(targetX - x) > 0.15 || Math.abs(targetY - y) > 0.15) frame = requestAnimationFrame(draw)
    }
    const resetMagnet = () => {
      magnetic?.style.removeProperty('--magnet-x')
      magnetic?.style.removeProperty('--magnet-y')
      magnetic = null
    }
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const target = event.target instanceof Element ? event.target : null
      const next = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (magnetic !== next) resetMagnet()
      magnetic = next
      targetX = event.clientX
      targetY = event.clientY

      if (magnetic) {
        const rect = magnetic.getBoundingClientRect()
        magnetic.style.setProperty('--magnet-x', `${Math.max(-5, Math.min(5, (targetX - rect.left - rect.width / 2) * 0.105))}px`)
        magnetic.style.setProperty('--magnet-y', `${Math.max(-4, Math.min(4, (targetY - rect.top - rect.height / 2) * 0.16))}px`)
      }

      const context = target?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? ''
      if (pointer.dataset.context !== context) {
        pointer.dataset.context = context
        if (label) label.textContent = context
      }
      if (!visible) {
        x = targetX
        y = targetY
        pointer.style.transform = `translate3d(${x}px,${y}px,0)`
        pointer.dataset.visible = 'true'
        visible = true
      }
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const leave = () => {
      pointer.dataset.visible = 'false'
      visible = false
      resetMagnet()
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    window.addEventListener('scroll', leave, { passive: true })
    return () => {
      leave()
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      window.removeEventListener('scroll', leave)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  return enabled ? <div ref={halo} className="cursor-halo" aria-hidden="true"><span /></div> : null
}

function Hero({ paused, toggleMotion }: { paused: boolean; toggleMotion: () => void }) {
  const [role, setRole] = useState(0)
  const [shake, setShake] = useState(0)
  const [sceneAvailable, setSceneAvailable] = useState(false)

  useEffect(() => {
    if (paused) return
    const change = window.setInterval(() => setRole((index) => (index + 1) % profile.roles.length), 3850)
    return () => window.clearInterval(change)
  }, [paused])

  function updateStageLight(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== 'mouse') return
    const stage = event.currentTarget
    const rect = stage.getBoundingClientRect()
    stage.style.setProperty('--light-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 42}px`)
    stage.style.setProperty('--light-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 34}px`)
  }

  const button = (href: string, className: string, children: ReactNode) => (
    <a className={`button ${className}`} href={href} data-magnetic=""><span>{children}</span></a>
  )

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-core section-wrap">
        <div className="hero-copy">
          <div className="availability intro-part"><i aria-hidden="true" />Available for opportunities</div>
          <h1 id="hero-title" className="hero-title">
            <span className="hero-title-mask"><span>Hey, I’m</span></span>
            <span className="hero-title-mask"><span className="hero-name">Priyanshu<span>.</span></span></span>
          </h1>
          <div className="hero-role intro-part">
            <span className="hero-role-prompt" aria-hidden="true">{'>'}</span>
            <span className="sr-only">Backend developer, creative problem solver and web developer.</span>
            <span className="hero-role-slot" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={role} initial={paused ? false : { opacity: 0, y: 11 }} animate={{ opacity: 1, y: 0 }} exit={paused ? { opacity: 1 } : { opacity: 0, y: -9 }} transition={{ duration: paused ? 0 : 0.21 }}>{profile.roles[role]}</motion.span>
              </AnimatePresence>
            </span>
          </div>
          <p className="hero-description intro-part">I’m an IT engineering student and Python backend developer who loves turning creative ideas into real-world applications.</p>
          <div className="hero-actions intro-part">
            {button('#projects', 'button-primary', <>Explore My Work <ArrowDownRight size={19} aria-hidden="true" /></>)}
            {button('#contact', 'button-secondary', <>Let’s Connect <ArrowUpRight size={17} aria-hidden="true" /></>)}
          </div>
        </div>

        <div className="hero-stage intro-part" onPointerMove={updateStageLight} onPointerLeave={(event) => {
          event.currentTarget.style.removeProperty('--light-x')
          event.currentTarget.style.removeProperty('--light-y')
        }}>
          <div className="stage-glow" aria-hidden="true" />
          <div className="stage-top">
            <span><i aria-hidden="true" /> Developer Playground</span>
            <button className="motion-button" type="button" aria-label={paused ? 'Resume motion' : 'Pause motion'} title={paused ? 'Resume motion' : 'Pause motion'} onClick={toggleMotion}>
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
          <div className="stage-scene">
            <Suspense fallback={<HeroArtwork />}>
              <HeroScene shake={shake} paused={paused} onAvailabilityChange={setSceneAvailable} />
            </Suspense>
          </div>
          <div className="stage-bottom">
            {sceneAvailable && !paused && <span className="stage-hint"><span aria-hidden="true">✦</span> <span className="stage-mouse">Move / drag to play</span><span className="stage-touch">Tap an object to play</span></span>}
            <button className="shake-button" type="button" onClick={() => setShake((count) => count + 1)} disabled={paused || !sceneAvailable}><Shuffle size={15} aria-hidden="true" /> Shake Things Up</button>
          </div>
        </div>
      </div>
      <div className="hero-bottom section-wrap">
        <a href="#about" className="scroll-link"><ArrowDown size={14} aria-hidden="true" /> <span>Scroll to explore</span></a>
        <span className="hero-location"><i aria-hidden="true" /> {profile.location}</span>
      </div>
    </section>
  )
}

export default function App() {
  const systemReduced = useMedia('(prefers-reduced-motion: reduce)')
  const finePointer = useMedia('(hover: hover) and (pointer: fine)')
  const [motionPreference, setMotionPreference] = useState<boolean | null>(null)
  const paused = motionPreference ?? systemReduced
  const active = useScrollEffects(paused)

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing'
    return () => { delete document.documentElement.dataset.motion }
  }, [paused])

  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <Navigation active={active} />
      <PointerEffects enabled={finePointer && !paused} />
      <main id="content" tabIndex={-1}>
        <Hero paused={paused} toggleMotion={() => setMotionPreference(!paused)} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Terminal />
        <Toy paused={paused} />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
