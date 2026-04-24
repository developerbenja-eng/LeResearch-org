'use client';

import React, { useRef, useState, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, useGLTF, useProgress, Center } from '@react-three/drei';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import {
  SYSTEM_METADATA,
  ANATOMY_MODEL_URLS,
  SYSTEM_TO_MODEL,
  type AnatomyStructure,
  type BodySystem,
  type AnatomyModelKey
} from '@/types/anatomy';

// Configure Draco decoder path (Google CDN)
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

// Set up global Draco loader for useGLTF
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.setDecoderPath(DRACO_DECODER_PATH);

interface AnatomyCanvasProps {
  structures: AnatomyStructure[];
  selectedStructure: AnatomyStructure | null;
  onSelectStructure: (structure: AnatomyStructure | null) => void;
  visibleSystems: Record<BodySystem, boolean>;
}

// Loading indicator component
function LoadingProgress() {
  const { progress, active, item } = useProgress();

  if (!active) return null;

  // Extract filename from URL for display
  const filename = item ? item.split('/').pop() : 'model';

  return (
    <Html center>
      <div className="bg-slate-900/95 backdrop-blur-sm px-6 py-4 rounded-xl border border-slate-700 text-center min-w-[250px]">
        <div className="text-sm text-slate-400 mb-2">Loading {filename}</div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-lg font-bold text-blue-400">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
}

// Default material colors per model key (fallback when KHR_materials_pbrSpecularGlossiness is unsupported)
const MODEL_FALLBACK_COLORS: Record<AnatomyModelKey, number> = {
  myology: 0xcc4444,            // Red for muscles
  angiology: 0xdd3333,          // Dark red for blood vessels
  neurology: 0xeebb33,          // Yellow for nerves
  muscular_insertions: 0xcc6655, // Pinkish-red for attachments
  splanchnology: 0xbb66aa,      // Purple for organs
  arthrology: 0xccccbb,         // Off-white for joints/ligaments
};

// Component to load and render a single GLB model
function AnatomyModel({
  modelKey,
  visible,
  opacity = 1,
}: {
  modelKey: AnatomyModelKey;
  visible: boolean;
  opacity?: number;
}) {
  const url = ANATOMY_MODEL_URLS[modelKey];
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Memoize the cloned scene to avoid creating a new clone on every render
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const fallbackColor = MODEL_FALLBACK_COLORS[modelKey];

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Fix materials that failed to load due to unsupported KHR_materials_pbrSpecularGlossiness
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          // Check if the material is a blank default (white with no maps) — sign of missing extension
          const isDefaultMaterial = mat.color &&
            mat.color.r === 1 && mat.color.g === 1 && mat.color.b === 1 &&
            !mat.map && !mat.normalMap;

          if (isDefaultMaterial) {
            child.material = new THREE.MeshStandardMaterial({
              color: fallbackColor,
              roughness: 0.6,
              metalness: 0.1,
              side: THREE.DoubleSide,
            });
          }
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: fallbackColor,
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide,
          });
        }
      }
    });
    return clone;
  }, [scene, modelKey]);

  // Handle opacity changes separately
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.transparent = opacity < 1;
        mat.opacity = opacity;
        mat.needsUpdate = true;
      }
    });
  }, [clonedScene, opacity]);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Wrapper to handle model loading errors gracefully
function SafeModelLoader({
  modelKey,
  visible,
  opacity,
}: {
  modelKey: AnatomyModelKey;
  visible: boolean;
  opacity?: number;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Html center>
        <div className="bg-red-900/80 px-3 py-2 rounded text-sm text-red-200">
          Failed to load {modelKey}
        </div>
      </Html>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <AnatomyModel modelKey={modelKey} visible={visible} opacity={opacity} />
    </ErrorBoundary>
  );
}

// Simple error boundary for 3D components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Camera controller for smooth movements
function CameraController({ target }: { target: THREE.Vector3 }) {
  const { camera } = useThree();

  useFrame(() => {
    // Smoothly interpolate camera look-at target
    camera.lookAt(target);
  });

  return null;
}

// Main scene component
function Scene({
  structures,
  selectedStructure,
  onSelectStructure,
  visibleSystems,
}: AnatomyCanvasProps) {
  const [loadedModels, setLoadedModels] = useState<Set<AnatomyModelKey>>(new Set());

  // Determine which models to load based on visible systems
  const modelsToLoad = new Set<AnatomyModelKey>();
  Object.entries(visibleSystems).forEach(([system, isVisible]) => {
    if (isVisible) {
      const modelKey = SYSTEM_TO_MODEL[system as BodySystem];
      if (modelKey) {
        modelsToLoad.add(modelKey);
      }
    }
  });

  // Center target for camera
  const centerTarget = new THREE.Vector3(0, 0, 0);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#60a5fa" />

      {/* Hemisphere light for natural ambient */}
      <hemisphereLight
        color="#ffffff"
        groundColor="#444444"
        intensity={0.4}
      />

      {/* Camera controller */}
      <CameraController target={centerTarget} />

      {/* Orbit controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={50}
        autoRotate={!selectedStructure}
        autoRotateSpeed={0.3}
        target={centerTarget}
      />

      {/* Loading progress indicator */}
      <LoadingProgress />

      {/* Load models based on visible systems */}
      <Center>
        <group scale={[0.01, 0.01, 0.01]}> {/* Scale down since Z-Anatomy models are large */}
          {Array.from(modelsToLoad).map((modelKey) => (
            <Suspense key={modelKey} fallback={null}>
              <SafeModelLoader
                modelKey={modelKey}
                visible={true}
                opacity={0.9}
              />
            </Suspense>
          ))}
        </group>
      </Center>

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}

export default function AnatomyCanvas(props: AnatomyCanvasProps) {
  return (
    <Canvas
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      shadows
    >
      <PerspectiveCamera makeDefault position={[3, 2, 3]} fov={50} near={0.01} far={500} />
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 15, 50]} />
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

// Preload models for faster loading (optional - call from parent component)
export function preloadAnatomyModels(modelKeys: AnatomyModelKey[]) {
  modelKeys.forEach((key) => {
    useGLTF.preload(ANATOMY_MODEL_URLS[key]);
  });
}
