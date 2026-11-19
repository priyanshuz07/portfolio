import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Group, MathUtils, MeshPhysicalMaterial, SphereGeometry } from 'three';

export interface ToyInput {
  x: number;
  y: number;
  isOver: boolean;
  dragX: number;
  dragY: number;
  dragging: boolean;
  jumps: number;
}

interface SceneProps {
  active: boolean;
  calm: boolean;
  color: string;
  input: RefObject<ToyInput>;
  wake: RefObject<(() => void) | null>;
  onReady: (ready: boolean) => void;
}

function Blob({ active, calm, color, input, wake, onReady }: SceneProps) {
  const figure = useRef<Group>(null);
  const body = useRef<MeshPhysicalMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const canvas = useThree((state) => state.gl.domElement);
  const physics = useRef({ seenJumps: 0, height: 0, speed: 0, time: 0 });

  const geometry = useMemo(() => {
    const shape = new SphereGeometry(0.91, 30, 21);
    const points = shape.attributes.position;
    for (let i = 0; i < points.count; i += 1) {
      const x = points.getX(i);
      const y = points.getY(i);
      const z = points.getZ(i);
      const wobble = 1 + 0.05 * Math.sin(x * 4.3 + z * 3.4) * Math.sin(y * 4.1 + 0.7);
      points.setXYZ(i, x * 1.12 * wobble, y * 0.94 * wobble - 0.055 * x, z * wobble);
    }
    points.needsUpdate = true;
    shape.computeVertexNormals();
    return shape;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    wake.current = invalidate;
    onReady(true);
    const loseContext = () => onReady(false);
    const restoreContext = () => {
      onReady(true);
      invalidate();
    };
    canvas.addEventListener('webglcontextlost', loseContext);
    canvas.addEventListener('webglcontextrestored', restoreContext);
    return () => {
      if (wake.current === invalidate) wake.current = null;
      canvas.removeEventListener('webglcontextlost', loseContext);
      canvas.removeEventListener('webglcontextrestored', restoreContext);
      onReady(false);
    };
  }, [canvas, invalidate, onReady, wake]);

  useEffect(() => {
    body.current?.color.set(color);
    invalidate();
  }, [color, invalidate]);

  useEffect(() => {
    if (active) invalidate();
  }, [active, calm, invalidate]);

  useFrame((_, frameDelta) => {
    const object = figure.current;
    if (!object || !active) return;
    const delta = Math.min(frameDelta, 1 / 30);
    const pointer = input.current;
    const spring = physics.current;

    if (calm) {
      spring.seenJumps = pointer.jumps;
      spring.height = 0;
      spring.speed = 0;
      object.rotation.set(0.04, -0.15, -0.1);
      object.position.set(0, 0, 0);
      object.scale.setScalar(1);
      return;
    }

    if (pointer.jumps !== spring.seenJumps) {
      spring.seenJumps = pointer.jumps;
      spring.speed = 5.25;
    }

    spring.speed += (-spring.height * 50 - spring.speed * 7) * delta;
    spring.height += spring.speed * delta;

    const isSettling = Math.abs(spring.height) + Math.abs(spring.speed) > 0.003;
    if (!isSettling) {
      spring.height = 0;
      spring.speed = 0;
    }

    if (pointer.isOver) spring.time += delta;
    const wobble = pointer.isOver ? Math.sin(spring.time * 8) * 0.046 : 0;
    const targetX = 0.04 + pointer.dragX + pointer.y * 0.24;
    const targetY = -0.15 + pointer.dragY + pointer.x * 0.43;
    object.rotation.x = MathUtils.damp(object.rotation.x, targetX, 10, delta);
    object.rotation.y = MathUtils.damp(object.rotation.y, targetY, 10, delta);
    object.rotation.z = MathUtils.damp(object.rotation.z, -0.1 + wobble, 8, delta);
    object.position.y = spring.height;
    const squash = Math.max(-0.16, Math.min(0.15, spring.speed * 0.032));
    object.scale.set(1 - squash * 0.44, 1 + squash, 1 - squash * 0.44);

    const isTurning = Math.abs(object.rotation.x - targetX) + Math.abs(object.rotation.y - targetY)
      + Math.abs(object.rotation.z + 0.1) > 0.002;
    if (isSettling || isTurning || pointer.isOver || pointer.dragging) invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#ded8ff', '#322256', 2.0]} />
      <directionalLight position={[-4, 5, 5]} intensity={3.1} color="#f7e9ff" />
      <directionalLight position={[4, 0.5, -3]} intensity={2.8} color="#67cfff" />
      <directionalLight position={[1, -2, 3]} intensity={0.75} color="#cab1ff" />
      <group ref={figure} rotation={[0.04, -0.15, -0.1]}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial ref={body} color={color} roughness={0.29} metalness={0.18}
            clearcoat={0.55} clearcoatRoughness={0.32} />
        </mesh>
        <group position={[0.025, 0.04, 0.859]}>
          {[-0.25, 0.25].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh scale={[0.083, 0.129, 0.047]}>
                <sphereGeometry args={[1, 12, 9]} />
                <meshStandardMaterial color="#161028" roughness={0.47} />
              </mesh>
              <mesh position={[-0.018, 0.045, 0.042]} scale={[0.022, 0.029, 0.012]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial color="#fff2ff" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.159, 0.019]} rotation={[0, 0, 0.12]} scale={[0.087, 0.04, 0.032]}>
            <sphereGeometry args={[1, 12, 9]} />
            <meshStandardMaterial color="#36204b" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function ToyScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.3]}
      camera={{ fov: 35, position: [0, 0.14, 4.25] }}
      frameloop={props.active ? 'demand' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    >
      <Blob {...props} />
    </Canvas>
  );
}
