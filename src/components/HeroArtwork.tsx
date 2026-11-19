import './hero-scene.css'

export const heroArtworkDescription = 'Floating purple laptop surrounded by a torus, a lime cube, a cyan sphere, and developer symbols'

export default function HeroArtwork({ animate = false, decorative = false }: { animate?: boolean; decorative?: boolean }) {
  return (
    <div className={`hero-scene-fallback${animate ? ' hero-scene-fallback--shaken' : ''}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : heroArtworkDescription} aria-hidden={decorative || undefined}>
      <span className="hero-fallback-orbit" />
      <span className="hero-fallback-braces">{'{ }'}</span>
      <span className="hero-fallback-torus" />
      <span className="hero-fallback-cube" />
      <span className="hero-fallback-sphere" />
      <span className="hero-fallback-laptop">
        <span className="hero-fallback-screen">
          <span className="hero-fallback-toolbar">••• <span>playground.py</span></span>
          <span className="hero-fallback-code"><i>from</i> fastapi <i>import</i> FastAPI<br /><br />app = FastAPI()<br /><br /><i>@app.get</i>(<b>"/hello"</b>)<br />def playground():<br />&nbsp; return {'{'}<b>"status": "ready"</b>{'}'}</span>
        </span>
        <span className="hero-fallback-keyboard" />
      </span>
    </div>
  )
}

