# FATU Open House 2026 — Motion & Animation Architecture (Anime.js v4)

This document serves as the **Animation & Motion System Handoff** for engineers and AI agents continuing work on the FATU Open House 2026 web application.

---

## 1. Engine & Version Standard

- **Engine**: [Anime.js v4](https://animejs.com/documentation/getting-started) (`v4.5.0` installed in `package.json`).
- **Official Documentation**: [https://animejs.com/documentation/getting-started](https://animejs.com/documentation/getting-started)
- **Central Utility Module**: [`src/lib/anime.ts`](file:///D:/Project/fatu-openhouse/src/lib/anime.ts)

### Why Anime.js v4?
1. **Lightweight & High-Performance**: Operates directly on the DOM or CSS variables with minimal memory footprint and zero React render bloat.
2. **First-Class Scoping (`createScope`)**: Anime.js v4 introduces scoped animations bound to a specific component subtree via `{ root: element }`, completely avoiding cross-component selector collisions.
3. **Automatic Revert & Cleanup (`scope.revert()`)**: When React components unmount or route changes occur, all running RAF loops, transforms, and inline styles are cleanly reverted.
4. **Native TypeScript**: Ships with first-party `.d.ts` definitions.

---

## 2. Core Architecture & Hooks

### A. `useAnimeScope(initFn, deps)`
Located in [`src/lib/anime.ts`](file:///D:/Project/fatu-openhouse/src/lib/anime.ts).
Encapsulates React's `useEffect` lifecycle with Anime.js's `createScope({ root })`.

```tsx
import React from "react";
import { useAnimeScope, animate, MOTION_TOKENS } from "@/lib/anime";

export const MyComponent: React.FC = () => {
  const { rootRef } = useAnimeScope((self) => {
    // Selectors are automatically scoped to rootRef.current!
    animate(".my-card", {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: MOTION_TOKENS.durations.standard,
      ease: MOTION_TOKENS.easings.celestialOut,
    });
  }, []);

  return (
    <div ref={rootRef}>
      <div className="my-card">Celestial Content</div>
    </div>
  );
};
```

### B. Accessibility & `prefers-reduced-motion`
All animations strictly respect the user's OS / browser reduced motion preference:
- `prefersReducedMotion()` is checked automatically inside `useAnimeScope` and `PageTransition`.
- If reduced motion is requested, all transforms and continuous RAF loops are bypassed to protect users with vestibular conditions.

---

## 3. Thematic Motion Tokens ([`src/lib/anime.ts`](file:///D:/Project/fatu-openhouse/src/lib/anime.ts))

| Token Name | Value / Spec | Appropriate Use Case |
| :--- | :--- | :--- |
| `durations.instant` | `150ms` | Button active press, checkbox / toggle feedback |
| `durations.fast` | `300ms` | Tooltips, badge reveals, small modal entrances |
| `durations.standard` | `500ms` | Page transitions, card reveals, drawer slides |
| `durations.deliberate`| `800ms` | Opening experience, prize voucher reveal |
| `durations.ambient` | `2400ms` | Breathing dragon seals, aura glowing pulses |
| `easings.celestialOut`| `'out(3)'` | Smooth deceleration for entrances |
| `easings.celestialInOut`| `'inOut(3)'` | Organic bidirectional motion (clouds, mist) |
| `easings.imperialSpring`| `spring({ bounce: 0.35 })` | Hero cards, emblem pops |
| `easings.bouncySeal` | `spring({ bounce: 0.55 })` | Seal stamp impressions, claim rewards |
| `easings.gentleFloat`| `'inOut(2)'` | Floating beast avatars, floating badges |

---

## 4. Implemented Animation Systems

### 1. Themed Loading Screen ([`ThemedLoading.tsx`](file:///D:/Project/fatu-openhouse/src/components/ThemedLoading.tsx))
- **Continuous Majestic Rotation**: The sacred dragon seal rotates slowly (`rotate: 360`, `duration: 12000`, `ease: 'linear'`).
- **Breathing Seal Scale**: Inner seal expands and contracts (`scale: [0.92, 1.05, 0.92]`, `inOut(2)`).
- **Golden Halo Ring Pulse**: Outer celestial aura breathes with opacity and scale.
- **Staggered Celestial Pearls**: 3 Taoist dots (Gold, Vermilion, Jade) bounce with wave stagger (`stagger(140)`).
- **Calligraphy Shimmer**: Message text pulses gently.

### 2. Route Page Transition ([`PageTransition.tsx`](file:///D:/Project/fatu-openhouse/src/components/PageTransition.tsx))
- Integrated inside [`AppShell.tsx`](file:///D:/Project/fatu-openhouse/src/components/AppShell.tsx) around `<Outlet />`.
- Listens to `location.pathname` changes.
- Automatically resets scroll to top.
- Animates container with `translateY: [14, 0]`, `opacity: [0.01, 1]` (`380ms`, `out(3)`).
- Staggers child `.ivory-card` and `.card-mythology` elements for a fluid app-like feel.

### 3. Sacred Realm Seal Stamp ([`AnimatedMythology.tsx`](file:///D:/Project/fatu-openhouse/src/components/AnimatedMythology.tsx))
- Component: `<AnimatedSealStamp />`.
- Used in [`PassPage.tsx`](file:///D:/Project/fatu-openhouse/src/pages/PassPage.tsx) for the 4 Sacred Realm Seals matrix.
- Simulates an authentic cinnabar ink impression:
  1. Seal strikes down with spring gravity (`scale: [2.0, 1]`, `rotate: [-15, 0]`, `spring({ bounce: 0.45 })`).
  2. Shockwave ripple expands outward from the stamp center (`scale: [1, 1.7]`, `opacity: [0.75, 0]`).
  3. Inner mythical creature emblem settles with subtle rebound.

### 4. Floating Celestial Aura ([`AnimatedMythology.tsx`](file:///D:/Project/fatu-openhouse/src/components/AnimatedMythology.tsx))
- Component: `<FloatingMythologyAura />`.
- Used in [`HomePage.tsx`](file:///D:/Project/fatu-openhouse/src/pages/HomePage.tsx) on the Azure Dragon hero portrait.
- Floating vertical drift (`translateY: [-5, 5]`, `alternate: true`, `loop: true`).

---

## 5. How Future Agents Should Extend This System

When adding animations to new or existing pages (e.g., Lucky Draw chest rattle, Survey submit confetti, or Admin dashboards):

### Rule 1: Always use `useAnimeScope`
Do not call `animate()` directly inside raw event handlers or unmounted `useEffect`s without a scope. Always use `useAnimeScope` or `createScope` so animations are automatically cleaned up when navigating away.

```tsx
// ✅ Correct Pattern
const { rootRef } = useAnimeScope((self) => {
  animate('.my-button', { scale: [0.95, 1], ease: 'out(3)' });
});
return <div ref={rootRef}><button className="my-button">Click</button></div>;

// ❌ Incorrect Pattern (Leads to stray animations across pages)
useEffect(() => {
  animate('.my-button', { ... }); // Missing root scope!
}, []);
```

### Rule 2: Register Dynamic Methods inside the Scope
If you need to trigger an animation on user interaction (like clicking a button or receiving a QR scan):
```tsx
const { rootRef, scopeRef } = useAnimeScope((self) => {
  // Register named method
  self.add('shakeChest', () => {
    animate('.mystery-chest', {
      rotate: [-5, 5, -3, 3, 0],
      duration: 500,
      ease: 'inOut(2)',
    });
  });
});

// Trigger in event handler:
const onChestClick = () => {
  scopeRef.current?.methods.shakeChest();
};
```

### Rule 4: Always use `safeAnimate` to Prevent "No target found" Errors
Anime.js v4 throws a console error (`No target found`) if a selector query yields zero DOM elements. Always use `safeAnimate` from `@/lib/anime` or verify target element existence before animating:

```tsx
// ✅ Correct Pattern
safeAnimate('.optional-card', { opacity: [0, 1] }, rootRef.current);

// ❌ Risky Pattern (Triggers console error if .optional-card is not mounted yet)
animate('.optional-card', { opacity: [0, 1] });
```

---

## 6. Roleplay Story Prologue & Ambient Atmosphere

### A. Roleplay Opening Story Experience ([`OpeningExperience.tsx`](file:///D:/Project/fatu-openhouse/src/components/OpeningExperience.tsx))
An interactive, gamified 4-act prologue where visitors adopt an apprentice martial artist persona ("สวมบทบาทจอมยุทธ์ผู้มาเยือน") and are excitingly briefed on the FATU Open House 2026 rules:
1. **Act 0 (The Awakening - เสียงเรียกแห่งยุทธภพศิลป์)**:
   - Mysterious summon of the visitor into the mythological world of fine arts.
   - Interactive call-to-action: *"แตะฝ่ามือเพื่อปลุกพลังปราณมังกร! (Touch to Awaken)"* with Anime.js radial pulse ripple and 3D celestial astrolabe awakening.
2. **Act 1 (Choose Affinity - สถิตแดนแห่งโชคชะตา)**:
   - Interactive choice among the 4 departments/realms: Theatre (ละคร), Faculty Bldg (ศิลปะ), Weaving (สิ่งทอ), and SC3 (ดนตรี).
   - Tapping any realm smoothly animates the Three.js camera (`focusRealm`) to fly toward that specific realm's 3D totem and gate.
   - Visitor is bestowed with their unique persona title (*จอมยุทธ์สะกดเวที, จอมยุทธ์พู่กันทอง, จอมเวทพัสตราภรณ์, จอมทัพประกายไฟ*) and affinity is persisted in `sessionStorage`.
3. **Act 2 (Mission Rules Briefing - บรีฟกฎแห่งยุทธภพ)**:
   - Gamified briefing on the 3 core rules:
     - 1. เดินสำรวจสถานที่จริง & สแกนรับแต้มด้วยตนเอง (Walk to real venues & self-scan QR).
     - 2. หมุนกล่องสุ่มปริศนาได้ 1 ครั้ง (Spin the 3D Mystery Box once).
     - 3. นำใบเบิกทางมาแลกรับของรางวัลที่ซุ้มกลาง (Redeem physical prizes at central booth).
   - Features an interactive rotating 3D Mystery Treasure Box chest in Three.js.
4. **Act 3 (Travel Pass Ceremony - สลักนามสู่ใบเบิกทางจอมยุทธ์)**:
   - Inscription of the official *"ใบเบิกทางจอมยุทธ์ (通关文牒)"* displaying the visitor's chosen persona and starting realm.
   - Interactive vermilion seal stamp animation (`<AnimatedSealStamp />`) sealing their journey.
   - On completion, smoothly transitions to the homepage with a personalized realm guide badge in the hero banner.
- Replay: Can be replayed at any time via `window.dispatchEvent(new CustomEvent("replay_story_intro"))` (triggered from the hero button on `HomePage.tsx`).

### B. Celestial Dust Canvas ([`CelestialDust.tsx`](file:///D:/Project/fatu-openhouse/src/components/CelestialDust.tsx))
- Ambient golden stardust floating gently upward with subtle sine-wave sway.
- Lightweight 2D canvas with `pointer-events: none` and full `prefersReducedMotion()` compliance.

---

## 7. Three.js WebGL 3D Chinese Mythology Architecture

To elevate mythological grandeur ("ความอลังการ") while strictly preserving mobile 60fps performance and zero asset bloat, the application features two procedural Three.js WebGL components:

### A. Mythic Realm Spatial Scene: [`MythicRealmScene3D.tsx`](file:///D:/Project/fatu-openhouse/src/components/MythicRealmScene3D.tsx)

```tsx
import { MythicRealmScene3D, RealmId } from "@/components/MythicRealmScene3D";

<MythicRealmScene3D
  stage={currentAct}                  // 0 (Awakening), 1 (Affinity), 2 (Rules), 3 (Pass)
  focusRealm={selectedRealmId}        // 'theatre' | 'faculty' | 'weaving' | 'sc3' | null
  interactive={true}
  height={280}
/>
```

#### Cardinal 3D Mapping of Actual Venues:
- **North (0, 0, -4.5)**: Azure Dragon Totem & Theatre Gate (`theatre` — cyan/sky accents).
- **West (-4.5, 0, 0)**: White Tiger Totem & Faculty Building Gate (`faculty` — amber/gold accents).
- **South (0, 0, 4.5)**: Nine-Tailed Fox Totem & Weaving Building Gate (`weaving` — magenta/pink accents).
- **East (4.5, 0, 0)**: Red Phoenix Totem & SC3 Building Gate (`sc3` — crimson/flame accents).
- **Center (0, 0, 0)**: Celestial Daotai Altar with concentric armillary rings and an interactive 3D Mystery Chest (shown in Act 2).

#### Dynamic Camera Transitions:
- When a user taps a realm card in Act 1, the camera smoothly swoops to target coordinates via cubic easing:
  `cameraTargetPos.set(realm.camOffset.x, realm.camOffset.y, realm.camOffset.z)`.

---

### B. Celestial Astrolabe Gate & Dragon Pearl: [`CelestialGate3D.tsx`](file:///D:/Project/fatu-openhouse/src/components/CelestialGate3D.tsx)

```tsx
import { CelestialGate3D } from "@/components/CelestialGate3D";

// Full Astrolabe Gate (used in Home Hero, About Page)
<CelestialGate3D size={180} mode="gate" interactive={true} showParticles={true} />

// Dragon Pearl Core (used in Pass Page Identity)
<CelestialGate3D size={130} mode="pearl" interactive={true} showParticles={true} />
```

### C. Procedural Geometry Hierarchy (0 External Mesh Downloads)
Instead of forcing mobile devices to download 20MB-50MB `.gltf` 3D files over cellular data, all geometry is procedurally generated at runtime:
1. **Dragon Pearl Core**: `THREE.IcosahedronGeometry` with metallic gold `MeshStandardMaterial` (metalness: 0.85, roughness: 0.25, emissive intensity: 0.25) and an outer wireframe cage (`THREE.MeshBasicMaterial`).
2. **Concentric Armillary Rings (渾天儀 / Bagua Astrolabe)**:
   - Inner Gold Ring: `THREE.TorusGeometry` rotating along X & Y axes.
   - Middle Vermilion Ring: `THREE.TorusGeometry` rotating along Y & Z axes.
   - Outer Jade Ring: `THREE.TorusGeometry` rotating along X & Z axes.
3. **Bagua Trigram Notches**: 8 `THREE.OctahedronGeometry` markers placed symmetrically along the middle ring.
4. **Swirling Qi Vortex**: 400–750 additive stardust particles (`THREE.Points`) blending Imperial Gold (`#f59e0b`), Azure Cyan (`#06b6d4`), and Vermilion (`#ef4444`).

### D. Performance & Mobile Safeguards
1. **Device Pixel Ratio Capped at 2**:
   `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));` prevents GPU thermal throttling on Retina and high-DPI Android screens.
2. **Auto-Pause Offscreen (`IntersectionObserver`)**:
   Render loop pauses automatically when the 3D element is scrolled out of the viewport or when `document.hidden` is true.
3. **Comprehensive Memory Disposal**:
   On component unmount, every geometry, material, texture, point cloud, and renderer context is disposed of cleanly:
   ```ts
   disposables.forEach((item) => item.dispose());
   renderer.dispose();
   ```
4. **Interactive Touch / Pointer Drag**:
   Users can touch, drag, and spin the 3D celestial astrolabe in real time, with smooth inertia damping (lerp).
5. **Reduced Motion & WebGL Fallback**:
   If WebGL is unavailable or `prefersReducedMotion()` is active, the component automatically falls back to an elegant 2D celestial emblem.


