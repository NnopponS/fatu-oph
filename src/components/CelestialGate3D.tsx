import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/anime";

export interface CelestialGate3DProps {
  /** Size in pixels (width & height). Defaults to 240 */
  size?: number;
  /** Visual display mode */
  mode?: "gate" | "pearl" | "halo";
  /** Whether the user can drag to rotate in 3D */
  interactive?: boolean;
  /** Whether to show swirling stardust particles */
  showParticles?: boolean;
  /** Optional custom CSS class */
  className?: string;
  /** Optional style override */
  style?: React.CSSProperties;
}

/**
 * CelestialGate3D (ประตูสวรรค์และมุกมังกร 3 มิติ)
 *
 * High-performance mobile-first 3D Chinese Mythology WebGL scene using Three.js.
 * Renders an ancient celestial astrolabe (浑天仪), 8-trigram Bagua rings,
 * glowing Dragon Pearl core, and ethereal Qi vortex particles.
 *
 * Performance features:
 * - Pure procedural geometries (0 external mesh downloads)
 * - Device pixel ratio capped at 2 to prevent GPU thermal throttling on mobile
 * - Auto-pauses render loop when scrolled offscreen (IntersectionObserver)
 * - Full memory disposal (geometries, materials, renderer context) on unmount
 * - Graceful fallback when WebGL is unsupported or reduced motion is preferred
 */
export const CelestialGate3D: React.FC<CelestialGate3DProps> = ({
  size = 240,
  mode = "gate",
  interactive = true,
  showParticles = true,
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = mode === "pearl" ? 3.8 : 4.6;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfef08a, 2.0);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    dirLight2.position.set(-4, -3, -2);
    scene.add(dirLight2);

    const corePointLight = new THREE.PointLight(0xf59e0b, 3.5, 6);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // 3. Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
    });

    const vermilionMaterial = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      metalness: 0.6,
      roughness: 0.35,
      emissive: 0x450a0a,
      emissiveIntensity: 0.3,
    });

    const jadeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x042f2e,
      emissiveIntensity: 0.2,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    // 4. Geometries & Hierarchical Assemblies
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Disposable resources tracker
    const disposables: { dispose: () => void }[] = [
      goldMaterial,
      vermilionMaterial,
      jadeMaterial,
      wireframeMaterial,
    ];

    // A. Glowing Dragon Pearl Core
    const coreGeom = new THREE.IcosahedronGeometry(mode === "pearl" ? 0.8 : 0.52, 2);
    const coreMesh = new THREE.Mesh(coreGeom, goldMaterial);
    mainGroup.add(coreMesh);
    disposables.push(coreGeom);

    const wireGeom = new THREE.IcosahedronGeometry(mode === "pearl" ? 0.98 : 0.68, 1);
    const wireMesh = new THREE.Mesh(wireGeom, wireframeMaterial);
    mainGroup.add(wireMesh);
    disposables.push(wireGeom);

    // B. Celestial Concentric Astrolabe Rings (浑天仪)
    const ring1Geom = new THREE.TorusGeometry(1.15, 0.035, 16, 64);
    const ring1 = new THREE.Mesh(ring1Geom, goldMaterial);
    mainGroup.add(ring1);
    disposables.push(ring1Geom);

    const ring2Geom = new THREE.TorusGeometry(1.6, 0.045, 16, 72);
    const ring2 = new THREE.Mesh(ring2Geom, vermilionMaterial);
    mainGroup.add(ring2);
    disposables.push(ring2Geom);

    let ring3: THREE.Mesh | null = null;
    if (mode === "gate" || mode === "halo") {
      const ring3Geom = new THREE.TorusGeometry(2.05, 0.03, 16, 80);
      ring3 = new THREE.Mesh(ring3Geom, jadeMaterial);
      mainGroup.add(ring3);
      disposables.push(ring3Geom);
    }

    // C. 8 Trigram Markers (Bagua Notches) on Ring 2
    const notchGeom = new THREE.OctahedronGeometry(0.08, 0);
    disposables.push(notchGeom);
    const baguaGroup = new THREE.Group();
    ring2.add(baguaGroup);

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const notch = new THREE.Mesh(notchGeom, goldMaterial);
      notch.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0);
      notch.rotation.z = angle;
      baguaGroup.add(notch);
    }

    // D. Swirling Qi Stardust Vortex (Particle cloud)
    let particleSystem: THREE.Points | null = null;
    if (showParticles) {
      const particleCount = mode === "pearl" ? 400 : 750;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorPalette = [
        new THREE.Color(0xf59e0b), // Gold
        new THREE.Color(0xfde047), // Bright Yellow
        new THREE.Color(0xef4444), // Vermilion Red
        new THREE.Color(0x06b6d4), // Cyan/Azure
      ];

      for (let i = 0; i < particleCount; i++) {
        const radius = 0.5 + Math.random() * 2.1;
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 0.75;

        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(theta) * radius;

        const pickedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = pickedColor.r;
        colors[i * 3 + 1] = pickedColor.g;
        colors[i * 3 + 2] = pickedColor.b;
      }

      const particleGeom = new THREE.BufferGeometry();
      particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particleGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      disposables.push(particleGeom);

      const particleMat = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(particleMat);

      particleSystem = new THREE.Points(particleGeom, particleMat);
      scene.add(particleSystem);
    }

    // 5. Interactive Touch / Drag Physics
    let targetRotationX = 0.25;
    let targetRotationY = 0;
    let currentRotationX = 0.25;
    let currentRotationY = 0;

    let pointerDown = false;
    let startX = 0;
    let startY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      pointerDown = true;
      setIsInteracting(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive || !pointerDown) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      startX = clientX;
      startY = clientY;
    };

    const handlePointerUp = () => {
      pointerDown = false;
      setIsInteracting(false);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    domElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);

    // 6. Animation loop & Visibility Caching
    let animId: number = 0;
    const clock = new THREE.Clock();
    let isVisible = true;

    // Pause rendering when offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animateLoop = () => {
      animId = requestAnimationFrame(animateLoop);
      if (!isVisible || document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Smooth damp rotation to target
      if (!pointerDown) {
        targetRotationY += 0.007; // Constant celestial orbit
      }
      currentRotationX += (targetRotationX - currentRotationX) * 0.06;
      currentRotationY += (targetRotationY - currentRotationY) * 0.06;

      mainGroup.rotation.x = currentRotationX;
      mainGroup.rotation.y = currentRotationY;

      // Independent multi-axis ring rotation
      ring1.rotation.x = elapsed * 0.6;
      ring1.rotation.y = elapsed * 0.3;

      ring2.rotation.y = -elapsed * 0.45;
      ring2.rotation.z = elapsed * 0.2;

      if (ring3) {
        ring3.rotation.x = elapsed * 0.35;
        ring3.rotation.z = -elapsed * 0.5;
      }

      // Breathing Dragon Pearl pulse
      const pulse = 1 + Math.sin(elapsed * 2.4) * 0.05;
      coreMesh.scale.set(pulse, pulse, pulse);
      wireMesh.rotation.y = -elapsed * 0.8;
      wireMesh.rotation.x = elapsed * 0.4;

      // Swirling Stardust orbit
      if (particleSystem) {
        particleSystem.rotation.y = elapsed * 0.12;
      }

      renderer?.render(scene, camera);
    };

    animateLoop();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();

      domElement.removeEventListener("mousedown", handlePointerDown);
      domElement.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);

      disposables.forEach((item) => item.dispose());

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [size, mode, interactive, showParticles]);

  if (!hasWebGL) {
    // Graceful fallback for non-WebGL devices
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          margin: "0 auto",
          ...style,
        }}
      >
        <img
          src="/images/azure-dragon-art.jpg"
          alt="Celestial Gate"
          style={{
            width: "85%",
            height: "85%",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid var(--color-gold-400)",
            boxShadow: "0 4px 18px rgba(179, 134, 40, 0.4)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`celestial-gate-3d-root ${className}`}
      style={{
        width: size,
        height: size,
        margin: "0 auto",
        position: "relative",
        cursor: interactive ? (isInteracting ? "grabbing" : "grab") : "default",
        userSelect: "none",
        touchAction: "none",
        ...style,
      }}
      title={interactive ? "แตะหรือลากเพื่อหมุนประตูสวรรค์ 3 มิติ" : undefined}
    >
      {/* Subtle Hint indicator when interactive */}
      {interactive && (
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--color-gold-600)",
            opacity: isInteracting ? 0.2 : 0.8,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
            letterSpacing: "0.04em",
          }}
        >
          {mode === "pearl" ? "✦ สัมผัสเพื่อหมุนมุกมังกร 3D ✦" : "✦ สัมผัสเพื่อหมุนประตู 3D ✦"}
        </div>
      )}
    </div>
  );
};
