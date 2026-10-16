import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { HERO_PORTRAIT } from './data';

// Opening title sequence. Mounted once at the top of the app, so it shows on a fresh visit or full reload and never again:
// client-side route changes only re-render what is inside it.
//
// Timeline (ms after the title starts), unchanged in length from the extended version:
//   0 ........ title sequence plays; the progress line eases continuously toward 100%
//   FADE_AT-MOUNT_LEAD  the page mounts BEHIND the still-opaque loader, so its heavy first render and effects never
//                       land on a frame of the fade (compositor-driven transform/opacity animations keep running through it)
//   FADE_AT .. the progress line lands on 100% exactly as the fade starts, then the loader fades over EXIT_MS
// If resources are late the plan simply slides later (line creeps instead of freezing); MAX_WAIT bounds it.
const FADE_AT = 3210; // ms: when the fade begins (previously 2950 minimum + 260 line-fill stage, now one continuous run)
const FADE_AT_STATIC = 2450; // ms: same, for the static (reduced-motion) version
const MOUNT_LEAD = 500; // ms before the fade that the page mounts, so it has settled and is already fading in as the loader lifts
const MOUNT_SETTLE = 300; // ms the fade waits after a late mount (slow resources) so the page can settle first
const LINE_DELAY = 550; // ms after the title starts that the line begins to move
const FONT_CAP = 500; // ms: don't hold the intro for the loader's own fonts any longer than this
const MAX_WAIT = 6000; // ms: reveal the page regardless if a resource is slow or has failed
const EXIT_MS = 600; // fade-out (keep in sync with .ld in index.css)
const EASE_LINE = 'cubic-bezier(.45,.05,.4,1)'; // gentle ease-in-out: continuous, lands softly on 100%
const EASE_CREEP = 'cubic-bezier(.22,1,.36,1)'; // only used while waiting on slow resources
const FONTS = ["400 1em 'League Gothic'", "500 1em 'Kanit'", "500 1em 'Space Grotesk'"];

type Phase = 'intro' | 'leaving' | 'done';

export function Loader({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [go, setGo] = useState(false); // title sequence started (loader fonts ready or capped)
  const [showPage, setShowPage] = useState(false);
  const fillRef = useRef<HTMLSpanElement>(null); // progress line: driven directly (transform only), no per-frame React state

  // No background scrolling until the loader is fully gone. The scrollbar gutter stays reserved for the whole time (the page
  // mounts under the loader), so unlocking at the end swaps the gutter for the real scrollbar with no layout shift.
  useLayoutEffect(() => {
    if (phase === 'done') return;
    const el = document.documentElement;
    const prev = { overflow: el.style.overflow, gutter: el.style.scrollbarGutter };
    el.style.overflow = 'hidden';
    el.style.scrollbarGutter = 'stable';
    return () => {
      el.style.overflow = prev.overflow;
      el.style.scrollbarGutter = prev.gutter;
    };
  }, [phase === 'done']);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: number[] = [];
    let raf = 0;
    let cancelled = false;
    let onLoad: (() => void) | null = null;
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, Math.max(0, ms));
      timers.push(id);
      return id;
    };

    const windowLoaded = () =>
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') return resolve();
        onLoad = () => resolve();
        window.addEventListener('load', onLoad, { once: true });
      });
    const fontsReady = () =>
      document.fonts?.load
        ? Promise.all(FONTS.map((f) => document.fonts.load(f).catch(() => []))).then(() => undefined)
        : Promise.resolve();
    const imageReady = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
        img.decode?.().then(() => resolve(), () => resolve());
      });

    // ---- progress line: one continuous eased run. Before the plan is known it creeps; once known it is retargeted
    // (a CSS transition retarget starts from the current value, so there is no jump) to land on 100% as the fade starts.
    let lineOn = false;
    let lineStartAt = 0;
    let fadeAt = 0; // absolute time the fade begins; 0 until the page is ready and the plan is made
    const setLine = (to: number, ms: number, delay: number, ease: string) => {
      const el = fillRef.current;
      if (!el) return;
      el.style.transition = `transform ${Math.round(ms)}ms ${ease} ${Math.round(delay)}ms`;
      el.style.transform = `scaleX(${to})`;
    };
    const driveLine = () => {
      if (!lineOn) return;
      const now = performance.now();
      if (!fadeAt) return setLine(0.9, 9000, LINE_DELAY, EASE_CREEP);
      const delay = Math.max(0, LINE_DELAY - (now - lineStartAt));
      setLine(1, Math.max(150, fadeAt - now - delay), delay, EASE_LINE);
    };

    let goAt = performance.now();
    let startedPlay = false;
    let fontCapTimer = 0;
    const beginPlay = () => {
      if (startedPlay || cancelled) return;
      startedPlay = true;
      window.clearTimeout(fontCapTimer);
      goAt = performance.now();
      setGo(true);
      raf = requestAnimationFrame(() =>
        (raf = requestAnimationFrame(() => {
          lineOn = true;
          lineStartAt = performance.now();
          driveLine();
        })),
      );
    };
    // Title starts once its fonts are in (or after FONT_CAP), so the type never swaps mid-fade.
    const fonts = fontsReady();
    fonts.then(beginPlay);
    fontCapTimer = later(beginPlay, FONT_CAP);

    // Once resources are ready: schedule everything against absolute times so no stage waits on another.
    const plan = () => {
      const now = performance.now();
      const at = goAt + (reduce ? FADE_AT_STATIC : FADE_AT);
      const mountAt = Math.max(now, at - MOUNT_LEAD);
      fadeAt = Math.max(at, mountAt + MOUNT_SETTLE);
      driveLine();
      later(() => setShowPage(true), mountAt - now);
      later(() => {
        setPhase('leaving');
        later(() => setPhase('done'), reduce ? 0 : EXIT_MS);
      }, fadeAt - now);
    };
    const ready = Promise.all([windowLoaded(), fonts, imageReady(HERO_PORTRAIT)]);
    let timeoutId = 0;
    const timeout = new Promise<void>((resolve) => (timeoutId = later(resolve, MAX_WAIT)));
    Promise.race([ready, timeout]).then(() => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      beginPlay();
      plan();
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (onLoad) window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <>
      {showPage && children}
      {phase !== 'done' && (
        <div className={`ld${go ? ' is-go' : ''}${phase === 'leaving' ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading portfolio">
          <div className="ld-stage">
            <div className="ld-name">JAISHAL JOSHI</div>
            <p className="ld-sub">Creative Developer · Portfolio</p>
            <div className="ld-load">
              <svg className="ld-spin" viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="14 40" />
              </svg>
              <div className="ld-line" aria-hidden="true">
                <span ref={fillRef} className="ld-fill" />
              </div>
              <p className="ld-cap">Designed to explore.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
