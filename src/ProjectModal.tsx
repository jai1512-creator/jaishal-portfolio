import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiveProjectButton } from './components';
import type { Project } from './data';

const pad = (n: number) => String(n).padStart(2, '0');
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Project details overlay, driven entirely by the project's data. Rendered in a portal so the sticky card's transform can't affect it.
export function ProjectModal({ p, index, onClose }: { p: Project; index: number; onClose: () => void }) {
  const [shot, setShot] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const pressed = useRef(false);
  const n = p.images.length;
  const [kind, stack] = p.category.split('·').map((s) => s.trim());
  const tech = p.tech ?? (stack ? stack.split('+').map((s) => s.trim()).filter(Boolean) : []);
  const go = (d: number) => setShot((s) => (s + d + n) % n);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowRight' && n > 1) go(1);
      else if (e.key === 'ArrowLeft' && n > 1) go(-1);
      else if (e.key === 'Tab' && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="pm-overlay"
      onMouseDown={(e) => { pressed.current = e.target === e.currentTarget && e.nativeEvent.offsetX < e.currentTarget.clientWidth; }}
      onClick={(e) => { if (pressed.current && e.target === e.currentTarget) onClose(); pressed.current = false; }}
    >
      <div className="pm-panel" role="dialog" aria-modal="true" aria-labelledby={`pm-title-${index}`} ref={panel}>
        <header className="pm-head">
          <span className="hero-heading font-black leading-none pm-num">{pad(index + 1)}</span>
          <div className="pm-titles">
            <p className="pm-kind">{kind || p.category}</p>
            <h3 id={`pm-title-${index}`}>{p.name}</h3>
          </div>
          <button type="button" className="pm-close" onClick={onClose} ref={closeBtn} aria-label="Close project details">✕</button>
        </header>
        <div className="pm-body">
          <div className="pm-gallery">
            <div className="pm-stage">
              <img src={p.images[shot]} alt={`${p.name} screenshot ${shot + 1} of ${n}`} />
              {n > 1 && (
                <>
                  <button type="button" className="pm-nav pm-prev" onClick={() => go(-1)} aria-label="Previous screenshot">‹</button>
                  <button type="button" className="pm-nav pm-next" onClick={() => go(1)} aria-label="Next screenshot">›</button>
                </>
              )}
            </div>
            {n > 1 && (
              <div className="pm-thumbs">
                {p.images.map((src, k) => (
                  <button key={src} type="button" className={k === shot ? 'is-on' : ''} onClick={() => setShot(k)} aria-label={`Show screenshot ${k + 1}`} aria-current={k === shot}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="pm-info">
            {p.description && (<section><h4 className="pm-label">About</h4><p>{p.description}</p></section>)}
            {p.features && p.features.length > 0 && (
              <section><h4 className="pm-label">Tracks / key features</h4><ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul></section>
            )}
            {tech.length > 0 && (
              <section><h4 className="pm-label">Technologies</h4><div className="pm-chips">{tech.map((t) => <span key={t}>{t}</span>)}</div></section>
            )}
            <div className="pm-actions">
              <LiveProjectButton href={p.url} arrow />
              {p.repo && <a className="pm-btn" href={p.repo} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
