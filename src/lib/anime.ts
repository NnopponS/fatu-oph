import { useEffect, useRef } from "react";
import {
  animate,
  createScope,
  createTimeline,
  spring,
  stagger,
  type Scope,
  type JSAnimation,
} from "animejs";

/**
 * Check if the user has requested reduced motion at the OS/browser level.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Chinese Mythology Motion & Timing Tokens
 */
export const MOTION_TOKENS = {
  durations: {
    instant: 150,
    fast: 300,
    standard: 500,
    deliberate: 800,
    ambient: 2400,
    ceremonial: 1400,
  },
  easings: {
    celestialOut: "out(3)",
    celestialInOut: "inOut(3)",
    imperialSpring: spring({ bounce: 0.35 }),
    bouncySeal: spring({ bounce: 0.55 }),
    gentleFloat: "inOut(2)",
    swiftStamp: "out(4)",
  },
} as const;

/**
 * Safe wrapper around Anime.js animate() that verifies element presence first.
 * Eliminates "No target found" errors if elements have not mounted or don't exist on current route.
 */
export function safeAnimate(
  targets: string | Element | Element[] | NodeList | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any,
  container?: Element | Document | null
): JSAnimation | null {
  if (!targets) return null;
  if (prefersReducedMotion()) return null;

  if (typeof targets === "string") {
    const root = container || (typeof document !== "undefined" ? document : null);
    if (!root) return null;
    const found = root.querySelectorAll(targets);
    if (!found || found.length === 0) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (animate as any)(found, parameters);
  }

  if (Array.isArray(targets) || targets instanceof NodeList) {
    if (targets.length === 0) return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (animate as any)(targets, parameters);
}

/**
 * Custom React Hook that encapsulates Anime.js v4 Scoped Lifecycle.
 *
 * It binds all query-selector-based animations strictly inside `rootRef`
 * and automatically calls `scope.revert()` when unmounting or when dependencies update.
 */
export function useAnimeScope<T extends HTMLElement = HTMLDivElement>(
  initFn?: (self: Scope) => void,
  deps: React.DependencyList = []
) {
  const rootRef = useRef<T | null>(null);
  const scopeRef = useRef<Scope | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (prefersReducedMotion()) return;

    // Create Anime.js v4 scope bound to root element
    const scope = createScope({ root: rootRef.current });
    scopeRef.current = scope;

    if (initFn) {
      scope.add((self) => {
        initFn(self);
      });
    }

    return () => {
      scope.revert();
      scopeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { rootRef, scopeRef };
}

// Re-export core Anime.js utilities for convenient project-wide access
export { animate, createScope, createTimeline, spring, stagger };
