import { ArrowDownToLine, ArrowUp, ArrowUpRight, Code2, Mail, MessageCircle, Rotate3D, Sparkles } from 'lucide-react';
import {
  Component, Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore,
  type CSSProperties, type PointerEvent, type ReactNode,
} from 'react';
import { profile } from '../data/portfolio';
import { ExternalLink } from './ExternalLink';
import type { ToyInput } from './ToyScene';
import './closing.css';

const ToyScene = lazy(() => import('./ToyScene'));
const toyColors = [
  { value: '#a989ff', name: 'Lavender' },
  { value: '#52ddf7', name: 'Cyan' },
  { value: '#c7ff69', name: 'Lime' },
  { value: '#ffad66', name: 'Orange' },
];
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(listener: () => void) {
  const motion = window.matchMedia(reducedMotionQuery);
  motion.addEventListener('change', listener);
  return () => motion.removeEventListener('change', listener);
}

function isReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

class ToyRenderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function detectWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2', {
      antialias: false,
      failIfMajorPerformanceCaveat: false,
    });
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

export function Toy({ paused }: { paused?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [canRender, setCanRender] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [hasCanvas, setHasCanvas] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const input = useRef<ToyInput>({ x: 0, y: 0, isOver: false, dragX: 0, dragY: 0, dragging: false, jumps: 0 });
  const dragFrom = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const wake = useRef<(() => void) | null>(null);
  const hasChecked = useRef(false);

  const reduced = useSyncExternalStore(subscribeToReducedMotion, isReducedMotion, () => false);

  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && !hasChecked.current) {
        hasChecked.current = true;
        setCanRender(detectWebGL());
      }
    }, { threshold: 0.08 });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  const color = toyColors[colorIndex];
  const calm = paused ?? reduced;

  function bounce() {
    if (calm) return;
    input.current.jumps += 1;
    wake.current?.();
    if (!hasCanvas) {
      fallback.current?.getAnimations().forEach((animation) => animation.cancel());
      fallback.current?.animate([
        { transform: 'translateY(0) scale(1.06, .95)' },
        { transform: 'translateY(-38px) scale(.98, 1.06)', offset: 0.35 },
        { transform: 'translateY(3px) scale(1.04, .96)', offset: 0.76 },
        { transform: 'translateY(0) scale(1)' },
      ], { duration: 590, easing: 'cubic-bezier(.2,.75,.35,1)' });
    }
  }

  function cycleColor() {
    setColorIndex((index) => (index + 1) % toyColors.length);
    wake.current?.();
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (calm) return;
    const source = dragFrom.current;
    const bounds = event.currentTarget.getBoundingClientRect();
    input.current.isOver = event.pointerType !== 'touch';
    if (input.current.isOver) {
      input.current.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      input.current.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    }
    if (source?.id === event.pointerId) {
      const dx = event.clientX - source.x;
      const dy = event.clientY - source.y;
      if (!input.current.dragging && Math.hypot(dx, dy) > 8) {
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.dragging = 'true';
        input.current.dragging = true;
        suppressClick.current = true;
      }
      if (input.current.dragging) {
        input.current.dragX = Math.max(-1.25, Math.min(1.25, dy * 0.012));
        input.current.dragY = Math.max(-2.2, Math.min(2.2, dx * 0.014));
      }
    }
    event.currentTarget.style.setProperty('--toy-tilt-x', `${input.current.y * 13 + input.current.dragX * 22}deg`);
    event.currentTarget.style.setProperty('--toy-tilt-y', `${input.current.x * 15 + input.current.dragY * 27}deg`);
    wake.current?.();
  }

  function resetPointer(event: PointerEvent<HTMLDivElement>) {
    input.current.isOver = false;
    input.current.x = 0;
    input.current.y = 0;
    if (!input.current.dragging) {
      event.currentTarget.style.setProperty('--toy-tilt-x', '0deg');
      event.currentTarget.style.setProperty('--toy-tilt-y', '0deg');
    }
    wake.current?.();
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    if (dragFrom.current?.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragFrom.current = null;
    input.current.dragX = 0;
    input.current.dragY = 0;
    input.current.dragging = false;
    delete event.currentTarget.dataset.dragging;
    resetPointer(event);
  }

  return (
    <section className="section-wrap closing-toy" id="toy" aria-labelledby="toy-title">
      <div className="closing-toy-card reveal">
        <div className="closing-toy-copy">
          <h2 className="section-title" id="toy-title">Take a little break.</h2>
          <p>{calm ? 'Pick a new color for the blob.' : 'Drag the blob to turn it. Tap to bounce, or double-click to change its color.'}</p>
          <div className="closing-toy-actions">
            {!calm && <button type="button" className="closing-toy-button" onClick={bounce}><ArrowUp size={15} /> Bounce</button>}
            <button type="button" className="closing-toy-button" onClick={cycleColor}><Sparkles size={15} /> Change color</button>
          </div>
          <span className="closing-sr-only" aria-live="polite">{color.name}</span>
        </div>
        <div
          className="closing-toy-stage"
          ref={stage}
          aria-hidden="true"
          data-canvas={hasCanvas}
          style={{ '--toy-color': color.value } as CSSProperties}
          onPointerMove={move}
          onPointerLeave={resetPointer}
          onPointerDown={(event) => {
            if (calm || event.button !== 0 || dragFrom.current) return;
            suppressClick.current = false;
            dragFrom.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onClick={() => {
            if (!suppressClick.current) bounce();
            suppressClick.current = false;
          }}
          onDoubleClick={cycleColor}
        >
          <div className="closing-toy-orbit closing-toy-orbit-inner" />
          <div className="closing-toy-orbit closing-toy-orbit-outer" />
          <span className="closing-toy-star closing-toy-star-a">✦</span>
          <span className="closing-toy-star closing-toy-star-b">✧</span>
          <span className="closing-toy-star closing-toy-star-c">•</span>
          <div className="closing-toy-shadow" />
          <div className="closing-toy-fallback" ref={fallback}>
            <div className="closing-toy-blob"><i /><i /></div>
          </div>
          {canRender && (
            <div className="closing-toy-canvas">
              <ToyRenderBoundary>
                <Suspense fallback={null}>
                  <ToyScene
                    active={visible}
                    calm={calm}
                    color={color.value}
                    input={input}
                    wake={wake}
                    onReady={setHasCanvas}
                  />
                </Suspense>
              </ToyRenderBoundary>
            </div>
          )}
          <Rotate3D className="closing-toy-rotate" size={17} strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
}

function Envelope({ sending }: { sending: boolean }) {
  return (
    <div
      className="closing-envelope-space"
      aria-hidden="true"
      data-sending={sending}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch' || document.documentElement.dataset.motion === 'paused') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        event.currentTarget.style.setProperty('--envelope-x', `${x * 24}deg`);
        event.currentTarget.style.setProperty('--envelope-y', `${-y * 18}deg`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.removeProperty('--envelope-x');
        event.currentTarget.style.removeProperty('--envelope-y');
      }}
    >
      <span className="closing-envelope-orbit closing-envelope-orbit-outside" />
      <span className="closing-envelope-orbit closing-envelope-orbit-inside" />
      <span className="closing-envelope-star closing-envelope-star-a">✧</span>
      <span className="closing-envelope-star closing-envelope-star-b">✦</span>
      <span className="closing-envelope-star closing-envelope-star-c">·</span>
      <div className="closing-envelope">
        <div className="closing-envelope-shell">
          <div className="closing-envelope-back" />
          <div className="closing-envelope-paper">
            <Code2 size={27} strokeWidth={1.55} />
            <div className="closing-envelope-ink" />
            <div className="closing-envelope-ink closing-envelope-ink-short" />
          </div>
          <div className="closing-envelope-fold closing-envelope-fold-left" />
          <div className="closing-envelope-fold closing-envelope-fold-right" />
          <div className="closing-envelope-fold closing-envelope-fold-bottom" />
          <div className="closing-envelope-seal">{profile.initials}</div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const [sending, setSending] = useState(false);
  const sentTimer = useRef<number | undefined>(undefined);
  const resume = import.meta.env.VITE_HAS_LOCAL_RESUME === 'true'
    ? `${import.meta.env.BASE_URL}resume.pdf`
    : null;

  useEffect(() => () => window.clearTimeout(sentTimer.current), []);

  return (
    <section className="closing-contact" id="contact" aria-labelledby="contact-title">
      <div className="section-wrap closing-contact-inner">
        <div className="closing-contact-copy reveal">
          <p className="section-kicker">Contact</p>
          <h2 className="section-title closing-contact-title" id="contact-title">
            Got an idea?<br /><span>Let’s make it real.</span>
          </h2>
          <div className="closing-contact-actions">
            <a
              className="closing-contact-button closing-contact-primary"
              href={`mailto:${profile.email}`}
              onClick={() => {
                window.clearTimeout(sentTimer.current);
                setSending(true);
                sentTimer.current = window.setTimeout(() => setSending(false), 720);
              }}
            >
              <Mail size={17} /> Email Me <ArrowUpRight size={17} />
            </a>
            <ExternalLink className="closing-contact-button" href={profile.github}>
              <Code2 size={17} /> GitHub <ArrowUpRight size={15} />
            </ExternalLink>
            <ExternalLink className="closing-contact-button" href={profile.whatsapp}>
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp <ArrowUpRight size={15} aria-hidden="true" />
            </ExternalLink>
            {resume && <a className="closing-contact-button" href={resume} download><ArrowDownToLine size={17} /> Download Resume</a>}
          </div>
          <a className="closing-contact-address" href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
        <Envelope sending={sending} />
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="closing-footer">
      <div className="section-wrap closing-footer-inner">
        <div className="closing-footer-identity">
          <a href="#home" className="closing-footer-logo" aria-label="Home">{profile.initials}<span>.</span></a>
          <div>
            <p>{profile.name}</p>
            <span>{profile.location}</span>
          </div>
        </div>
        <a className="closing-footer-back" href="#home">Back to top <ArrowUp size={16} /></a>
      </div>
    </footer>
  );
}
