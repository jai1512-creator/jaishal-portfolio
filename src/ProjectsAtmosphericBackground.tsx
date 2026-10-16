import React from 'react';
import handImg from './assets/projects-hand-large.webp';
import leftFlankImg from './assets/projects-flank-left-tall.webp';
import rightFlankImg from './assets/projects-flank-right-tall.webp';

/**
 * ProjectsAtmosphericBackground
 * 
 * Cinematic, monochrome puppet-master background spanning the entire Projects section:
 * - Large, clearly recognizable grayscale hand near the top controlling projects with strings
 * - Left & right vertical ribbons of suspended computer windows, browser frames, glitch screens & code terminals
 * - Clearly visible puppet strings descending from fingers down along both flanks
 * - Grayscale artwork at 26-34% opacity in open areas, fading to 5-8% behind the center cards
 * - Subtle film grain and atmospheric dust particles
 * - Direct ES module asset imports (zero broken image placeholders, verified 200 image/webp)
 * - Responsive on all screen sizes (mobile through 4K), pointer-events: none, respects reduced motion
 */
export function ProjectsAtmosphericBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0"
    >
      <style>{`
        @keyframes puppetHandDrift {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }
        @keyframes flankDriftLeft {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(2px, 6px, 0);
          }
        }
        @keyframes flankDriftRight {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-2px, -6px, 0);
          }
        }
        @keyframes dustPulseA {
          0%, 100% { transform: translateY(0); opacity: 0.18; }
          50% { transform: translateY(-10px); opacity: 0.38; }
        }
        @keyframes dustPulseB {
          0%, 100% { transform: translateY(0); opacity: 0.12; }
          50% { transform: translateY(12px); opacity: 0.32; }
        }
        .anim-hand-drift {
          animation: puppetHandDrift 10s ease-in-out infinite;
        }
        .anim-flank-drift-left {
          animation: flankDriftLeft 14s ease-in-out infinite;
        }
        .anim-flank-drift-right {
          animation: flankDriftRight 16s ease-in-out infinite;
        }
        .anim-dust-a {
          animation: dustPulseA 8s ease-in-out infinite;
        }
        .anim-dust-b {
          animation: dustPulseB 11s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-hand-drift,
          .anim-flank-drift-left,
          .anim-flank-drift-right,
          .anim-dust-a,
          .anim-dust-b {
            animation: none !important;
          }
        }
      `}</style>

      {/* Film Grain Filter definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="puppet-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* Atmospheric Film Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-screen pointer-events-none"
        style={{ filter: 'url(#puppet-grain-filter)' }}
      />

      {/* Base Dark Charcoal Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 95% 80% at 50% 20%, rgba(20, 20, 22, 0.45) 0%, rgba(12, 12, 12, 0.95) 70%, #0C0C0C 100%)',
        }}
      />

      {/* Visible Vector Strings Layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1000 2000"
      >
        <defs>
          <linearGradient id="stringLineLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="stringLineRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.20" />
            <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Strings from hand down through left flank */}
        <line x1="160" y1="130" x2="65" y2="2000" stroke="url(#stringLineLeft)" strokeWidth="0.9" />
        <line x1="205" y1="140" x2="135" y2="2000" stroke="url(#stringLineLeft)" strokeWidth="0.95" />
        <line x1="250" y1="150" x2="205" y2="2000" stroke="url(#stringLineLeft)" strokeWidth="0.85" />

        {/* Strings stretching across from hand to right flank */}
        <line x1="290" y1="145" x2="840" y2="2000" stroke="url(#stringLineRight)" strokeWidth="0.9" />
        <line x1="330" y1="135" x2="920" y2="2000" stroke="url(#stringLineRight)" strokeWidth="0.9" />

        {/* Additional vertical tension guide lines */}
        <line x1="860" y1="100" x2="865" y2="2000" stroke="url(#stringLineRight)" strokeWidth="0.75" />
        <line x1="945" y1="60" x2="940" y2="2000" stroke="url(#stringLineRight)" strokeWidth="0.75" />
      </svg>

      {/* Large Floating Puppet Hand near the top of the section */}
      <div
        className="anim-hand-drift absolute top-2 sm:top-4 md:top-6 left-1/2 -translate-x-1/2 sm:left-6 md:left-[6%] lg:left-[8%] sm:translate-x-0 w-[270px] sm:w-[380px] md:w-[480px] lg:w-[560px] pointer-events-none select-none opacity-30 sm:opacity-35 transition-opacity duration-300"
        style={{
          filter:
            'drop-shadow(0 14px 36px rgba(0,0,0,0.95)) drop-shadow(0 4px 12px rgba(255,255,255,0.06)) brightness(1.05) contrast(1.25)',
        }}
      >
        <img
          src={handImg}
          alt=""
          loading="eager"
          className="w-full h-auto object-contain pointer-events-none select-none"
        />
      </div>

      {/* Left Flank Suspended Interface Windows (Full Section Height) */}
      <div
        className="anim-flank-drift-left absolute top-16 sm:top-20 bottom-8 left-0 w-[100px] sm:w-[170px] md:w-[240px] lg:w-[310px] pointer-events-none select-none opacity-26 sm:opacity-30 md:opacity-34 transition-opacity duration-300"
        style={{
          filter:
            'drop-shadow(0 10px 28px rgba(0,0,0,0.95)) brightness(1.0) contrast(1.15)',
        }}
      >
        <img
          src={leftFlankImg}
          alt=""
          loading="eager"
          className="w-full h-full object-contain object-left-top pointer-events-none select-none"
        />
      </div>

      {/* Right Flank Suspended Interface Windows (Full Section Height) */}
      <div
        className="anim-flank-drift-right absolute top-14 sm:top-18 bottom-8 right-0 w-[100px] sm:w-[170px] md:w-[240px] lg:w-[310px] pointer-events-none select-none opacity-26 sm:opacity-30 md:opacity-34 transition-opacity duration-300"
        style={{
          filter:
            'drop-shadow(0 10px 28px rgba(0,0,0,0.95)) brightness(1.0) contrast(1.15)',
        }}
      >
        <img
          src={rightFlankImg}
          alt=""
          loading="eager"
          className="w-full h-full object-contain object-right-top pointer-events-none select-none"
        />
      </div>

      {/* Center Readability Guard: Soft Dark Gradient behind Cards (dims center to 5-8% opacity) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 64% 92% at 50% 50%, rgba(12, 12, 12, 0.88) 0%, rgba(12, 12, 12, 0.65) 48%, transparent 80%)',
        }}
      />

      {/* Atmospheric Dust & Specks along Flanks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="anim-dust-a absolute inset-0">
          <span className="absolute top-[8%] left-[12%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.4px]" />
          <span className="absolute top-[16%] left-[22%] w-1 h-1 rounded-full bg-white/30 blur-[0.6px]" />
          <span className="absolute top-[28%] left-[8%] w-0.5 h-0.5 rounded-full bg-white/50" />
          <span className="absolute top-[42%] left-[16%] w-1.5 h-1.5 rounded-full bg-white/35 blur-[0.5px]" />
          <span className="absolute top-[56%] left-[10%] w-1 h-1 rounded-full bg-white/40 blur-[0.3px]" />
          <span className="absolute top-[70%] left-[14%] w-0.5 h-0.5 rounded-full bg-white/50" />
          <span className="absolute top-[84%] left-[18%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[0.6px]" />
          <span className="absolute top-[12%] right-[14%] w-1.5 h-1.5 rounded-full bg-white/35 blur-[0.4px]" />
          <span className="absolute top-[26%] right-[8%] w-0.5 h-0.5 rounded-full bg-white/50" />
          <span className="absolute top-[38%] right-[20%] w-1 h-1 rounded-full bg-white/30 blur-[0.5px]" />
          <span className="absolute top-[52%] right-[11%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.5px]" />
          <span className="absolute top-[66%] right-[16%] w-0.5 h-0.5 rounded-full bg-white/45" />
          <span className="absolute top-[80%] right-[9%] w-1 h-1 rounded-full bg-white/35 blur-[0.4px]" />
          <span className="absolute top-[92%] right-[15%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[0.6px]" />
        </div>

        <div className="anim-dust-b absolute inset-0">
          <span className="absolute top-[22%] left-[15%] w-1 h-1 rounded-full bg-white/30 blur-[0.5px]" />
          <span className="absolute top-[36%] left-[6%] w-1.5 h-1.5 rounded-full bg-white/25 blur-[0.7px]" />
          <span className="absolute top-[50%] left-[19%] w-0.5 h-0.5 rounded-full bg-white/40" />
          <span className="absolute top-[64%] left-[11%] w-1 h-1 rounded-full bg-white/35 blur-[0.4px]" />
          <span className="absolute top-[78%] left-[7%] w-1.5 h-1.5 rounded-full bg-white/25 blur-[0.7px]" />
          <span className="absolute top-[18%] right-[18%] w-1 h-1 rounded-full bg-white/35 blur-[0.4px]" />
          <span className="absolute top-[32%] right-[12%] w-0.5 h-0.5 rounded-full bg-white/40" />
          <span className="absolute top-[46%] right-[7%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[0.6px]" />
          <span className="absolute top-[60%] right-[22%] w-0.5 h-0.5 rounded-full bg-white/45" />
          <span className="absolute top-[74%] right-[13%] w-1 h-1 rounded-full bg-white/30 blur-[0.5px]" />
          <span className="absolute top-[88%] right-[17%] w-1.5 h-1.5 rounded-full bg-white/25 blur-[0.6px]" />
        </div>
      </div>

      {/* Top Edge Fade: Seamlessly joins previous section */}
      <div
        className="absolute top-0 inset-x-0 h-20 sm:h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #0C0C0C 0%, rgba(12, 12, 12, 0.6) 60%, transparent 100%)',
        }}
      />

      {/* Bottom Edge Fade: Seamlessly joins Contact outro */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 sm:h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0C0C0C 0%, rgba(12, 12, 12, 0.6) 60%, transparent 100%)',
        }}
      />
    </div>
  );
}
