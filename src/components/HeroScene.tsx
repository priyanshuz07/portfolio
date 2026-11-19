import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import {
  AdditiveBlending,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from 'three'
import HeroArtwork, { heroArtworkDescription } from './HeroArtwork'

type Point = [number, number, number]
type ScenePointer = MutableRefObject<Vector2>
type DragSession = MutableRefObject<{ id: number; cancel: () => void } | null>
type PhysicsModule = typeof import('@react-three/rapier')

const violet = '#a986ff'
const mint = '#ccff78'
const ice = '#52e0ff'
const amber = '#ffac6e'

function useSceneMedia(query: string) {
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

function useArtworkTexture(draw: (context: CanvasRenderingContext2D) => void, width: number, height: number) {
  const [texture, setTexture] = useState<CanvasTexture>()
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return
    draw(context)
    const artwork = new CanvasTexture(canvas)
    artwork.colorSpace = SRGBColorSpace
    artwork.anisotropy = 4
    setTexture(artwork)
    return () => artwork.dispose()
  }, [draw, height, width])
  return texture
}

function drawCode(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas
  const gradient = context.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#19172f')
  gradient.addColorStop(1, '#10101b')
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#232039'
  context.fillRect(0, 0, width, 65)
  const dots = ['#ff8ab3', '#fbd083', '#b2ef76']
  dots.forEach((color, index) => {
    context.beginPath()
    context.arc(29 + index * 22, 33, 5, 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
  })
  context.font = '21px monospace'
  context.fillStyle = '#c2b5dd'
  context.fillText('playground.py', 116, 41)

  const source = [
    [['from ', '#c495ff'], ['fastapi ', '#f0eaff'], ['import ', '#c495ff'], ['FastAPI', '#8ce6fa']],
    [['', '#f0eaff']],
    [['app', '#f0eaff'], [' = ', '#c495ff'], ['FastAPI()', '#8ce6fa']],
    [['', '#f0eaff']],
    [['@app.get', '#deb1f4'], ['(', '#f0eaff'], ['"/hello"', '#c9f484'], [')', '#f0eaff']],
    [['def ', '#c495ff'], ['playground', '#8ce6fa'], ['():', '#f0eaff']],
    [['    return ', '#c495ff'], ['{"status": ', '#f0eaff'], ['"ready"', '#c9f484'], ['}', '#f0eaff']],
  ]
  source.forEach((line, row) => {
    const y = 118 + row * 40
    let x = 92
    context.font = '18px monospace'
    context.fillStyle = '#8e80ad'
    context.fillText(String(row + 1).padStart(2, '0'), 31, y)
    context.font = '25px monospace'
    line.forEach(([word, color]) => {
      context.fillStyle = color
      context.fillText(word, x, y)
      x += context.measureText(word).width
    })
  })
  context.fillStyle = '#c9f484'
  context.fillRect(92, 382, 11, 24)
  context.fillStyle = '#29243f'
  context.fillRect(0, height - 34, width, 34)
  context.fillStyle = '#b3a5d6'
  context.font = '17px monospace'
  context.fillText('PYTHON', 30, height - 11)
  context.fillText('UTF-8', width - 80, height - 11)
}

function drawTerminal(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas
  context.fillStyle = '#16162b'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#37245a'
  context.fillRect(0, 0, width, 35)
  context.fillStyle = '#e1ceff'
  context.font = '17px monospace'
  context.fillText('TERMINAL', 20, 24)
  context.font = '58px monospace'
  context.fillStyle = '#d4fba1'
  context.fillText('>_', 28, 98)
  context.fillStyle = '#856bb4'
  context.fillRect(126, 78, 90, 5)
  context.fillRect(126, 90, 61, 5)
}

function drawStage(context: CanvasRenderingContext2D) {
  const center = context.canvas.width / 2
  const bloom = context.createRadialGradient(center, center, 0, center, center, center)
  bloom.addColorStop(0, '#41216b95')
  bloom.addColorStop(0.54, '#2a184667')
  bloom.addColorStop(1, '#19102500')
  context.fillStyle = bloom
  context.fillRect(0, 0, center * 2, center * 2)
  const rings = [117, 176, 198, 230]
  rings.forEach((radius, index) => {
    context.strokeStyle = index === 2 ? '#a16be375' : '#7047a766'
    context.lineWidth = index === 2 ? 2 : 1
    context.beginPath()
    context.arc(center, center, radius, 0, Math.PI * 2)
    context.stroke()
  })
  context.strokeStyle = '#a16be35c'
  context.lineWidth = 1
  for (let tick = 0; tick < 64; tick += 1) {
    const angle = (tick / 64) * Math.PI * 2
    const start = tick % 8 === 0 ? 204 : 219
    context.beginPath()
    context.moveTo(center + Math.cos(angle) * start, center + Math.sin(angle) * start)
    context.lineTo(center + Math.cos(angle) * 226, center + Math.sin(angle) * 226)
    context.stroke()
  }

  context.save()
  context.translate(center, center - 26)
  context.scale(1.3, 0.64)
  const penumbra = context.createRadialGradient(0, 0, 0, 0, 0, 130)
  penumbra.addColorStop(0, '#0c071bc4')
  penumbra.addColorStop(0.48, '#0c071b78')
  penumbra.addColorStop(1, '#0c071b00')
  context.fillStyle = penumbra
  context.fillRect(-130, -130, 260, 260)
  context.restore()
}

function Stage() {
  const texture = useArtworkTexture(drawStage, 512, 512)
  return (
    <mesh position={[0.06, -1.56, -0.02]} rotation={[-1.13, 0, -0.22]}>
      <planeGeometry args={[6.02, 4.82]} />
      <meshBasicMaterial map={texture} color={texture ? '#ffffff' : '#251636'} transparent opacity={texture ? 1 : 0} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Keyboard() {
  const mesh = useRef<InstancedMesh>(null)
  useEffect(() => {
    if (!mesh.current) return
    const key = new Object3D()
    const color = new Color()
    const rowCount = 4
    const columnCount = 13
    for (let row = 0; row < rowCount; row += 1) {
      for (let column = 0; column < columnCount; column += 1) {
        const index = row * columnCount + column
        key.position.set((column - 6) * 0.212, 0, row * 0.153)
        key.scale.set(0.178, 0.047, 0.111)
        key.updateMatrix()
        mesh.current.setMatrixAt(index, key.matrix)
        const shade = index === 0 ? '#e49bfa' : column === 12 ? '#7d64a8' : '#4d386c'
        mesh.current.setColorAt(index, color.set(shade))
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [])
  return (
    <group position={[0, -0.555, -0.035]}>
      <mesh position={[0, -0.022, 0.25]}>
        <boxGeometry args={[2.87, 0.038, 0.70]} />
        <meshStandardMaterial color="#322348" roughness={0.83} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, 52]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.69} metalness={0.09} />
      </instancedMesh>
      <RoundedBox args={[0.9, 0.022, 0.29]} radius={0.023} smoothness={2} position={[0, -0.025, 0.87]}>
        <meshStandardMaterial color="#4e3574" roughness={0.5} metalness={0.25} />
      </RoundedBox>
      <RoundedBox args={[0.82, 0.023, 0.228]} radius={0.022} smoothness={2} position={[0, -0.022, 0.87]}>
        <meshStandardMaterial color="#a383cf" roughness={0.44} metalness={0.24} />
      </RoundedBox>
    </group>
  )
}

function Workstation({ pointer, reduced, compact }: { pointer: ScenePointer; reduced: boolean; compact: boolean }) {
  const machine = useRef<Group>(null)
  const elapsed = useRef(0)
  const code = useArtworkTexture(drawCode, 768, 460)
  useFrame((_, delta) => {
    if (!machine.current || reduced) return
    const dt = Math.min(delta, 0.04)
    elapsed.current += dt
    const t = elapsed.current
    const intro = 1 - Math.pow(1 - Math.min(1, t / 0.72), 3)
    machine.current.position.y = -0.13 + Math.sin(t * 0.92) * 0.073 - (1 - intro) * 0.44
    machine.current.rotation.x = MathUtils.damp(machine.current.rotation.x, 0.47 + pointer.current.y * 0.085, 5, dt)
    machine.current.rotation.y = MathUtils.damp(machine.current.rotation.y, -0.32 + pointer.current.x * 0.105, 5, dt)
  })

  return (
    <group ref={machine} rotation={[0.47, -0.32, -0.047]} position={[0, -0.13, 0.45]} scale={compact ? 0.94 : 1}>
      <RoundedBox args={[3.53, 0.183, 1.77]} radius={0.087} smoothness={3} position={[0, -0.67, 0.54]}>
        <meshStandardMaterial color="#815aaf" metalness={0.36} roughness={0.38} />
      </RoundedBox>
      <RoundedBox args={[3.44, 0.068, 1.70]} radius={0.037} smoothness={2} position={[0, -0.586, 0.54]}>
        <meshStandardMaterial color="#ad86d5" metalness={0.28} roughness={0.37} />
      </RoundedBox>
      <Keyboard />
      <mesh position={[0, -0.667, 1.423]}>
        <boxGeometry args={[2.96, 0.015, 0.012]} />
        <meshBasicMaterial color="#e1b7ff" toneMapped={false} />
      </mesh>
      <mesh position={[1.30, -0.606, 1.412]}>
        <boxGeometry args={[0.129, 0.021, 0.025]} />
        <meshBasicMaterial color={mint} toneMapped={false} />
      </mesh>
      <mesh position={[1.766, -0.661, 0.865]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.26, 0.05]} />
        <meshStandardMaterial color="#24172e" roughness={0.8} />
      </mesh>
      <mesh position={[1.767, -0.661, 0.322]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.17, 0.05]} />
        <meshStandardMaterial color="#24172e" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.543, -0.263]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.089, 0.089, 2.63, 20]} />
        <meshStandardMaterial color="#4e316d" metalness={0.6} roughness={0.42} />
      </mesh>
      <group position={[0, -0.59, -0.33]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[3.43, 2.30, 0.19]} radius={0.105} smoothness={4} position={[0, 1.155, 0]}>
          <meshStandardMaterial color="#9f6fe0" metalness={0.37} roughness={0.37} />
        </RoundedBox>
        <RoundedBox args={[3.22, 2.088, 0.04]} radius={0.08} smoothness={3} position={[0, 1.17, 0.098]}>
          <meshStandardMaterial color="#241630" metalness={0.2} roughness={0.55} />
        </RoundedBox>
        <mesh position={[0, 1.19, 0.125]}>
          <planeGeometry args={[3.02, 1.81]} />
          <meshBasicMaterial map={code} color={code ? '#ffffff' : '#171326'} toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.157, 0.128]}>
          <circleGeometry args={[0.029, 18]} />
          <meshBasicMaterial color="#a38ebb" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.202, 0.125]}>
          <planeGeometry args={[0.33, 0.014]} />
          <meshBasicMaterial color="#77628f" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function TerminalTile() {
  const artwork = useArtworkTexture(drawTerminal, 256, 128)
  return (
    <group>
      <RoundedBox args={[1.04, 0.59, 0.13]} radius={0.068} smoothness={3}>
        <meshStandardMaterial color="#8057b0" metalness={0.26} roughness={0.39} />
      </RoundedBox>
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[0.93, 0.465]} />
        <meshBasicMaterial map={artwork} color={artwork ? '#ffffff' : '#211836'} toneMapped={false} />
      </mesh>
    </group>
  )
}

const braceCurve = new CatmullRomCurve3([
  new Vector3(0.15, 0.33, 0),
  new Vector3(0.025, 0.30, 0),
  new Vector3(-0.018, 0.11, 0),
  new Vector3(-0.105, 0.024, 0),
  new Vector3(-0.14, 0, 0),
  new Vector3(-0.105, -0.024, 0),
  new Vector3(-0.018, -0.11, 0),
  new Vector3(0.025, -0.30, 0),
  new Vector3(0.15, -0.33, 0),
])

function Braces() {
  return (
    <group>
      <mesh position={[-0.245, 0, 0]}>
        <tubeGeometry args={[braceCurve, 24, 0.063, 10, false]} />
        <meshStandardMaterial color={amber} metalness={0.31} roughness={0.32} />
      </mesh>
      <mesh position={[0.245, 0, 0]} scale={[-1, 1, 1]}>
        <tubeGeometry args={[braceCurve, 24, 0.063, 10, false]} />
        <meshStandardMaterial color={amber} metalness={0.31} roughness={0.32} />
      </mesh>
    </group>
  )
}

function Torus() {
  return (
    <group>
      <mesh>
        <torusGeometry args={[0.51, 0.215, 18, 54]} />
        <meshPhysicalMaterial color="#9a56ff" metalness={0.37} roughness={0.27} clearcoat={1} clearcoatRoughness={0.23} />
      </mesh>
      <mesh position={[0, 0, 0.144]}>
        <torusGeometry args={[0.624, 0.014, 7, 54]} />
        <meshStandardMaterial color="#d2a1ff" metalness={0.3} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0, -0.144]}>
        <torusGeometry args={[0.624, 0.014, 7, 54]} />
        <meshStandardMaterial color="#663ba7" metalness={0.34} roughness={0.34} />
      </mesh>
    </group>
  )
}

function Cube() {
  return (
    <group>
      <RoundedBox args={[0.76, 0.76, 0.76]} radius={0.108} smoothness={3}>
        <meshPhysicalMaterial color="#b9ed55" metalness={0.12} roughness={0.31} clearcoat={0.7} />
      </RoundedBox>
      {([0, Math.PI / 2, Math.PI] as const).map((rotation) => (
        <group key={rotation} rotation={[0, rotation, 0]}>
          <RoundedBox args={[0.56, 0.56, 0.018]} radius={0.014} smoothness={2} position={[0, 0, 0.38]}>
            <meshStandardMaterial color="#749a36" metalness={0.09} roughness={0.58} />
          </RoundedBox>
          <RoundedBox args={[0.49, 0.49, 0.022]} radius={0.013} smoothness={2} position={[0, 0, 0.386]}>
            <meshStandardMaterial color="#c7f582" metalness={0.09} roughness={0.38} />
          </RoundedBox>
          <mesh position={[0, 0, 0.400]}>
            <circleGeometry args={[0.052, 14]} />
            <meshBasicMaterial color="#536b2a" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function GlassOrb({ compact }: { compact: boolean }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.51, compact ? 24 : 35, 20]} />
        <meshPhysicalMaterial color="#32b8db" metalness={0.31} roughness={0.15} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.533, compact ? 20 : 35, 20]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`
            varying vec3 eyeNormal;
            varying vec3 eyeDirection;
            void main() {
              vec4 positionInView = modelViewMatrix * vec4(position, 1.0);
              eyeNormal = normalize(normalMatrix * normal);
              eyeDirection = normalize(-positionInView.xyz);
              gl_Position = projectionMatrix * positionInView;
            }`
          }
          fragmentShader={`
            varying vec3 eyeNormal;
            varying vec3 eyeDirection;
            void main() {
              float facing = max(dot(normalize(eyeNormal), normalize(eyeDirection)), 0.0);
              float edge = pow(1.0 - facing, 2.7);
              gl_FragColor = vec4(0.19, 0.77, 0.96, edge * 0.65);
            }`
          }
        />
      </mesh>
      <mesh rotation={[1.0, -0.17, 0.25]}>
        <torusGeometry args={[0.64, 0.012, 7, 56]} />
        <meshBasicMaterial color="#90d9fa" transparent opacity={0.72} toneMapped={false} />
      </mesh>
    </group>
  )
}

const pythonCurve = new CatmullRomCurve3([
  new Vector3(-0.23, 0.05, 0),
  new Vector3(-0.12, 0.05, 0),
  new Vector3(0.04, 0.05, 0),
  new Vector3(0.14, 0.12, 0),
  new Vector3(0.14, 0.23, 0),
  new Vector3(0.03, 0.26, 0),
  new Vector3(-0.07, 0.24, 0),
])

function PythonCharm() {
  return (
    <group>
      <RoundedBox args={[0.66, 0.66, 0.115]} radius={0.096} smoothness={3}>
        <meshStandardMaterial color="#30264e" metalness={0.30} roughness={0.48} />
      </RoundedBox>
      {[0, Math.PI].map((angle, index) => (
        <group key={angle} position={[0, 0, 0.088]} rotation={[0, 0, angle]}>
          <mesh>
            <tubeGeometry args={[pythonCurve, 24, 0.071, 10, false]} />
            <meshStandardMaterial color={index === 0 ? '#63c4fb' : '#ffe16b'} metalness={0.22} roughness={0.34} />
          </mesh>
          <mesh position={[-0.053, 0.235, 0.061]}>
            <sphereGeometry args={[0.019, 8, 8]} />
            <meshBasicMaterial color="#272136" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FloatObject({ children, position, rotation, phase, depth = 0.13, pointer, dragSession, reduced, bounce, spin = 0.075 }: {
  children: ReactNode
  position: Point
  rotation: Point
  phase: number
  depth?: number
  pointer: ScenePointer
  dragSession: DragSession
  reduced: boolean
  bounce: number
  spin?: number
}) {
  const group = useRef<Group>(null)
  const hovered = useRef(false)
  const dragged = useRef<{ id: number; x: number; y: number; moved: boolean; capture?: Element } | null>(null)
  const offset = useRef(new Vector2())
  const target = useRef(new Vector2())
  const velocity = useRef(new Vector2())
  const rotationOffset = useRef(0)
  const rotationTarget = useRef(0)
  const jump = useRef(0)
  const jumpVelocity = useRef(0)
  const elapsed = useRef(0)
  const seenBounce = useRef(bounce)

  function clearDrag() {
    const grab = dragged.current
    if (!grab) return
    dragged.current = null
    target.current.set(0, 0)
    if (dragSession.current?.id === grab.id) dragSession.current = null
    if (grab.capture?.hasPointerCapture(grab.id)) grab.capture.releasePointerCapture(grab.id)
  }

  function press(event: ThreeEvent<PointerEvent>) {
    if (reduced || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.stopPropagation()
    dragSession.current?.cancel()
    const capture = event.pointerType === 'mouse' || event.pointerType === 'pen' ? event.target as Element : undefined
    dragged.current = { id: event.pointerId, x: event.pointer.x, y: event.pointer.y, moved: false, capture }
    dragSession.current = { id: event.pointerId, cancel: clearDrag }
    capture?.setPointerCapture(event.pointerId)
  }

  function drag(event: ThreeEvent<PointerEvent>) {
    const grab = dragged.current
    if (!grab || event.pointerType === 'touch' || grab.id !== event.pointerId) return
    event.stopPropagation()
    const dx = event.pointer.x - grab.x
    const dy = event.pointer.y - grab.y
    if (Math.abs(dx) + Math.abs(dy) > 0.031) grab.moved = true
    target.current.set(MathUtils.clamp(dx * 2.8, -0.74, 0.74), MathUtils.clamp(dy * 2.5, -0.61, 0.61))
  }

  function release(event: ThreeEvent<PointerEvent>) {
    const grab = dragged.current
    if (!grab || grab.id !== event.pointerId) return
    clearDrag()
    event.stopPropagation()
    if (!grab.moved) {
      rotationTarget.current += Math.PI * 2
      jumpVelocity.current = 2.42
    }
  }

  useFrame((_, delta) => {
    const object = group.current
    if (!object || reduced) return
    const dt = Math.min(0.034, delta)
    elapsed.current += dt
    const t = elapsed.current
    if (seenBounce.current !== bounce) {
      seenBounce.current = bounce
      jumpVelocity.current = 2.0 + (phase % 1) * 1.45
      rotationTarget.current += (Math.floor(phase) % 2 === 0 ? -1 : 1) * Math.PI * 2
    }
    velocity.current.x += ((target.current.x - offset.current.x) * 75 - velocity.current.x * 12) * dt
    velocity.current.y += ((target.current.y - offset.current.y) * 75 - velocity.current.y * 12) * dt
    offset.current.addScaledVector(velocity.current, dt)
    jumpVelocity.current += (-jump.current * 36 - jumpVelocity.current * 5.6) * dt
    jump.current += jumpVelocity.current * dt
    rotationOffset.current = MathUtils.damp(rotationOffset.current, rotationTarget.current, 4.35, dt)
    const intro = MathUtils.smoothstep(t, 0.05 + phase * 0.075, 0.75 + phase * 0.085)
    const scale = MathUtils.damp(object.scale.x, (hovered.current ? 1.13 : 1) * (0.73 + intro * 0.27), 9.1, dt)
    object.scale.setScalar(scale)
    object.position.set(
      position[0] + pointer.current.x * depth + offset.current.x,
      position[1] + Math.sin(t * 1.44 + phase) * 0.095 + pointer.current.y * depth + offset.current.y + jump.current - (1 - intro) * 0.47,
      position[2] + (hovered.current ? 0.17 : 0),
    )
    object.rotation.set(
      rotation[0] + Math.sin(t * 0.87 + phase) * 0.09 - offset.current.y * 0.4,
      rotation[1] + Math.sin(t * 0.67 + phase) * spin + offset.current.x * 0.5 + rotationOffset.current,
      rotation[2] + Math.sin(t * 0.57 + phase) * 0.12,
    )
  })

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(event) => {
        if (reduced || event.pointerType === 'touch') return
        event.stopPropagation()
        hovered.current = true
      }}
      onPointerOut={() => { hovered.current = false }}
      onPointerDown={press}
      onPointerMove={drag}
      onPointerUp={release}
    >
      {children}
    </group>
  )
}

const starOffsets: Point[] = [
  [-2.78, 1.36, 0.6], [-2.73, 0.00, 0.8], [-2.91, -1.56, -0.1], [-2.12, 0.44, -0.2],
  [-1.58, 1.79, -0.3], [-0.90, 1.95, 0], [0.25, 2.06, -0.4], [0.98, 1.83, 0.3],
  [2.57, 1.91, 0.3], [2.90, 0.35, 0.0], [2.84, -1.12, -0.1], [1.8, -1.89, 0.6],
  [0.63, -1.93, 0.2], [-1.46, -1.80, 0.0], [-1.83, -1.47, 0.2], [2.79, 1.04, -0.2],
  [0.08, -2.13, 0.25], [-2.34, 1.75, -0.1], [0.87, -1.68, -0.1], [2.42, 0.36, -0.12],
]

const starColors = [new Color('#dcc4ff'), new Color('#9d80d7'), new Color('#8de2f7')]

function Stars({ pointer, reduced, compact }: { pointer: ScenePointer; reduced: boolean; compact: boolean }) {
  const mesh = useRef<InstancedMesh>(null)
  const transform = useRef(new Object3D())
  const elapsed = useRef(0)
  const count = compact ? 11 : starOffsets.length
  useEffect(() => {
    if (!mesh.current) return
    for (let index = 0; index < count; index += 1) {
      mesh.current.setColorAt(index, starColors[index % starColors.length])
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [count])
  useFrame((_, delta) => {
    if (!mesh.current) return
    if (!reduced) elapsed.current += Math.min(delta, 0.04)
    const t = elapsed.current
    for (let index = 0; index < count; index += 1) {
      const [x, y, z] = starOffsets[index]
      const twinkle = reduced ? 1 : 0.76 + Math.sin(t * 1.6 + index) * 0.30
      const pointerX = pointer.current.x * 2.9
      const pointerY = pointer.current.y * 2.45
      const proximity = Math.max(0, 1 - Math.hypot(x - pointerX, y - pointerY))
      const size = (index % 5 === 0 ? 0.037 : 0.021) * (twinkle + proximity * 0.62)
      transform.current.position.set(x + Math.sin(t * 0.45 + index) * 0.13, y + Math.cos(t * 0.59 + index) * 0.11, z)
      transform.current.scale.setScalar(size)
      transform.current.updateMatrix()
      mesh.current.setMatrixAt(index, transform.current.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} raycast={() => null}>
      <octahedronGeometry />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

const burstItems = [
  { color: violet, position: [-0.6, -1.20, 1.34], velocity: [-1.4, 3.5, 0.03], spin: [1.8, -2.2, 1.1], radius: 0.10 },
  { color: mint, position: [0.02, -1.1, 1.33], velocity: [-0.7, 2.8, 0.31], spin: [-1.9, 2.7, 0.4], radius: 0.085 },
  { color: amber, position: [0.3, -1.13, 1.4], velocity: [0.45, 3.8, -0.31], spin: [2.5, 0.9, -1.4], radius: 0.095 },
  { color: ice, position: [0.62, -1.17, 1.40], velocity: [1.25, 3.25, 0.13], spin: [1.2, -2.5, 1.9], radius: 0.09 },
  { color: '#f390d6', position: [0.19, -1.26, 1.86], velocity: [0.18, 2.95, 0.16], spin: [-2.2, 2.1, 1.2], radius: 0.076 },
] satisfies { color: string; position: Point; velocity: Point; spin: Point; radius: number }[]

function Scatter({ physics }: { physics: PhysicsModule }) {
  const { Physics, RigidBody, BallCollider, CuboidCollider } = physics
  const group = useRef<Group>(null)
  const age = useRef(0)
  useFrame((_, delta) => {
    age.current += Math.min(delta, 0.05)
    const opacity = Math.min(1, age.current * 12, (2.45 - age.current) * 3)
    group.current?.traverse((node) => {
      if ('material' in node && node.material instanceof MeshStandardMaterial) node.material.opacity = Math.max(0, opacity)
    })
  })
  return (
    <Physics colliders={false} gravity={[0, -6.6, 0]} timeStep={1 / 60}>
      <CuboidCollider args={[3, 0.07, 2.25]} position={[0, -1.79, 0.25]} />
      <group ref={group}>
        {burstItems.map((item, index) => (
          <RigidBody key={item.color} position={item.position} linearVelocity={item.velocity} angularVelocity={item.spin} restitution={0.82} linearDamping={0.47}>
            <BallCollider args={[item.radius]} />
            <mesh>
              {index % 2 === 0 ? <icosahedronGeometry args={[item.radius, 0]} /> : <boxGeometry args={[item.radius * 1.68, item.radius * 1.68, item.radius * 1.68]} />}
              <meshStandardMaterial color={item.color} roughness={0.45} metalness={0.19} transparent opacity={0.02} depthWrite={false} />
            </mesh>
          </RigidBody>
        ))}
      </group>
    </Physics>
  )
}

function Framing() {
  const { camera, size } = useThree()
  useEffect(() => {
    if (!(camera instanceof OrthographicCamera) || size.width === 0) return
    const fittedHeight = Math.max(4.78, 5.91 * size.height / size.width)
    camera.zoom = size.height / fittedHeight
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])
  return null
}

function Studio({ pointer, dragSession, reduced, compact, shake, bounce, active }: {
  pointer: ScenePointer
  dragSession: DragSession
  reduced: boolean
  compact: boolean
  shake: number
  bounce: number
  active: boolean
}) {
  const [physics, setPhysics] = useState<PhysicsModule>()
  const [burst, setBurst] = useState(0)
  const playedShake = useRef(0)

  useEffect(() => {
    if (shake === 0 || playedShake.current === shake || reduced || !active) return
    let current = true
    void import('@react-three/rapier').then((module) => {
      if (!current) return
      playedShake.current = shake
      setPhysics(module)
      setBurst(shake)
    }).catch(() => {
      // Individual objects still react if the optional physics engine is unavailable.
    })
    return () => { current = false }
  }, [active, reduced, shake])

  useEffect(() => {
    if (!burst) return
    const stop = window.setTimeout(() => setBurst(0), 2450)
    return () => window.clearTimeout(stop)
  }, [burst])

  const float = { pointer, dragSession, reduced, bounce: bounce + shake }

  return (
    <>
      <Framing />
      <ambientLight intensity={0.81} color="#a88add" />
      <directionalLight position={[-3.9, 5.5, 5.2]} intensity={2.6} color="#f4dfff" />
      <directionalLight position={[4.3, 2.6, -3.2]} intensity={2.15} color="#9777ff" />
      <directionalLight position={[5.1, -2.4, 3.2]} intensity={0.95} color="#77d1ff" />
      <Environment resolution={compact ? 64 : 128} frames={1} environmentIntensity={0.78}>
        <Lightformer form="rect" intensity={4.4} color="#e4b9ff" position={[-3.8, 4.2, 3.8]} target={[0, 0, 0]} scale={[7, 4.2, 1]} />
        <Lightformer form="rect" intensity={4.2} color="#bedfff" position={[4, 1.2, 2.5]} target={[0, 0, 0]} scale={[2.2, 5, 1]} />
        <Lightformer form="ring" intensity={2.1} color="#8d54fc" position={[2.8, 2, -4]} target={[0, 0, 0]} scale={4} />
      </Environment>
      <Stage />
      <Stars pointer={pointer} reduced={reduced} compact={compact} />
      <Workstation pointer={pointer} reduced={reduced} compact={compact} />
      <FloatObject {...float} position={[-2.12, 1.25, 0.4]} rotation={[0.12, -0.28, -0.20]} phase={1.3}><Braces /></FloatObject>
      <FloatObject {...float} position={[1.94, 1.24, 0.7]} rotation={[0.62, -0.48, -0.11]} phase={3.6} depth={0.18}><Torus /></FloatObject>
      <FloatObject {...float} position={[-2.11, -1.04, 0.78]} rotation={[0.40, -0.58, 0.22]} phase={1.8} depth={0.19}><Cube /></FloatObject>
      <FloatObject {...float} position={[2.14, -0.71, 1.1]} rotation={[0.05, -0.16, 0.18]} phase={2.72} depth={0.21}><GlassOrb compact={compact} /></FloatObject>
      <FloatObject {...float} position={[-2.03, 0.21, 1.0]} rotation={[0.16, 0.37, 0.12]} phase={4.25} depth={0.19} spin={0.33}><PythonCharm /></FloatObject>
      {!compact && <FloatObject {...float} position={[1.88, 0.33, 0.18]} rotation={[0.22, -0.22, -0.14]} phase={4.8} depth={0.12}><TerminalTile /></FloatObject>}
      {physics && burst > 0 && active && !reduced && (
        <Suspense fallback={null}>
          <Scatter key={burst} physics={physics} />
        </Suspense>
      )}
    </>
  )
}


class CanvasErrorBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFailure()
  }

  render() {
    return this.state.failed ? <HeroArtwork decorative /> : this.props.children
  }
}

function ContextGuard({ onContextChange }: { onContextChange: (available: boolean) => void }) {
  const canvas = useThree((state) => state.gl.domElement)
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault()
      onContextChange(false)
    }
    const restored = () => onContextChange(true)
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    onContextChange(true)
    return () => {
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
    }
  }, [canvas, onContextChange])
  return null
}

export default function HeroScene({ shake, paused, onAvailabilityChange }: {
  shake: number
  paused?: boolean
  onAvailabilityChange?: (available: boolean) => void
}) {
  const surface = useRef<HTMLDivElement>(null)
  const pointer = useRef(new Vector2())
  const dragSession = useRef<DragSession['current']>(null)
  const [onScreen, setOnScreen] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const [supported, setSupported] = useState<boolean>()
  const [contextReady, setContextReady] = useState<boolean>()
  const [canvasFailed, setCanvasFailed] = useState(false)
  const reportFailure = useCallback(() => setCanvasFailed(true), [])
  const [bounce, setBounce] = useState(0)
  const publishedAvailability = useRef<boolean | undefined>(undefined)
  const prefersReducedMotion = useSceneMedia('(prefers-reduced-motion: reduce)')
  const reduced = paused ?? prefersReducedMotion
  const compact = useSceneMedia('(pointer: coarse), (max-width: 650px)')
  const active = onScreen && visible && contextReady !== false
  const available = supported === false || canvasFailed ? false : contextReady

  useEffect(() => {
    const element = surface.current
    if (!element) return
    const intersection = new IntersectionObserver(([entry]) => {
      setOnScreen(entry.isIntersecting)
    }, { rootMargin: '70px' })
    const visibility = () => setVisible(!document.hidden)
    const cancelPointer = (event: PointerEvent) => {
      if (dragSession.current?.id === event.pointerId) dragSession.current.cancel()
    }
    const cancelOnBlur = () => dragSession.current?.cancel()
    intersection.observe(element)
    document.addEventListener('visibilitychange', visibility)
    element.addEventListener('pointercancel', cancelPointer, true)
    element.addEventListener('lostpointercapture', cancelPointer, true)
    element.addEventListener('pointerup', cancelPointer)
    window.addEventListener('blur', cancelOnBlur)
    return () => {
      intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      element.removeEventListener('pointercancel', cancelPointer, true)
      element.removeEventListener('lostpointercapture', cancelPointer, true)
      element.removeEventListener('pointerup', cancelPointer)
      window.removeEventListener('blur', cancelOnBlur)
      cancelOnBlur()
    }
  }, [])

  useEffect(() => {
    if (reduced || !active) dragSession.current?.cancel()
  }, [active, reduced])

  useEffect(() => {
    if (available === undefined || !onAvailabilityChange || publishedAvailability.current === available) return
    publishedAvailability.current = available
    onAvailabilityChange(available)
  }, [available, onAvailabilityChange])

  useEffect(() => {
    if (!onScreen || supported !== undefined) return
    const probe = document.createElement('canvas')
    const context = probe.getContext('webgl2')
    setSupported(Boolean(context))
    context?.getExtension('WEBGL_lose_context')?.loseContext()
  }, [onScreen, supported])

  function recordPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (compact || reduced || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointer.current.set(
      (event.clientX - bounds.left) * 2 / bounds.width - 1,
      1 - (event.clientY - bounds.top) * 2 / bounds.height,
    )
  }

  return (
    <div
      ref={surface}
      className="hero-webgl"
      onPointerMove={recordPointer}
      onPointerLeave={() => pointer.current.set(0, 0)}
    >
      <div className="hero-webgl-art" role="img" aria-label={heroArtworkDescription}>
        {supported && !canvasFailed && (
          <CanvasErrorBoundary onFailure={reportFailure}>
            <Canvas
              orthographic
              camera={{ position: [0, 0, 12], near: 0.1, far: 50 }}
              dpr={[1, compact ? 1.1 : 1.5]}
              gl={{ alpha: true, antialias: !compact, powerPreference: compact ? 'low-power' : 'high-performance' }}
              frameloop={active && !reduced ? 'always' : 'demand'}
              fallback={<HeroArtwork decorative />}
              style={{ touchAction: 'pan-y', visibility: contextReady === false ? 'hidden' : undefined }}
            >
              <ContextGuard onContextChange={setContextReady} />
              <Studio pointer={pointer} dragSession={dragSession} reduced={reduced} compact={compact} shake={shake} bounce={bounce} active={active} />
            </Canvas>
          </CanvasErrorBoundary>
        )}
        {available !== true && <HeroArtwork key={shake} decorative animate={shake > 0 && !reduced} />}
      </div>
      {!reduced && available && (
        <button type="button" className="hero-scene-key-action" onClick={() => setBounce((count) => count + 1)}>
          Bounce the floating shapes
        </button>
      )}
    </div>
  )
}
