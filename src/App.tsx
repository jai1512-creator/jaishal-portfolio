import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { FadeIn, ContactButton, ResumeButton, LiveProjectButton, Magnet, AnimatedText } from './components';
import { EMAIL, RESUME, PORTRAIT, HERO_PORTRAIT, HERO_SIGNATURE, INTERESTS, ABOUT_IMAGES, SERVICES, PROJECTS, HOMEPAGE_PROJECTS, DECO, ABOUT_INTRO, ABOUT_TABS, EDUCATION, GALLERY, SKILLS, EXPERIENCE, EXPERIENCE_PITCH } from './data';
import { ContactPage } from './ContactPage';
import ProjectsPage from './ProjectsPage';
import { AboutEditorial } from './AboutEditorial';
import { Loader } from './Loader';
import { ProjectModal } from './ProjectModal';
import { ProjectsAtmosphericBackground } from './ProjectsAtmosphericBackground';

function useRoute() {
  const getBase = () => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (window.location.hostname.endsWith('github.io') && segments.length > 0) {
      return '/' + segments[0];
    }
    return '';
  };

  const getPath = () => {
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    const h = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('p') || '';
    const base = getBase();

    if (redirectPath.endsWith('/contact') || redirectPath === '/contact' || p.endsWith('/contact') || p === '/contact' || h === '#/contact' || h === '#contact') {
      if (redirectPath) {
        window.history.replaceState({}, '', (base + '/contact') || '/contact');
      }
      return '/contact';
    }
    if (redirectPath.endsWith('/projects') || redirectPath === '/projects' || p.endsWith('/projects') || p === '/projects' || h === '#/projects' || h === '#projects') {
      if (redirectPath) {
        window.history.replaceState({}, '', (base + '/projects') || '/projects');
      }
      return '/projects';
    }
    return '/';
  };
  const [route, setRoute] = useState(getPath);

  useEffect(() => {
    const onPop = () => setRoute(getPath());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  const navigate = (to: string) => {
    const base = getBase();
    if (to === '/contact') {
      window.history.pushState({}, '', (base + '/contact') || '/contact');
      setRoute('/contact');
      window.scrollTo(0, 0);
    } else if (to === '/projects') {
      window.history.pushState({}, '', (base + '/projects') || '/projects');
      setRoute('/projects');
      window.scrollTo(0, 0);
    } else {
      window.history.pushState({}, '', (base + '/') || '/');
      setRoute('/');
      if (to && to !== '/' && to.startsWith('#')) {
        setTimeout(() => {
          const el = document.querySelector(to);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        window.scrollTo(0, 0);
      }
    }
  };

  return { route, navigate };
}

const MAIL = `mailto:${EMAIL}`;
const H = 'hero-heading font-black uppercase leading-none tracking-tight text-center';
const BIG = { fontSize: 'clamp(3rem, 12vw, 160px)' };
const NUM = { fontSize: 'clamp(3rem, 10vw, 140px)' };
const pad = (n: number) => String(n).padStart(2, '0');

// ---- Hero headline: per-letter flowing-liquid colour (hover only; static cream for touch and reduced motion) ----
// The hovered letter fades to transparent and a small WebGL canvas fades in over it. The canvas runs a flowing-fluid shader
// and is clipped to that letter's glyph (drawn from the headline's own font, size and per-letter positions), so nothing spills outside it.
// Two canvases alternate so the old letter can fade out while the new one fades in. Without WebGL the headline simply stays cream.
const NAME_LENGTH = 12; // JAISHAL (0-6) + JOSHI (7-11)
const FIRST_WORD_LENGTH = 7;
const CAP_HEIGHT = 312; // glyph height above the baseline, incl. overshoot of round letters (SVG units)
const GLYPH_PAD = 10; // css px of padding around the glyph box (covers the stroke and antialiasing)
const LIQUID_FADE = 260; // ms

const FLOW_VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
const FLOW_FS = `precision highp float;
varying vec2 v;
uniform vec2 uRes;      // canvas size in css px
uniform float uT;       // seconds
uniform vec2 uSeed;     // per-letter offset so each letter shows a different patch of fluid
uniform sampler2D uMask;
vec3 pal(float x){
  x = fract(x) * 8.0;
  vec3 c = vec3(0.165,0.039,0.420);                                   // deep violet
  c = mix(c, vec3(0.541,0.169,1.000), smoothstep(0.,1.,x));           // electric purple
  c = mix(c, vec3(1.000,0.000,0.831), smoothstep(1.,2.,x));           // magenta
  c = mix(c, vec3(1.000,0.176,0.584), smoothstep(2.,3.,x));           // hot pink
  c = mix(c, vec3(1.000,0.541,0.000), smoothstep(3.,4.,x));           // bright orange
  c = mix(c, vec3(0.239,1.000,0.431), smoothstep(4.,5.,x));           // neon green
  c = mix(c, vec3(0.000,0.898,1.000), smoothstep(5.,6.,x));           // cyan
  c = mix(c, vec3(0.184,0.357,1.000), smoothstep(6.,7.,x));           // electric blue
  c = mix(c, vec3(0.165,0.039,0.420), smoothstep(7.,8.,x));           // back to violet
  return c;
}
void main(){
  vec2 p = v * uRes / 150.0 + uSeed;
  float t = uT;
  // steady stream plus layered swirling warps = water-like advection
  p += vec2(t*0.22, -t*0.14);
  for (int i = 1; i < 6; i++) {
    float f = float(i);
    p += (0.62 / f) * vec2(sin(f*1.9*p.y + t*0.55 + f*1.3), cos(f*2.2*p.x - t*0.47 + f*0.7));
  }
  // second pass: rotate by a slowly moving swirl so filaments curl
  vec2 q = p - vec2(sin(t*0.21), cos(t*0.17)) * 1.4;
  float r = length(q);
  float a = 0.9 / (0.6 + r);
  p = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
  float k = sin(p.x*1.15 + p.y*0.85 + t*0.35) * 0.5 + 0.5;
  float m = sin(p.y*1.6 - p.x*0.7 - t*0.3) * 0.5 + 0.5;
  float s = k*0.55 + m*0.45;
  vec3 col = pal(s*1.15 + t*0.02);
  // thin bright filaments where the field folds, like ink streaks
  float ridge = pow(1.0 - abs(2.0*k - 1.0), 6.0);
  col += vec3(0.18,0.12,0.22) * ridge;
  col = clamp(col, 0.0, 1.0);
  float al = texture2D(uMask, vec2(v.x, 1.0 - v.y)).a;
  gl_FragColor = vec4(col * al, al);
}
`;

type FlowLayer = {
  canvas: HTMLCanvasElement;
  running: boolean;
  setGlyph: (mask: HTMLCanvasElement, cssW: number, cssH: number, seed: number) => void;
  render: (t: number) => void;
};

function createFlowLayer(canvas: HTMLCanvasElement): FlowLayer | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = compile(gl.VERTEX_SHADER, FLOW_VS);
  const fs = compile(gl.FRAGMENT_SHADER, FLOW_FS);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(prog, 'uMask'), 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uSeed = gl.getUniformLocation(prog, 'uSeed');
  const uT = gl.getUniformLocation(prog, 'uT');
  return {
    canvas,
    running: false,
    setGlyph(mask, cssW, cssH, seed) {
      canvas.width = mask.width;
      canvas.height = mask.height;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      gl.viewport(0, 0, mask.width, mask.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.uniform2f(uRes, cssW, cssH);
      gl.uniform2f(uSeed, seed * 1.37, seed * 0.91);
    },
    render(t) {
      gl.uniform1f(uT, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

function Letters({ text, offset }: { text: string; offset: number }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <tspan key={i} className="hv-ch" data-i={offset + i}>{ch}</tspan>
      ))}
    </>
  );
}

function useLiquidLetters(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = ref.current;
    const wrap = root?.parentElement;
    if (!root || !wrap) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const flows = Array.from(wrap.querySelectorAll<HTMLCanvasElement>('.hv-flow')).map(createFlowLayer);
    if (flows.length === 0 || flows.some((f) => !f)) return; // no WebGL: the headline stays cream
    const layers = flows as FlowLayer[];
    // Desktop and mobile SVGs both carry the letters; index them together so either one can animate.
    const letters: SVGElement[][] = Array.from({ length: NAME_LENGTH }, () => []);
    root.querySelectorAll<SVGElement>('.hv-ch').forEach((el) => letters[Number(el.dataset.i)].push(el));
    const mask = document.createElement('canvas');
    const hideTimers: number[] = layers.map(() => 0);
    let current: { i: number; k: number } | null = null;
    let next = 0;
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      let any = false;
      layers.forEach((f) => {
        if (f.running) {
          f.render(t);
          any = true;
        }
      });
      raf = any ? requestAnimationFrame(tick) : 0;
    };
    const ensureLoop = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Size/position the canvas over letter i and draw that glyph (same font, per-letter x and scale as the SVG text) as the clip.
    const prepare = (flow: FlowLayer, i: number) => {
      const svg = Array.from(root.querySelectorAll<SVGSVGElement>('svg.hv-svg')).find((s) => s.getBoundingClientRect().width > 0);
      const word = i < FIRST_WORD_LENGTH ? 0 : 1;
      const text = svg?.querySelectorAll<SVGTextElement>('text')[word];
      const ctm = svg?.getScreenCTM();
      if (!svg || !text || !ctm) return false;
      const ci = i - (word ? FIRST_WORD_LENGTH : 0);
      const ext = text.getExtentOfChar(ci);
      const baseY = Number(text.getAttribute('y'));
      const kx = ctm.a;
      const ky = ctm.d;
      const left = ctm.e + ext.x * kx - GLYPH_PAD;
      const top = ctm.f + (baseY - CAP_HEIGHT) * ky - GLYPH_PAD;
      const cssW = ext.width * kx + GLYPH_PAD * 2;
      const cssH = (CAP_HEIGHT + 10) * ky + GLYPH_PAD * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mask.width = Math.max(1, Math.round(cssW * dpr));
      mask.height = Math.max(1, Math.round(cssH * dpr));
      const ctx = mask.getContext('2d');
      if (!ctx) return false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, mask.width, mask.height);
      const sx = kx * dpr;
      const sy = ky * dpr;
      ctx.setTransform(sx, 0, 0, sy, -((left - ctm.e) / kx) * sx, -((top - ctm.f) / ky) * sy);
      const cs = getComputedStyle(text);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ch = (text.textContent || '')[ci] ?? '';
      const adv = ctx.measureText(ch).width || 1;
      ctx.translate(ext.x, baseY);
      ctx.scale(ext.width / adv, 1);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 7;
      ctx.lineJoin = 'round';
      ctx.fillText(ch, 0, 0);
      ctx.strokeText(ch, 0, 0);
      const wrapRect = wrap.getBoundingClientRect();
      const c = flow.canvas;
      c.style.left = `${left - wrapRect.left}px`;
      c.style.top = `${top - wrapRect.top}px`;
      flow.setGlyph(mask, cssW, cssH, i + 1);
      return true;
    };
    const fadeOut = (k: number) => {
      layers[k].canvas.classList.remove('is-on');
      window.clearTimeout(hideTimers[k]);
      hideTimers[k] = window.setTimeout(() => {
        layers[k].canvas.style.display = 'none';
        layers[k].running = false;
      }, LIQUID_FADE + 60);
    };
    const activate = (i: number) => {
      if (current?.i === i) return;
      if (current) {
        fadeOut(current.k);
        letters[current.i].forEach((el) => el.classList.remove('is-live'));
      }
      const k = next;
      next = (next + 1) % layers.length;
      window.clearTimeout(hideTimers[k]);
      if (!prepare(layers[k], i)) {
        current = null;
        return;
      }
      const c = layers[k].canvas;
      layers[k].render((performance.now() - t0) / 1000); // paint a first frame before it becomes visible
      c.style.display = 'block';
      void c.getBoundingClientRect(); // commit display before adding the class so the opacity transition runs
      c.classList.add('is-on');
      layers[k].running = true;
      ensureLoop();
      letters[i].forEach((el) => el.classList.add('is-live'));
      current = { i, k };
    };
    const deactivate = () => {
      if (!current) return;
      fadeOut(current.k);
      letters[current.i].forEach((el) => el.classList.remove('is-live'));
      current = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || reduce.matches) return;
      const el = (e.target as Element).closest?.('.hv-ch') as SVGElement | null;
      const svg = el?.ownerSVGElement;
      const ctm = svg?.getScreenCTM();
      if (!el || !svg || !ctm) return deactivate();
      // Only count the cursor as "on the letter" within the glyph's own vertical band, not the whole em box.
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const y = pt.matrixTransform(ctm.inverse()).y;
      const baseY = Number(el.parentElement?.getAttribute('y'));
      if (y < baseY - CAP_HEIGHT || y > baseY + 8) return deactivate();
      activate(Number(el.dataset.i));
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerover', onMove);
    root.addEventListener('pointerleave', deactivate);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerover', onMove);
      root.removeEventListener('pointerleave', deactivate);
      hideTimers.forEach(window.clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      deactivate();
      layers.forEach((f) => {
        f.running = false;
        f.canvas.classList.remove('is-on');
        f.canvas.style.display = '';
      });
    };
  }, [ref]);
}

// Keeps both name words the same weight: they share one horizontal glyph scale (set by JAISHAL's width) instead of each being
// stretched to its own fixed width, so JOSHI's letters are no longer thicker. JOSHI stays right-aligned to the same outer margin.
// Measured at runtime so it holds for whichever font actually loads.
const HEAD_FIT = {
  d: { left: 34, widthA: 656, right: 1630, vbw: 1672 }, // desktop viewBox 1672 wide
  m: { left: 20, widthA: 960, right: 980, vbw: 1000 }, // mobile viewBox 1000 wide
};
function useHeadlineFit(ref: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fit = () => {
      root.querySelectorAll<SVGSVGElement>('svg.hv-svg').forEach((svg) => {
        if (svg.getBoundingClientRect().width === 0) return; // hidden breakpoint variant; refit runs again on resize
        const cfg = svg.classList.contains('hv-svg-d') ? HEAD_FIT.d : HEAD_FIT.m;
        const [a, b] = Array.from(svg.querySelectorAll<SVGTextElement>('text'));
        if (!a || !b) return;
        a.removeAttribute('textLength');
        b.removeAttribute('textLength');
        const nA = a.getComputedTextLength();
        const nB = b.getComputedTextLength();
        if (!nA || !nB) return;
        const wB = (cfg.widthA / nA) * nB; // same glyph scale as JAISHAL
        a.setAttribute('textLength', String(cfg.widthA));
        b.setAttribute('textLength', String(wB));
        b.setAttribute('x', String(cfg.right - wB));
        // Midpoint between the two words (as % of width): the desktop portrait is centred on it (see .hv-portrait in index.css).
        const gapCentre = ((cfg.left + cfg.widthA + (cfg.right - wB)) / 2 / cfg.vbw) * 100;
        svg.closest<HTMLElement>('.hv')?.style.setProperty('--hv-gap', `${gapCentre}%`);
      });
    };
    fit();
    let raf = 0;
    const refit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    document.fonts?.ready.then(refit);
    document.fonts?.addEventListener?.('loadingdone', refit);
    window.addEventListener('resize', refit);
    return () => {
      cancelAnimationFrame(raf);
      document.fonts?.removeEventListener?.('loadingdone', refit);
      window.removeEventListener('resize', refit);
    };
  }, [ref]);
}

function Hero({ onNavigate }: { onNavigate: (to: string) => void }) {
  const links = [['About', '#about'], ['Services', '#services'], ['Projects', '#projects'], ['Contact', '/contact']];
  const titleRef = useRef<HTMLHeadingElement>(null);
  useHeadlineFit(titleRef);
  useLiquidLetters(titleRef);
  return (
    <section className="hv relative h-screen" style={{ overflowX: 'clip' }}>
      <FadeIn delay={0} y={-20} as="nav" className="hv-nav">
        {links.map(([l, h]) => (
          <a
            key={l}
            href={h}
            onClick={(e) => {
              if (h === '/contact') {
                e.preventDefault();
                onNavigate('/contact');
              }
            }}
          >
            {l}
          </a>
        ))}
      </FadeIn>
      <FadeIn delay={0.15} y={40} className="hv-title-wrap">
        <h1 className="hv-title" ref={titleRef} aria-label="Jaishal Joshi">
          <span className="hv-sr">Jaishal Joshi</span>
          <svg className="hv-svg hv-svg-d" viewBox="0 0 1672 330" aria-hidden="true">
            <defs><linearGradient id="hvg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3E7D5" /><stop offset="1" stopColor="#D9C8B0" /></linearGradient></defs>
            <text x="34" y="318" textLength="656" lengthAdjust="spacingAndGlyphs" ><Letters text="JAISHAL" offset={0} /></text>
            <text x="1015" y="318" textLength="615" lengthAdjust="spacingAndGlyphs" ><Letters text="JOSHI" offset={7} /></text>
          </svg>
          <svg className="hv-svg hv-svg-m" viewBox="0 0 1000 640" aria-hidden="true">
            <defs><linearGradient id="hvg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3E7D5" /><stop offset="1" stopColor="#D9C8B0" /></linearGradient></defs>
            <text x="20" y="300" textLength="960" lengthAdjust="spacingAndGlyphs" ><Letters text="JAISHAL" offset={0} /></text>
            <text x="300" y="620" textLength="680" lengthAdjust="spacingAndGlyphs" ><Letters text="JOSHI" offset={7} /></text>
          </svg>
        </h1>
        <canvas className="hv-flow" aria-hidden="true" />
        <canvas className="hv-flow" aria-hidden="true" />
      </FadeIn>
      <FadeIn delay={0.3} y={30} className="hv-portrait">
        <img src={HERO_PORTRAIT} alt="Jaishal Joshi" draggable={false} />
      </FadeIn>
      <FadeIn delay={0.45} y={20} className="hv-left">
        <p>Web Developer<br />&amp; Creative Builder</p>
        <i aria-hidden="true" />
        <p className="hv-intro">I build thoughtful digital experiences that bring creative ideas to life through design, code, and interaction.</p>
      </FadeIn>
      <FadeIn delay={0.5} y={20} className="hv-right">
        <img className="hv-sign" src={HERO_SIGNATURE} alt="Jaishal Joshi signature" draggable={false} />
        <ResumeButton href={RESUME} />
      </FadeIn>
    </section>
  );
}

// Interest cards: 4 per row, repeated so each row keeps scrolling; only the first copy is exposed to assistive tech.
const SET = 4 * (420 + 12); // width of one set of 4 cards
const repeat = (items: typeof INTERESTS) => [...items, ...items, ...items, ...items];




const CARD = { background: '#141412', border: '1px solid rgba(215,226,234,.14)' };









function About({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <section id="about" className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 gap-16 sm:gap-20 md:gap-24">
      {ABOUT_IMAGES.map((im, i) => (
        <FadeIn key={i} delay={im.delay} x={im.x} y={0} duration={0.9} className={`absolute ${im.cls}`}>
          <img src={im.src} alt="" className="w-full" />
        </FadeIn>
      ))}
      <div className="flex flex-col items-center relative z-10 w-full" style={{ gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        <FadeIn y={40}><h2 className={H} style={BIG}>About me</h2></FadeIn>
        <AboutEditorial />
      </div>
      <div className="relative z-10">
        <ContactButton
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/contact');
          }}
        />
      </div>
    </section>
  );
}

const TAPE_STRIPS = [
  { id: 't1', top: '1.5%', angle: 12, speed: 55, dir: 'left' as const, zIndex: 2, delay: -12 },
  { id: 't2', top: '9%', angle: -16, speed: 68, dir: 'right' as const, zIndex: 4, delay: -24 },
  { id: 't3', top: '23%', angle: 11, speed: 62, dir: 'left' as const, zIndex: 1, delay: -8 },
  { id: 't4', top: '36%', angle: -13, speed: 75, dir: 'right' as const, zIndex: 3, delay: -35 },
  { id: 't5', top: '51%', angle: 14, speed: 52, dir: 'left' as const, zIndex: 2, delay: -18 },
  { id: 't6', top: '65%', angle: -12, speed: 70, dir: 'right' as const, zIndex: 4, delay: -40 },
  { id: 't7', top: '79%', angle: -14, speed: 82, dir: 'left' as const, zIndex: 1, delay: -15 },
  { id: 't8', top: '91%', angle: 12, speed: 58, dir: 'right' as const, zIndex: 3, delay: -28 },
];

function TapeSegment() {
  return (
    <div
      className="flex items-center shrink-0 h-full px-3 select-none"
      style={{ width: '380px' }}
    >
      {/* 4 Hazard slashes */}
      <svg className="w-6 h-3.5 shrink-0 mr-2.5" viewBox="0 0 36 18" fill="#080808" aria-hidden="true">
        <polygon points="6,0 12,0 6,18 0,18" />
        <polygon points="14,0 20,0 14,18 8,18" />
        <polygon points="22,0 28,0 22,18 16,18" />
        <polygon points="30,0 36,0 30,18 24,18" />
      </svg>

      {/* SERVICES */}
      <span
        className="font-black text-[#080808] shrink-0"
        style={{
          fontFamily: "'League Gothic', Impact, sans-serif",
          fontSize: 'clamp(19px, 1.9vw, 24px)',
          letterSpacing: '0.06em',
          lineHeight: 1,
        }}
      >
        SERVICES
      </span>

      {/* Divider */}
      <span className="w-[2px] h-3 bg-[#080808]/40 mx-2 shrink-0" />

      {/* BY JAISHAL JOSHI */}
      <span
        className="font-bold text-[#080808]/90 shrink-0"
        style={{
          fontFamily: "'League Gothic', Impact, sans-serif",
          fontSize: 'clamp(15px, 1.4vw, 18px)',
          letterSpacing: '0.08em',
          lineHeight: 1,
        }}
      >
        BY JAISHAL JOSHI
      </span>
    </div>
  );
}

function BrandedTapeBackground() {
  const segmentIndices = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {TAPE_STRIPS.map((st) => (
        <div
          key={st.id}
          className="services-tape-strip"
          style={{
            top: st.top,
            height: 'clamp(36px, 3.2vw, 44px)',
            transform: `rotate(${st.angle}deg)`,
            transformOrigin: 'center center',
            zIndex: st.zIndex,
          }}
        >
          <div
            className="services-tape-track"
            style={{
              animation: `${st.dir === 'left' ? 'tapeDriftLeft' : 'tapeDriftRight'} ${st.speed}s linear infinite`,
              animationDelay: `${st.delay}s`,
            }}
          >
            {segmentIndices.map((idx) => (
              <TapeSegment key={idx} />
            ))}
          </div>
        </div>
      ))}

      {/* Ambient center vignette & subtle warmth: subdues central tape for perfect card contrast */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background:
            'radial-gradient(ellipse 65% 70% at 50% 50%, rgba(10, 10, 10, 0.45) 0%, rgba(10, 10, 10, 0.15) 60%, rgba(10, 10, 10, 0.75) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(245, 196, 0, 0.05) 0%, transparent 55%)',
        }}
      />
    </div>
  );
}

function Services({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate('/contact');
    } else {
      window.location.assign('#contact');
    }
  };

  return (
    <section
      id="services"
      className="relative rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 pt-10 sm:pt-12 md:pt-14 pb-12 sm:pb-14 md:pb-16 overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Branded diagonal caution tape background layer */}
      <BrandedTapeBackground />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Preserved Section Heading with tighter spacing */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-9 text-center">
          <div className="flex items-center gap-3 mb-2 sm:mb-2.5 px-3 py-0.5 rounded-full bg-[#0A0A0A]/85 backdrop-blur-md border border-[#B5A18A]/20 shadow-sm">
            <span className="h-px w-5 sm:w-6 bg-[#B5A18A]/50" />
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#B5A18A] font-medium">Capabilities</span>
            <span className="h-px w-5 sm:w-6 bg-[#B5A18A]/50" />
          </div>
          <h2
            className="text-[#F0EDE6] font-black uppercase text-center leading-none tracking-tight"
            style={{
              ...BIG,
              textShadow: '0 4px 28px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.95)',
            }}
          >
            Services
          </h2>
        </div>

        {/* Refined Service Cards with compact padding & gaps */}
        <div className="flex flex-col gap-3 sm:gap-3.5 md:gap-4">
          {SERVICES.map((s, i) => (
            <FadeIn key={s.name} delay={i * 0.08}>
              <div
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
                className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 md:gap-6 px-5 sm:px-7 md:px-8 py-3.5 sm:py-4 md:py-4.5 rounded-2xl sm:rounded-[20px] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer select-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(22, 19, 17, 0.90) 0%, rgba(13, 11, 10, 0.96) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(198, 164, 103, 0.2)',
                  boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 240, 220, 0.08)',
                }}
              >
                {/* Lavender number accent */}
                <span
                  className="font-black leading-none shrink-0 select-none text-[#82718F] group-hover:text-[#A492B1] transition-colors duration-300"
                  style={{ fontSize: 'clamp(2rem, 3.8vw, 52px)' }}
                >
                  {pad(i + 1)}
                </span>

                {/* Service Details */}
                <div className="flex-1 flex flex-col gap-1 text-left">
                  <h3
                    className="font-bold uppercase tracking-wide text-[#F0EDE6] group-hover:text-white transition-colors duration-300"
                    style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.45rem)' }}
                  >
                    {s.name}
                  </h3>
                  <p className="font-light leading-relaxed text-[#F0EDE6]/70 max-w-2xl text-[13px] sm:text-[14.5px]">
                    {s.desc}
                  </p>
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#F0EDE6]/80 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full group-hover:border-white/25 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right controls: Mini index & Circular arrow */}
                <div className="self-stretch md:self-auto flex md:flex-col items-center justify-between md:justify-between shrink-0 gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 md:border-none">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#B5A18A]/60">
                    0{i + 1}
                  </span>
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#B5A18A]/30 flex items-center justify-center text-[#F0EDE6]/80 group-hover:border-[#F5C400] group-hover:text-[#F5C400] group-hover:bg-[#F5C400]/10 group-hover:shadow-[0_0_15px_rgba(245,196,0,0.25)] transition-all duration-300"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const R = 'rounded-[26px] sm:rounded-[34px] md:rounded-[40px]';
const CARD_NUM = { fontSize: 'clamp(1.5rem, 3.6vw, 54px)' };
function Card({ p, i, total }: { p: (typeof PROJECTS)[number]; i: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const target = 1 - (total - 1 - i) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, target]);
  return (
    <div ref={ref} style={{ height: 'clamp(290px, 48vh, 460px)' }}>
      <motion.div
        className={`sticky top-16 md:top-20 border-2 border-[#D7E2EA] ${R}`}
        style={{
          scale,
          top: undefined,
          marginTop: i * 16,
          background: '#0C0C0C',
          transformOrigin: 'top center',
          padding: 'clamp(.55rem, 1.2vw, 1rem)',
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 'clamp(.45rem, 1vw, .75rem)' }}>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hero-heading font-black leading-none" style={CARD_NUM}>{pad(i + 1)}</span>
            <div className="text-[#D7E2EA] uppercase">
              <p className="font-light tracking-wider text-xs opacity-70">{p.category}</p>
              <h3 className="font-medium" style={{ fontSize: 'clamp(.88rem, 1.35vw, 1.25rem)' }}>{p.name}</h3>
            </div>
          </div>
          <div className="flex items-center flex-wrap" style={{ gap: '.4rem' }}>
            <button type="button" className="pm-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`View details: ${p.name}`}>View Details ↗</button>
            <LiveProjectButton href={p.url} />
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex flex-col gap-2 sm:gap-3" style={{ width: '40%' }}>
            <img src={p.images[0]} alt="" loading="lazy" className={`w-full object-cover ${R}`} style={{ height: 'clamp(68px, 8vw, 105px)' }} />
            <img src={p.images[1]} alt="" loading="lazy" className={`w-full object-cover ${R}`} style={{ height: 'clamp(85px, 10.5vw, 148px)' }} />
          </div>
          <div style={{ width: '60%', position: 'relative' }}>
            <img src={p.images[2]} alt="" loading="lazy" className={`object-cover ${R}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </div>
        </div>
      </motion.div>
      {open && <ProjectModal p={p} index={i} onClose={() => setOpen(false)} />}
    </div>
  );
}

function Projects({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <>
      <section id="projects" className="relative z-10 -mt-8 sm:-mt-10 md:-mt-12 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-24" style={{ background: '#0C0C0C' }}>
        {/* Cinematic Monochrome Puppet Master Atmospheric Background */}
        <ProjectsAtmosphericBackground />

        <h2 className={`relative z-10 ${H} mb-8 sm:mb-10 md:mb-12`} style={BIG}>Projects</h2>
        <div className="relative z-10 max-w-5xl mx-auto">
          {HOMEPAGE_PROJECTS.map((p, i) => <Card key={p.name} p={p} i={i} total={HOMEPAGE_PROJECTS.length} />)}
        </div>
        <div className="relative z-10 mt-12 sm:mt-16 text-center">
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/projects');
            }}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full border border-[#D7E2EA]/20 bg-white/[0.03] text-[#D7E2EA] font-mono text-xs sm:text-sm tracking-[0.14em] sm:tracking-[0.18em] uppercase backdrop-blur-sm transition-all duration-300 hover:border-[#C6A467]/60 hover:text-[#C6A467] hover:bg-[#C6A467]/10"
          >
            IMPRESSED? WANNA SEE MORE? ↗
          </a>
        </div>
      </section>

      {/* Redesigned Final Contact Section — Twin-Bull Inspired Outro */}
      <footer
        id="contact-outro"
        className="relative z-20 w-full overflow-hidden flex flex-col items-center pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-24 md:pb-28 px-4 text-center select-none"
        style={{ background: '#050505' }}
      >
        {/* Subtle topographic contour line background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none -z-10 bg-repeat bg-center"
          style={{
            backgroundImage: 'url("./topographic-bg.png")',
            backgroundSize: '1200px auto',
            opacity: 0.42,
          }}
        />

        {/* Ambient vignette to keep contours subtle and focus on center content */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, rgba(5, 5, 5, 0.6) 65%, #050505 100%)',
          }}
        />

        {/* Smooth top transition from Projects section (#0C0C0C) */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-28 pointer-events-none -z-10"
          style={{
            background: 'linear-gradient(to bottom, #0C0C0C 0%, transparent 100%)',
          }}
        />

        {/* 1. Symmetrical Twin-Bull Central Symbol */}
        <FadeIn y={20}>
          <div className="relative flex items-center justify-center mb-8 sm:mb-10 md:mb-12">
            {/* Soft dual-tone ambient backlight behind the emblem */}
            <div
              aria-hidden="true"
              className="absolute w-[240px] sm:w-[320px] md:w-[420px] h-[150px] sm:h-[190px] md:h-[220px] rounded-full blur-[70px] pointer-events-none -z-10"
              style={{
                background: 'radial-gradient(ellipse at 35% 50%, rgba(36, 87, 255, 0.22) 0%, transparent 60%), radial-gradient(ellipse at 65% 50%, rgba(229, 57, 69, 0.22) 0%, transparent 60%)',
              }}
            />
            <img
              src="./twin-bulls.png"
              alt="Twin Bulls emblem"
              className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[500px] max-w-[86vw] h-auto object-contain select-none pointer-events-none drop-shadow-[0_12px_32px_rgba(0,0,0,0.9)]"
            />
          </div>
        </FadeIn>

        {/* 2 & 3. Headline: LET'S WORK (Electric Blue) & TOGETHER (Vivid Red) */}
        <FadeIn delay={0.1} y={20}>
          <h2
            className="font-black uppercase tracking-tight text-center flex flex-col items-center select-none"
            style={{
              fontFamily: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: 'clamp(2.8rem, 9vw, 110px)',
              lineHeight: 0.9,
              letterSpacing: '-0.025em',
            }}
          >
            <span
              className="inline-block transition-transform duration-300 hover:scale-[1.02]"
              style={{
                color: '#2457FF',
                textShadow: '0 0 35px rgba(36, 87, 255, 0.38), 0 4px 18px rgba(0, 0, 0, 0.85)',
              }}
            >
              LET&apos;S WORK
            </span>
            <span
              className="inline-block transition-transform duration-300 hover:scale-[1.02]"
              style={{
                color: '#E53945',
                textShadow: '0 0 35px rgba(229, 57, 69, 0.38), 0 4px 18px rgba(0, 0, 0, 0.85)',
              }}
            >
              TOGETHER
            </span>
          </h2>
        </FadeIn>

        {/* 4. Short collaboration copy */}
        <FadeIn delay={0.18} y={16}>
          <p className="text-[#D8D8D8]/85 font-light text-center max-w-xl leading-relaxed text-sm sm:text-base md:text-lg mt-6 sm:mt-7 px-4">
            Whether you have an upcoming project, an open role, or an ambitious idea to bring to life—my inbox is always open.
          </p>
        </FadeIn>

        {/* 5. Social / contact icons in a single row with palette hover accents */}
        <FadeIn delay={0.24} y={14}>
          <div className="flex items-center justify-center gap-5 sm:gap-7 my-8 sm:my-10">
            {/* 1. GitHub - Tech link with electric blue hover */}
            <a
              href="https://github.com/jai1512-creator"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-[#E5E5E5] hover:text-[#2457FF] hover:drop-shadow-[0_0_14px_rgba(36,87,255,0.7)] transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2457FF] rounded-sm p-1"
            >
              <Github className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
            </a>

            {/* Subtle vertical divider */}
            <span className="h-6 sm:h-7 w-[1px] bg-white/15" aria-hidden="true" />

            {/* 2. LinkedIn - Tech link with electric blue hover */}
            <a
              href="https://www.linkedin.com/in/jaishaljoshi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-[#E5E5E5] hover:text-[#2457FF] hover:drop-shadow-[0_0_14px_rgba(36,87,255,0.7)] transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2457FF] rounded-sm p-1"
            >
              <Linkedin className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
            </a>

            {/* Subtle vertical divider */}
            <span className="h-6 sm:h-7 w-[1px] bg-white/15" aria-hidden="true" />

            {/* 3. Instagram - Social link with vivid red hover */}
            <a
              href="https://www.instagram.com/here._.jaishal/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram profile"
              className="text-[#E5E5E5] hover:text-[#E53945] hover:drop-shadow-[0_0_14px_rgba(229,57,69,0.7)] transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E53945] rounded-sm p-1"
            >
              <Instagram className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
            </a>

            {/* Subtle vertical divider */}
            <span className="h-6 sm:h-7 w-[1px] bg-white/15" aria-hidden="true" />

            {/* 4. Email - Contact link with vivid red hover */}
            <a
              href="mailto:jaishaljoshi2004@gmail.com"
              aria-label="Send email"
              className="text-[#E5E5E5] hover:text-[#E53945] hover:drop-shadow-[0_0_14px_rgba(229,57,69,0.7)] transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E53945] rounded-sm p-1"
            >
              <Mail className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
            </a>
          </div>
        </FadeIn>

        {/* 6. Minimal signature footer */}
        <FadeIn delay={0.3} y={12}>
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-16 h-[1px] bg-white/15 mb-4 sm:mb-5" aria-hidden="true" />

            <div className="flex items-center justify-center gap-3 sm:gap-3.5 text-[#E5E5E5]">
              <span
                className="text-base sm:text-lg md:text-[19px] text-[#F0E2CF] font-medium tracking-wide select-none leading-none"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                Jaishal Joshi
              </span>

              <span className="h-3.5 sm:h-4 w-[1px] bg-white/20" aria-hidden="true" />

              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-light text-[#D8D8D8]/80 tracking-wide leading-none">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8D8D8]/75 shrink-0" />
                <span>Kolkata, India</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </footer>
    </>
  );
}

function Site() {
  const { route, navigate } = useRoute();

  useEffect(() => {
    if (route === '/projects') {
      document.title = 'Projects — Jaishal Joshi';
    } else if (route === '/contact') {
      document.title = 'Contact — Jaishal Joshi';
    } else {
      document.title = 'Jaishal Joshi — Web Developer & Creative Builder';
    }
  }, [route]);

  if (route === '/contact') {
    return <ContactPage onNavigate={navigate} />;
  }

  if (route === '/projects') {
    return <ProjectsPage onNavigate={navigate} />;
  }

  return (
    <main style={{ background: '#0C0C0C', overflowX: 'clip' }}>
      <Hero onNavigate={navigate} />
      <About onNavigate={navigate} />
      <Services onNavigate={navigate} />
      <Projects onNavigate={navigate} />
    </main>
  );
}

// The loader wraps the whole site so it plays once per page load; route changes inside Site never remount it.
export default function App() {
  return (
    <Loader>
      <Site />
    </Loader>
  );
}
