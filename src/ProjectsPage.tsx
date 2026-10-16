import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { PROJECTS, type Project as RawProject } from './data';
import { ProjectModal } from './ProjectModal';

export type CarouselProject = {
  id: string;
  name: string;
  category: string;
  description: string;
  tech: string[];
  image: string;
  liveUrl?: string;
  raw: RawProject;
};

const toProject = (p: RawProject, i: number): CarouselProject => {
  const [kind, stack] = (p.category ?? '').split('·').map((s) => s.trim());
  const fallbackTech = stack ? stack.split('+').map((s) => s.trim()).filter(Boolean) : [];
  const tech = p.tech && p.tech.length > 0 ? p.tech : fallbackTech;
  // Prefer the primary hero screenshot (p.images[2]), otherwise the first screenshot or p.images
  const image = (p as any).image ?? p.images?.[2] ?? p.images?.[0] ?? '';

  return {
    id: String((p as any).id ?? p.name ?? i),
    name: p.name,
    category: p.category,
    description:
      p.description ??
      (kind ? `${kind} application built with ${tech.slice(0, 3).join(', ')}.` : ''),
    tech: tech.length > 0 ? tech : ['React', 'TypeScript', 'Tailwind CSS'],
    image,
    liveUrl: p.url,
    raw: p,
  };
};

const CREAM = '#F0E2CF';
const GOLD = '#C6A467';
const MUTED_GOLD = '#B5A18A';

function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

export default function ProjectsPage({
  projects: customProjects,
  onNavigate,
  homeHref = '/',
}: {
  projects?: RawProject[];
  onNavigate?: (to: string) => void;
  homeHref?: string;
}) {
  const source = customProjects ?? PROJECTS;
  const projects = useMemo(() => source.map(toProject), [source]);
  const count = projects.length;
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const reduce = useReducedMotion();
  const vw = useViewportWidth();
  const draggedRef = useRef(false);

  // Responsive geometry
  const cardW = Math.min(380, Math.max(240, vw * 0.56));
  const step = cardW * (vw < 640 ? 0.78 : 0.72);

  const clamp = useCallback((n: number) => Math.max(0, Math.min(count - 1, n)), [count]);
  const go = useCallback((n: number) => setActive(clamp(n)), [clamp]);
  const prev = useCallback(() => go(active - 1), [go, active]);
  const next = useCallback(() => go(active + 1), [go, active]);

  // Keep index valid if count changes
  useEffect(() => {
    setActive((a) => clamp(a));
  }, [clamp]);

  // Preload neighboring screenshots
  useEffect(() => {
    [active - 1, active + 1, active + 2].forEach((i) => {
      const p = projects[i];
      if (p?.image) {
        const img = new Image();
        img.src = p.image;
      }
    });
  }, [active, projects]);

  // Global arrow key navigation when modal is not open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next, modalOpen]);

  const onDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power < -step * 0.3) next();
    else if (power > step * 0.3) prev();
    setTimeout(() => {
      draggedRef.current = false;
    }, 50);
  };

  const handleReturnHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.assign(homeHref);
    }
  };

  if (!count) return null;
  const current = projects[active];
  const spring = reduce
    ? { duration: 0 }
    : ({ type: 'spring', stiffness: 190, damping: 26, mass: 0.9 } as const);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden text-[color:var(--c)] flex flex-col justify-between"
      style={{ ['--c' as any]: CREAM, background: '#0C0C0C' }}
    >
      {/* Dynamic blurred background derived from active project image */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.img
            key={current.id}
            src={current.image}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.52 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.85, ease: 'easeInOut' }}
            className="absolute inset-0 h-full w-full scale-125 object-cover blur-[80px]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[#0C0C0C]/65" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 38%, transparent 0%, rgba(12,12,12,0.6) 55%, #0C0C0C 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-8 pt-6 sm:px-8">
        {/* Navigation header with Back link & Navbar */}
        <header className="flex w-full items-center justify-between gap-4">
          <nav
            aria-label="Projects page navigation"
            className="inline-flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full transition-all duration-300"
            style={{
              background: 'rgba(29, 28, 26, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(240, 226, 207, 0.18)',
              boxShadow: 'inset 0 1px 1px rgba(240, 226, 207, 0.25), 0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            <button
              type="button"
              onClick={handleReturnHome}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('#about') : window.location.assign('/#about'))}
              className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('#services') : window.location.assign('/#services'))}
              className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('#projects') : window.location.assign('/#projects'))}
              className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('/contact') : window.location.assign('/contact'))}
              className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
            >
              Contact
            </button>
          </nav>

          <span className="text-xs font-mono tracking-[0.2em] text-[#B5A18A]/80 uppercase">
            {pad(active + 1)} &mdash; {pad(count)}
          </span>
        </header>

        {/* Title & Subtitle */}
        <div className="mt-8 text-center sm:mt-10 select-none">
          <h1
            className="text-2xl font-light tracking-[0.35em] sm:text-3xl md:text-4xl uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SELECTED WORK
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#F0E2CF]/70 max-w-md mx-auto">
            A collection of things I&apos;ve imagined, designed, and built.
          </p>
        </div>

        {/* 3D Cinematic Carousel Stage */}
        <section
          role="region"
          aria-roledescription="carousel"
          aria-label="Projects carousel"
          tabIndex={0}
          className="relative mt-8 sm:mt-10 w-full select-none outline-none focus-visible:ring-1 focus-visible:ring-[#C6A467]/50"
          style={{ height: cardW * 1.02 + 40, perspective: 1200 }}
        >
          <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            dragSnapToOrigin
            onDragStart={() => {
              draggedRef.current = true;
            }}
            onDragEnd={onDragEnd}
            style={{ touchAction: 'pan-y' }}
          >
            {projects.map((p, i) => {
              const off = i - active;
              const abs = Math.abs(off);
              const visible = abs <= 2;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  aria-label={`${p.name}, project ${i + 1} of ${count}`}
                  aria-current={off === 0}
                  tabIndex={-1}
                  onClick={() => {
                    if (!draggedRef.current) go(i);
                  }}
                  initial={false}
                  animate={{
                    x: off * step,
                    scale: off === 0 ? 1 : 1 - Math.min(abs, 2) * 0.14,
                    rotateY: off === 0 ? 0 : off > 0 ? -22 : 22,
                    z: off === 0 ? 0 : -80 * Math.min(abs, 2),
                    opacity: visible ? (off === 0 ? 1 : 1 - abs * 0.32) : 0,
                    filter: off === 0 ? 'brightness(1)' : 'brightness(0.55)',
                  }}
                  transition={spring}
                  className="absolute left-1/2 top-1/2 overflow-hidden rounded-[24px] border border-white/20 bg-[#141412]/80 text-left shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md transition-colors"
                  style={{
                    width: cardW,
                    marginLeft: -cardW / 2,
                    marginTop: -(cardW * 0.92) / 2,
                    zIndex: 10 - abs,
                    pointerEvents: visible ? 'auto' : 'none',
                    willChange: 'transform',
                  }}
                >
                  <div className="p-3 pb-0">
                    <img
                      src={p.image}
                      alt={`${p.name} preview`}
                      draggable={false}
                      loading={abs <= 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full rounded-[16px] object-cover object-top border border-white/10"
                      style={{ height: cardW * 0.65 }}
                    />
                  </div>
                  <div className="px-4 py-3 text-center">
                    <p className="truncate text-sm font-medium text-[#F0E2CF]">{p.name}</p>
                    <p className="truncate text-xs font-mono text-[#B5A18A]/75 mt-0.5">
                      {p.tech.slice(0, 3).join(' · ')}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* Active Project Details — Fixed Min-Height to eliminate layout shift */}
        <div className="mt-5 min-h-[155px] w-full max-w-xl text-center" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -6 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C6A467]">
                  {current.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-light tracking-wide text-[#F0E2CF]">
                {current.name}
              </h2>
              <p className="mx-auto mt-2 line-clamp-3 text-xs sm:text-sm text-[#F0E2CF]/80 leading-relaxed max-w-lg">
                {current.description}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {current.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-mono tracking-wider uppercase"
                    style={{ borderColor: 'rgba(198, 164, 103, 0.35)', color: GOLD }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Refined Glass Control Bar */}
        <nav
          aria-label="Project controls"
          className="mt-6 flex w-full max-w-lg items-center justify-between gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              disabled={active === 0}
              aria-label="Previous project"
              className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-[#F0E2CF] transition hover:bg-white/15 disabled:opacity-25 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            <span
              className="text-xs font-mono tabular-nums tracking-[0.2em] px-2 text-[#F0E2CF]/90"
              aria-label={`Project ${active + 1} of ${count}`}
            >
              {pad(active + 1)} / {pad(count)}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={active === count - 1}
              aria-label="Next project"
              className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-[#F0E2CF] transition hover:bg-white/15 disabled:opacity-25 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[11px] font-mono tracking-[0.14em] uppercase text-[#F0E2CF] transition hover:bg-white/15 hover:border-white/30"
              aria-label={`View full details of ${current.name}`}
            >
              <Info size={13} /> DETAILS
            </button>

            {current.liveUrl ? (
              <a
                href={current.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium tracking-[0.14em] text-[#0C0C0C] transition-all duration-300 hover:brightness-110 shadow-sm"
                style={{ background: CREAM }}
              >
                VIEW PROJECT <ArrowUpRight size={14} />
              </a>
            ) : (
              <span className="px-3 text-[11px] opacity-40 font-mono">No live link</span>
            )}
          </div>
        </nav>
      </div>

      {/* Full project modal if user clicks DETAILS */}
      {modalOpen && (
        <ProjectModal
          p={current.raw}
          index={active}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
