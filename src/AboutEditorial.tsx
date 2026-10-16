import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { INTERESTS, ABOUT_INTRO, ABOUT_TABS, EDUCATION, GALLERY, SKILLS, EXPERIENCE_PITCH } from './data';

type Tab = (typeof ABOUT_TABS)[number];
const pad = (n: number) => String(n).padStart(2, '0');
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

function Head({ n, title, note }: { n: number; title: string; note: string }) {
  return (
    <div className="ed-phead">
      <span className="ed-num">{pad(n)}</span>
      <span className="ed-tiny">{title}</span>
      <span className="ed-tiny ed-right">{note}</span>
    </div>
  );
}

function Interests() {
  return (
    <>
      <Head n={1} title="Interests" note="Eight things I keep coming back to" />
      <div className="ed-int">
        {INTERESTS.map((it, i) => (
          <figure key={it.title} className="ed-ph">
            <img src={it.src} alt={it.title} loading="lazy" style={{ objectPosition: it.pos }} />
            <figcaption><span>{pad(i + 1)}</span>{it.title}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

function Education() {
  const { stages } = EDUCATION;
  return (
    <div className="ed-edu-container">
      <Head n={2} title="Education" note="Academic Journey · 03 Stages" />
      <div className="ed-stages-list">
        {stages.map((st) => (
          <article key={st.num} className="ed-stage-entry">
            <div className="ed-stage-data">
              <div className="ed-stage-top">
                <span className="ed-stage-index">{st.num}</span>
                <span className="ed-stage-bar" aria-hidden="true" />
                <span className="ed-stage-label">{st.stageName}</span>
              </div>
              <div className="ed-stage-main">
                {st.degree ? (
                  <>
                    <h3 className="ed-stage-heading">{st.degree}</h3>
                    <p className="ed-stage-institution">{st.institution}</p>
                  </>
                ) : (
                  <>
                    <h3 className="ed-stage-heading">{st.institution}</h3>
                    <p className="ed-stage-level-desc">{st.stageName}</p>
                  </>
                )}
              </div>
              <div className="ed-stage-footer">
                <span className="ed-stage-pill">{st.level}</span>
                {st.cgpa && (
                  <div className="ed-stage-cgpa-box">
                    <span className="ed-cgpa-tag">CGPA</span>
                    <strong className="ed-cgpa-num">{st.cgpa}</strong>
                  </div>
                )}
                {st.percentage && (
                  <div className="ed-stage-cgpa-box">
                    <span className="ed-cgpa-tag">{st.scoreTag || 'SCORE'}</span>
                    <strong className="ed-cgpa-num">{st.percentage}</strong>
                  </div>
                )}
              </div>
            </div>
            <figure className="ed-ph ed-stage-media">
              <img src={st.image} alt={st.alt} loading="lazy" />
              <figcaption><span>{st.num}</span>{st.caption}</figcaption>
            </figure>
          </article>
        ))}
      </div>
    </div>
  );
}

function GalleryLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: {
  items: typeof GALLERY;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const currentItem = items[currentIndex];
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const clickStartedOnBackdrop = useRef(false);

  const isBackdrop = (el: EventTarget | null) => {
    return el === overlayRef.current || (contentRef.current !== null && el === contentRef.current);
  };

  // 1. One-time reliable scroll lock and initial focus on mount, focus restoration on unmount
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Move initial focus to the Close button
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.paddingRight = origPaddingRight;
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
      openerRef.current?.focus?.();
    };
  }, []);

  // 2. Keyboard listener for arrow keys, escape, and focus trap (Tab / Shift+Tab)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate((currentIndex - 1 + items.length) % items.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate((currentIndex + 1) % items.length);
      } else if (e.key === 'Tab' && overlayRef.current) {
        const focusable = Array.from(overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!focusable.length) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !focusable.includes(document.activeElement as HTMLElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !focusable.includes(document.activeElement as HTMLElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  if (!currentItem) return null;

  return createPortal(
    <div
      className="ed-lightbox-backdrop"
      ref={overlayRef}
      onMouseDown={(e) => {
        clickStartedOnBackdrop.current = isBackdrop(e.target);
      }}
      onClick={(e) => {
        if (clickStartedOnBackdrop.current && isBackdrop(e.target)) {
          onClose();
        }
        clickStartedOnBackdrop.current = false;
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Top Header Bar */}
      <header
        className="ed-lightbox-header"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ed-lightbox-meta">
          <span className="ed-lightbox-count">
            {pad(currentIndex + 1)} <span className="ed-lightbox-divider">/</span> {pad(items.length)}
          </span>
          {currentItem.label && (
            <span className="ed-lightbox-label">{currentItem.label}</span>
          )}
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          className="ed-lightbox-btn ed-lightbox-close"
          onClick={onClose}
          aria-label="Close image viewer (Esc)"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      {/* Main Centered Stage */}
      <div
        className="ed-lightbox-content"
        ref={contentRef}
      >
        <img
          src={currentItem.src}
          alt={currentItem.alt}
          className="ed-lightbox-img"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Previous Photograph */}
        <button
          type="button"
          className="ed-lightbox-nav ed-lightbox-prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((currentIndex - 1 + items.length) % items.length);
          }}
          aria-label="Previous photograph (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Next Photograph */}
        <button
          type="button"
          className="ed-lightbox-nav ed-lightbox-next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((currentIndex + 1) % items.length);
          }}
          aria-label="Next photograph (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

function Gallery() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <>
      <Head n={3} title="Gallery" note={`${GALLERY.length} Curated Photographs`} />
      <div className="ed-gal-masonry">
        {GALLERY.map((g, i) => (
          <figure
            key={g.id || g.src}
            className="ed-gal-card"
            onClick={() => setActiveIdx(i)}
            tabIndex={0}
            role="button"
            aria-label={`View photograph ${pad(i + 1)}${g.label ? `: ${g.label}` : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveIdx(i);
              }
            }}
          >
            <div className="ed-gal-thumb-wrap">
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className="ed-gal-thumb"
              />
              <div className="ed-gal-overlay">
                <span className="ed-gal-view-tag">
                  <span>Fig. {pad(i + 1)}</span>
                  {g.label && <span className="ed-gal-label">{g.label}</span>}
                </span>
                <span className="ed-gal-zoom-btn">View</span>
              </div>
            </div>
          </figure>
        ))}
      </div>

      {/* Lightbox Modal (Teleported to document.body) */}
      {activeIdx !== null && (
        <GalleryLightbox
          items={GALLERY}
          currentIndex={activeIdx}
          onClose={() => setActiveIdx(null)}
          onNavigate={(index) => setActiveIdx(index)}
        />
      )}
    </>
  );
}

function Skills() {
  return (
    <>
      <Head n={4} title="Skills & Expertise" note="Four disciplines" />
      <div className="ed-sk-top">
        <h3 className="ed-huge">The craft<br /><em>behind the code.</em></h3>
        <p className="ed-lede">Design-minded development, practical problem-solving, and a curiosity for how things work.</p>
      </div>
      <div className="ed-sk">
        {SKILLS.map((s, i) => (
          <section key={s.group} className="ed-sk-g">
            <span className="ed-num">{pad(i + 1)}</span>
            <h4 className="ed-cat">{s.group}</h4>
            <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
          </section>
        ))}
      </div>
    </>
  );
}

function Experience() {
  const X = EXPERIENCE_PITCH;
  return (
    <div className="ed-xp-panel">
      <Head n={5} title="Experience" note="Fresher · Personal projects & hands-on practice" />
      <span className="ed-status"><i />{X.badge}</span>
      <h3 className="ed-huge ed-hire">
        <span className="ed-hire-lead">HIRE ME,</span>{' '}
        <em className="ed-hire-sub">get two.</em>
        <span className="ed-sr">{X.headline}</span>
      </h3>
      <div className="ed-sk-top ed-xp-top">
        <p className="ed-pull">“{X.punchline}”</p>
        <p className="ed-lede">{X.supportingCopy}</p>
      </div>
      <div className="ed-blocks ed-xp-blocks">
        {X.highlights.map((h) => (
          <article key={h.title}>
            <span className="ed-tiny">{h.tag}</span>
            <h4 className="ed-cat">{h.title}</h4>
            <p>{h.desc}</p>
          </article>
        ))}
      </div>
      <div className="ed-tools ed-xp-tools">
        <span className="ed-tiny">Ready to deploy with</span>
        <p>{X.toolkit.join('  /  ')}</p>
      </div>
    </div>
  );
}

export function AboutEditorial() {
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      if (h.includes('education')) return 'Education';
    }
    return 'Interests';
  });
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = ABOUT_TABS[(i + (e.key === 'ArrowRight' ? 1 : ABOUT_TABS.length - 1)) % ABOUT_TABS.length];
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };
  return (
    <div className="ed">
      <header className="ed-cover">
        <div className="ed-bar"><span className="ed-tiny">About the creator</span><span className="ed-tiny">Kolkata, India</span></div>
        <div className="ed-cover-grid">
          <h2 className="ed-huge">From circuits<br /><em>to interfaces.</em></h2>
          <div className="ed-cover-side">
            <p className="ed-intro">{ABOUT_INTRO}</p>
            <p className="ed-tiny">Electronics &amp; Communication<br />Web Development · UI/UX · Visual Creativity</p>
          </div>
        </div>
      </header>
      <div role="tablist" aria-label="About sections" className="ed-tabs">
        {ABOUT_TABS.map((t, i) => (
          <button
            key={t}
            id={`tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls="about-panel"
            tabIndex={tab === t ? 0 : -1}
            onClick={(e) => { setTab(t); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span>{pad(i + 1)}</span>{t}
          </button>
        ))}
      </div>
      <div id="about-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab} className="tab-panel ed-panel">
        {tab === 'Interests' && <Interests />}
        {tab === 'Education' && <Education />}
        {tab === 'Gallery' && <Gallery />}
        {tab === 'Skills' && <Skills />}
        {tab === 'Experience' && <Experience />}
      </div>
    </div>
  );
}
