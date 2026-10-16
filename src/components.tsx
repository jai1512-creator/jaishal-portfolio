import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

type FadeProps = { children: ReactNode; delay?: number; duration?: number; x?: number; y?: number; className?: string; as?: ElementType };
export function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, className, as = 'div' }: FadeProps) {
  const Comp = motion.create(as);
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Comp>
  );
}

export function ContactButton({ href, onClick }: { href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="inline-block rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base whitespace-nowrap"
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
        outline: '2px solid white',
        outlineOffset: '-3px',
      }}
    >
      Contact Me
    </a>
  );
}

export function ResumeButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-full text-[#F0E2CF] font-semibold uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base whitespace-nowrap glass-resume focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F0E2CF] focus-visible:outline-offset-2"
    >
      View Resume
    </a>
  );
}

export function LiveProjectButton({ href, arrow = false }: { href: string; arrow?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="pm-live inline-block rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base hover:bg-[#D7E2EA]/10 transition-colors whitespace-nowrap"
    >
      Live Project{arrow ? ' ↗' : ''}
    </a>
  );
}

type MagnetProps = { children: ReactNode; padding?: number; strength?: number; activeTransition?: string; inactiveTransition?: string; className?: string };
export function Magnet({ children, padding = 100, strength = 2, activeTransition = 'transform 0.3s ease-out', inactiveTransition = 'transform 0.5s ease-in-out', className }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const cx = left + width / 2, cy = top + height / 2;
      const dx = Math.abs(cx - e.clientX), dy = Math.abs(cy - e.clientY);
      if (dx < width / 2 + padding && dy < height / 2 + padding) {
        setActive(true);
        setPos({ x: (e.clientX - cx) / strength, y: (e.clientY - cy) / strength });
      } else {
        setActive(false);
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [padding, strength]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, transition: active ? activeTransition : inactiveTransition, willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}

function Char({ ch, index, total, progress }: { ch: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 1 / total], [0.2, 1]);
  return (
    <span className="relative inline-block">
      <span className="invisible">{ch}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>{ch}</motion.span>
    </span>
  );
}

export function AnimatedText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });
  const words = text.split(' ');
  const total = text.length;
  let idx = 0;
  return (
    <p ref={ref} className={className} style={style}>
      {words.map((w, wi) => {
        const chars = (w + (wi < words.length - 1 ? ' ' : '')).split('');
        return (
          <span key={wi} className="inline-block whitespace-pre">
            {chars.map((c) => <Char key={idx} ch={c} index={idx++} total={total} progress={scrollYProgress} />)}
          </span>
        );
      })}
    </p>
  );
}
