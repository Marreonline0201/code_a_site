"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave1 = sin(pos.x * 0.3 + uTime * 0.8) * 0.6;
    float wave2 = sin(pos.y * 0.5 + uTime * 1.2) * 0.4;
    float wave3 = sin((pos.x + pos.y) * 0.2 + uTime * 0.6) * 0.3;
    float wave4 = sin(pos.x * 1.0 + pos.y * 0.8 + uTime * 1.5) * 0.15;

    pos.z = wave1 + wave2 + wave3 + wave4;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeepColor;
  uniform vec3 uSurfaceColor;
  uniform vec3 uFoamColor;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixStrength = (vElevation + 1.0) * 0.5;
    mixStrength = clamp(mixStrength, 0.0, 1.0);

    vec3 color = mix(uDeepColor, uSurfaceColor, mixStrength);

    // Foam on crests
    float foam = smoothstep(0.6, 1.0, mixStrength);
    color = mix(color, uFoamColor, foam * 0.4);

    // Subtle specular
    float spec = pow(mixStrength, 4.0) * 0.3;
    color += vec3(spec);

    gl_FragColor = vec4(color, 0.92);
  }
`;

function OceanMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color("#001e33") },
      uSurfaceColor: { value: new THREE.Color("#0a6e8a") },
      uFoamColor: { value: new THREE.Color("#b8e4f0") },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1, 0]}
    >
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function OceanScene() {
  return (
    <>
      <Sky
        sunPosition={[100, 20, 100]}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <OceanMesh />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <fog attach="fog" args={["#87ceeb", 50, 200]} />
    </>
  );
}

export default function OceanHero() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <OceanScene />
      </Canvas>
    </div>
  );
}
