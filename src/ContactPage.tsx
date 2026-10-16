import { useState, type FormEvent } from 'react';
import { Mail, Github, Linkedin, Instagram, ArrowUpRight, ArrowLeft, Send, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { EMAIL, RESUME } from './data';

interface ContactPageProps {
  onNavigate: (to: string) => void;
}

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xljgaooy';

const CONTACT_LINKS = [
  {
    title: 'Email me',
    handle: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: Mail,
    external: false,
  },
  {
    title: 'GitHub',
    handle: 'github.com/jai1512-creator',
    href: 'https://github.com/jai1512-creator',
    icon: Github,
    external: true,
  },
  {
    title: 'LinkedIn',
    handle: 'Connect on LinkedIn',
    href: 'https://www.linkedin.com/in/jaishaljoshi',
    icon: Linkedin,
    external: true,
  },
  {
    title: 'Instagram',
    handle: 'Visuals & creative work',
    href: 'https://www.instagram.com/here._.jaishal/?hl=en',
    icon: Instagram,
    external: true,
  },
];

const REASONS = [
  'Job opportunity',
  'Freelance project',
  'Collaboration',
  'Just saying hello',
] as const;

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState<(typeof REASONS)[number]>('Job opportunity');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setStatus('error');
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!trimmedMessage) {
      setStatus('error');
      setErrorMessage('Please enter a message.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          reason,
          message: trimmedMessage,
          _subject: `[Portfolio] ${reason} - Message from ${trimmedName}`,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setErrorMessage('');
        setName('');
        setEmail('');
        setMessage('');
        setReason('Job opportunity');
      } else {
        const data = await response.json().catch(() => null);
        let errorText = 'Something went wrong while delivering your message. Please try again.';
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorText = data.errors
            .map((err: { field?: string; message?: string }) => err.message || err.field)
            .filter(Boolean)
            .join(', ');
        } else if (data?.error) {
          errorText = data.error;
        }
        setStatus('error');
        setErrorMessage(errorText);
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        'Network error: Unable to reach Formspree. Please check your internet connection or email me directly.'
      );
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 text-[#F0E2CF] overflow-x-hidden selection:bg-[#F0E2CF]/20" style={{ background: '#0C0C0C' }}>
      {/* Diffused atmospheric teal glow behind oversized CONTACT heading */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none top-0 left-1/2 -translate-x-1/2 w-[650px] max-w-[92vw] h-[400px] rounded-full blur-[120px] z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(38, 92, 82, 0.32) 0%, rgba(22, 58, 52, 0.16) 45%, transparent 75%)',
        }}
      />

      {/* Oversized background CONTACT typography */}
      <div
        aria-hidden="true"
        className="absolute top-14 sm:top-16 md:top-20 left-1/2 -translate-x-1/2 select-none pointer-events-none z-0 whitespace-nowrap text-center font-black uppercase tracking-wider"
        style={{
          fontSize: 'clamp(5rem, 17vw, 220px)',
          lineHeight: 0.85,
          background: 'linear-gradient(180deg, rgba(240, 226, 207, 0.08) 0%, rgba(181, 161, 138, 0.02) 65%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        CONTACT
      </div>

      {/* Circuit lines on outer left and right edges */}
      <svg
        aria-hidden="true"
        className="absolute left-0 top-12 sm:top-20 w-48 sm:w-64 md:w-80 h-72 pointer-events-none z-0 opacity-40 sm:opacity-60"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="circuit-left" x1="0" y1="0" x2="320" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F0E2CF" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#82718F" stopOpacity="0.25" />
            <stop offset="1" stopColor="#265C52" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d="M -20,20 L 75,115 L 210,115 L 255,160" stroke="url(#circuit-left)" strokeWidth="1.2" />
        <path d="M -10,65 L 55,130 L 140,130" stroke="url(#circuit-left)" strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="210" cy="115" r="3" fill="#1D1C1A" stroke="#F0E2CF" strokeWidth="1.2" />
        <circle cx="255" cy="160" r="4" fill="#265C52" stroke="#F0E2CF" strokeWidth="1.2" />
        <circle cx="140" cy="130" r="2.5" fill="#1D1C1A" stroke="#82718F" strokeWidth="1" />
      </svg>

      <svg
        aria-hidden="true"
        className="absolute right-0 top-16 sm:top-24 w-48 sm:w-64 md:w-80 h-72 pointer-events-none z-0 opacity-40 sm:opacity-60"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="circuit-right" x1="320" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F0E2CF" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#82718F" stopOpacity="0.25" />
            <stop offset="1" stopColor="#265C52" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d="M 340,30 L 245,125 L 110,125 L 65,170" stroke="url(#circuit-right)" strokeWidth="1.2" />
        <path d="M 330,75 L 265,140 L 180,140" stroke="url(#circuit-right)" strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="110" cy="125" r="3" fill="#1D1C1A" stroke="#F0E2CF" strokeWidth="1.2" />
        <circle cx="65" cy="170" r="4" fill="#265C52" stroke="#F0E2CF" strokeWidth="1.2" />
        <circle cx="180" cy="140" r="2.5" fill="#1D1C1A" stroke="#82718F" strokeWidth="1" />
      </svg>

      {/* Top compact navigation matching reference header pill */}
      <header className="relative z-20 flex justify-center w-full">
        <nav
          aria-label="Contact page navigation"
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
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('#about')}
            className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => onNavigate('#services')}
            className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => onNavigate('#projects')}
            className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] hover:bg-[#F0E2CF]/10 transition-all duration-200"
          >
            Projects
          </button>
          {/* Active Contact state pill */}
          <span
            className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#F0E2CF]"
            style={{
              background: 'rgba(240, 226, 207, 0.14)',
              border: '1px solid rgba(240, 226, 207, 0.3)',
            }}
          >
            Contact
          </span>
          <a
            href={RESUME}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider text-[#F0E2CF] hover:bg-[#F0E2CF]/10 border border-[#F0E2CF]/20 transition-all duration-200"
          >
            <span>Resume</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </nav>
      </header>

      {/* Main Two-Column Layout */}
      <main className="max-w-6xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1.35fr] gap-8 md:gap-12 lg:gap-16 items-start mt-8 sm:mt-12 md:mt-16 mb-8">
        {/* Left Column: Heading, Copy & Contact Panels */}
        <section className="flex flex-col gap-6 sm:gap-7">
          <div className="flex flex-col gap-3">
            {/* Small Contact label pill */}
            <div
              className="inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-[#F0E2CF]"
              style={{
                background: 'rgba(41, 39, 34, 0.65)',
                border: '1px solid rgba(240, 226, 207, 0.22)',
                boxShadow: 'inset 0 1px 0 rgba(240, 226, 207, 0.18)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B5A18A]" />
              <span>Contact</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#F0E2CF] leading-tight">
              Get in touch.
            </h1>

            <p className="text-sm sm:text-base text-[#F0E2CF]/75 font-light leading-relaxed max-w-md">
              Have a project, an opportunity, or just an interesting idea? I&apos;d love to hear from you.
            </p>
          </div>

          {/* Stacked Contact Panels */}
          <div className="flex flex-col gap-3 sm:gap-3.5">
            {CONTACT_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="group relative rounded-2xl p-4 sm:p-4.5 flex items-center justify-between gap-4 glass-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F0E2CF]"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 glass-tile"
                    >
                      <Icon className="w-5 h-5 text-[#F0E2CF]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm sm:text-base font-medium text-[#F0E2CF] group-hover:text-white transition-colors duration-200">
                        {item.title}
                      </span>
                      <span className="text-xs sm:text-sm text-[#F0E2CF]/65 font-light break-all">
                        {item.handle}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#F0E2CF]/20 text-[#F0E2CF]/60 group-hover:text-[#F0E2CF] group-hover:border-[#F0E2CF]/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Right Column: Working Frosted-Glass Contact Form */}
        <section
          className="rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col gap-6 glass-panel"
        >
          <form
            action={FORMSPREE_ENDPOINT}
            method="POST"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <input type="hidden" name="reason" value={reason} />

            {/* Name field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-xs uppercase tracking-wider text-[#F0E2CF]/75 font-medium">
                Name <span className="text-[#A64B55]">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={name}
                disabled={status === 'submitting'}
                onChange={(e) => {
                  setName(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Your name"
                className="w-full rounded-xl border px-4 py-3 text-[#F0E2CF] text-sm focus:outline-none glass-field disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                required
              />
            </div>

            {/* Email field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-xs uppercase tracking-wider text-[#F0E2CF]/75 font-medium">
                Email Address <span className="text-[#A64B55]">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={email}
                disabled={status === 'submitting'}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="your.email@example.com"
                className="w-full rounded-xl border px-4 py-3 text-[#F0E2CF] text-sm focus:outline-none glass-field disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                required
              />
            </div>

            {/* Reason selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[#F0E2CF]/75 font-medium">
                Reason for Contacting
              </span>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => {
                  const isSelected = reason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={status === 'submitting'}
                      onClick={() => setReason(r)}
                      aria-pressed={isSelected}
                      className="rounded-xl px-3 py-2.5 text-xs font-medium text-left tracking-wide border glass-chip disabled:opacity-60"
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-xs uppercase tracking-wider text-[#F0E2CF]/75 font-medium">
                Message <span className="text-[#A64B55]">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={message}
                disabled={status === 'submitting'}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Tell me about your project or inquiry..."
                className="w-full rounded-xl border px-4 py-3 text-[#F0E2CF] text-sm focus:outline-none glass-field resize-y disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                required
              />
            </div>

            {/* Error banner */}
            {status === 'error' && (
              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#A64B55]/15 border border-[#A64B55]/40 text-[#F0E2CF] text-xs">
                <div className="flex items-center gap-2 font-medium text-[#E53945]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Submission Failed</span>
                </div>
                <p className="text-[#F0E2CF]/85 pl-6 leading-relaxed">
                  {errorMessage ||
                    'Unable to send your message. Your message has been preserved above so you can try again, or feel free to email me directly.'}
                </p>
              </div>
            )}

            {/* Success message banner */}
            {status === 'success' && (
              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#265C52]/25 border border-[#265C52]/50 text-[#F0E2CF] text-xs">
                <div className="flex items-center gap-2 font-medium text-[#B7E432]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Message delivered successfully!</span>
                </div>
                <p className="text-[#F0E2CF]/85 pl-6 leading-relaxed">
                  Thank you for reaching out! Your message has been sent directly to my inbox via Formspree. I will get back to you as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="self-start ml-6 mt-1 text-[11px] uppercase tracking-wider text-[#F0E2CF]/70 hover:text-[#F0E2CF] underline underline-offset-4 transition-colors"
                >
                  Send another message
                </button>
              </div>
            )}

            {/* Submit button with loading state */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-2xl py-3.5 sm:py-4 font-semibold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 glass-cta active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F0E2CF] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F0E2CF]" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 w-full text-center text-xs text-[#F0E2CF]/45 pt-6 pb-2">
        <span>© {new Date().getFullYear()} Jaishal Joshi · Kolkata, India · All rights reserved.</span>
      </footer>
    </div>
  );
}
