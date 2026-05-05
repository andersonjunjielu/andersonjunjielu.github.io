// screens.jsx — all screen components for the cancer screening guide

const { useState, useEffect, useMemo, useRef } = React;

// ─────────────────────────────────────────────────────────────
// 0. Language picker — floating multilingual "hello" background
// ─────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English',   hello: 'Hello',   native: 'English' },
  { code: 'es', label: 'Spanish',   hello: 'Hola',    native: 'Español' },
  { code: 'zh', label: 'Chinese',   hello: '你好',     native: '中文' },
  { code: 'fr', label: 'French',    hello: 'Bonjour', native: 'Français' },
  { code: 'pt', label: 'Portuguese',hello: 'Olá',     native: 'Português' },
  { code: 'ar', label: 'Arabic',    hello: 'مرحبا',   native: 'العربية' },
  { code: 'vi', label: 'Vietnamese',hello: 'Xin chào',native: 'Tiếng Việt' },
  { code: 'ko', label: 'Korean',    hello: '안녕하세요', native: '한국어' },
  { code: 'tl', label: 'Tagalog',   hello: 'Kumusta', native: 'Tagalog' },
  { code: 'ru', label: 'Russian',   hello: 'Привет',  native: 'Русский' },
];

// Background floats: many "hello"s drifting in/out — placed AROUND
// the central content stack (which sits roughly y: 35–70%, x: 20–80%)
// so they never overlap the headline, picker, or CTA.
const FLOAT_HELLOS = [
  // top band — pushed below status bar / dynamic island (y >= ~12%)
  { text: 'Hello',     x: '14%', y: '13%', size: 28, delay: 0 },
  { text: 'Hola',      x: '82%', y: '15%', size: 26, delay: 1.2 },
  { text: '你好',       x: '46%', y: '20%', size: 30, delay: 2.4 },
  { text: 'Bonjour',   x: '10%', y: '26%', size: 24, delay: 3.6 },
  { text: 'Olá',       x: '88%', y: '24%', size: 26, delay: 4.8 },
  { text: 'こんにちは',   x: '66%', y: '28%', size: 22, delay: 6.0 },

  // narrow side gutters (mid band, only at extreme edges)
  { text: 'مرحبا',      x: '4%',  y: '46%', size: 26, delay: 7.2 },
  { text: 'Привет',    x: '96%', y: '42%', size: 26, delay: 8.4 },
  { text: 'नमस्ते',      x: '6%',  y: '60%', size: 24, delay: 9.6 },
  { text: 'Ciao',      x: '94%', y: '62%', size: 26, delay: 10.8 },

  // bottom band — kept above home indicator (y <= ~88%)
  { text: 'Xin chào',  x: '20%', y: '78%', size: 26, delay: 12.0 },
  { text: '안녕하세요',   x: '70%', y: '76%', size: 22, delay: 13.2 },
  { text: 'Kumusta',   x: '14%', y: '86%', size: 24, delay: 14.4 },
  { text: 'Hej',       x: '82%', y: '88%', size: 26, delay: 15.6 },
  { text: 'Salām',     x: '50%', y: '84%', size: 24, delay: 16.8 },
];

function LanguageScreen({ onPick, variant = 'minimal' }) {
  const [chosen, setChosen] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="app-root" style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* soft gradient wash */}
      <div className="aura-wrap" aria-hidden="true">
        <div className="aura aura-1 page-0" />
        <div className="aura aura-2 page-1" />
        <div className="aura aura-3 page-2" />
      </div>

      {/* Floating multilingual hellos — kept in all variants */}
      <div className="hello-field" aria-hidden="true">
        {FLOAT_HELLOS.map((h, i) => (
          <span
            key={i}
            className="hello-float"
            style={{
              left: h.x, top: h.y,
              fontSize: h.size,
              animationDelay: `${h.delay}s`,
            }}
          >
            {h.text}
          </span>
        ))}
      </div>

      {/* ───────── Variant A: minimal — single dropdown pill ───────── */}
      {variant === 'minimal' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 32px',
        }}>
          <div className="caption" style={{
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 18, fontWeight: 500,
          }}>
            Screening for Every Body
          </div>
          <div style={{
            fontFamily: 'Newsreader, serif', fontStyle: 'italic',
            fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.025em',
            color: 'var(--ink)', marginBottom: 36, textAlign: 'center',
          }}>
            Welcome.
          </div>

          {/* compact language pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(o => !o)}
              className="lang-pill"
              aria-expanded={open}
            >
              <span style={{
                fontFamily: 'Newsreader, serif', fontStyle: 'italic',
                fontSize: 18, color: 'var(--primary)',
              }}>
                {LANGUAGES.find(l => l.code === (chosen || 'en')).hello}
              </span>
              <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                {LANGUAGES.find(l => l.code === (chosen || 'en')).native}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
                transition: 'transform 0.25s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0)',
                color: 'var(--ink-3)',
              }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {open && (
              <div className="lang-dropdown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setChosen(lang.code); setOpen(false); }}
                    className={'lang-dd-row' + (chosen === lang.code ? ' is-chosen' : '')}
                  >
                    <span style={{
                      fontFamily: 'Newsreader, serif', fontStyle: 'italic',
                      fontSize: 15, color: 'var(--primary)', minWidth: 64,
                    }}>{lang.hello}</span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 14 }}>{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn primary"
            style={{ marginTop: 36, minWidth: 200 }}
            onClick={() => onPick(chosen || 'en')}
          >
            Continue
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* ───────── Variant B: chip cluster — visible but compact ───────── */}
      {variant === 'chips' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 28px',
        }}>
          <div className="caption" style={{
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 16, fontWeight: 500,
          }}>
            Screening for Every Body
          </div>
          <div style={{
            fontFamily: 'Newsreader, serif', fontStyle: 'italic',
            fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.025em',
            color: 'var(--ink)', marginBottom: 8, textAlign: 'center',
          }}>
            Welcome.
          </div>
          <div style={{
            fontSize: 15, color: 'var(--ink-2)', marginBottom: 28, textAlign: 'center',
          }}>
            Select your language
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
            maxWidth: 320,
          }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setChosen(lang.code); setTimeout(() => onPick(lang.code), 220); }}
                className={'lang-chip' + (chosen === lang.code ? ' is-chosen' : '')}
              >
                {lang.native}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ───────── Variant C: typographic — "Hello" cycles through languages ───────── */}
      {variant === 'cycle' && (
        <CycleLanguagePick onPick={onPick} chosen={chosen} setChosen={setChosen} />
      )}
    </div>
  );
}

// Variant C: hero "Hello" rotates through languages, user picks one to lock in
function CycleLanguagePick({ onPick, chosen, setChosen }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % LANGUAGES.length), 1500);
    return () => clearInterval(t);
  }, [paused]);

  const cur = LANGUAGES[idx];
  const isPaused = paused || chosen != null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 5,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 32px',
    }}>
      <div className="caption" style={{
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginBottom: 32, fontWeight: 500,
      }}>
        Screening for Every Body
      </div>

      <div style={{ minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          key={cur.code}
          className="hello-hero"
          style={{
            fontFamily: 'Newsreader, serif', fontStyle: 'italic', fontWeight: 400,
            fontSize: 64, lineHeight: 1, letterSpacing: '-0.03em',
            color: 'var(--ink)', textAlign: 'center',
          }}
        >
          {cur.hello}
        </div>
      </div>
      <div style={{
        fontSize: 13, color: 'var(--ink-3)', marginTop: 6, marginBottom: 32,
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {cur.native}
      </div>

      {/* small dot strip — language picker as dots, current pulsing */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 240, marginBottom: 28 }}>
        {LANGUAGES.map((l, i) => (
          <button
            key={l.code}
            onClick={() => { setIdx(i); setPaused(true); setChosen(l.code); }}
            aria-label={l.label}
            style={{
              width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
              border: 'none', padding: 0, cursor: 'pointer',
              background: i === idx ? 'var(--primary)' : 'var(--line-2)',
              transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          />
        ))}
      </div>

      <button
        className="btn primary"
        style={{ minWidth: 200, opacity: isPaused ? 1 : 0.5, transition: 'opacity 0.3s ease' }}
        onClick={() => onPick(chosen || cur.code)}
      >
        Continue in {LANGUAGES.find(l => l.code === (chosen || cur.code)).native}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared layout helpers
// ─────────────────────────────────────────────────────────────
function ScreenShell({ children, footer, progress, onBack }) {
  // If we have both onBack and a footer, render them as symmetric pair.
  // Back: secondary, equal weight on the left.
  // Footer (the primary action) takes the right ~60% so it stays dominant
  // but Back no longer looks like a tiny stub.
  const combinedFooter = (onBack && footer)
    ? (
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', width: '100%' }}>
        <button onClick={onBack} className="btn secondary" style={{
          flex: '0 0 38%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>{footer}</div>
      </div>
    )
    : footer;

  return (
    <div className="app-root" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)' }}>
      <div className="scroll" style={{ paddingTop: 60, paddingBottom: combinedFooter ? 130 : 60 }}>
        <div style={{ padding: '0 22px' }}>
          {progress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 22, paddingTop: 4 }}>
              <Progress {...progress} />
            </div>
          )}
          {children}
        </div>
      </div>
      {combinedFooter && <div className="footer-cta">{combinedFooter}</div>}
    </div>
  );
}

function Progress({ step, total }) {
  return (
    <div className="progress" style={{ flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={'seg ' + (i < step ? 'done' : i === step ? 'now' : '')} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Welcome screen
// ─────────────────────────────────────────────────────────────
function Typewriter({ text, startDelay = 0, speed = 30, className, style, showCaret }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    let cancelled = false;
    let i = 0;
    const tickOne = () => {
      if (cancelled) return;
      i += 1;
      setShown(i);
      if (i < text.length) {
        // tiny variance so it feels human, longer pause on punctuation
        const ch = text.charAt(i - 1);
        const extra = /[.,—?!]/.test(ch) ? 140 : 0;
        setTimeout(tickOne, speed + extra + (Math.random() * 12));
      }
    };
    const startTimer = setTimeout(tickOne, startDelay);
    return () => { cancelled = true; clearTimeout(startTimer); };
  }, [text, startDelay, speed]);

  const isComplete = shown >= text.length;
  // Reserve final layout space so following lines don't jump as we type
  return (
    <div className={className} style={{ ...style, position: 'relative', minHeight: '1em' }}>
      {/* invisible spacer holds final size */}
      <span style={{ visibility: 'hidden' }}>{text || '\u00A0'}</span>
      <span style={{ position: 'absolute', inset: 0, whiteSpace: 'pre-wrap' }}>
        {text.slice(0, shown)}
        {!isComplete && <span className="caret" />}
        {isComplete && showCaret && <span className="caret" />}
      </span>
    </div>
  );
}

function WelcomeScreen({ onStart, clinicName }) {
  const pages = [
    {
      eyebrow: clinicName || 'Screening for Every Body',
      lead: "Cancer screening saves lives —",
      headline: "but only when it matches your body.",
      headlineSerif: false,
    },
    {
      eyebrow: 'The truth is',
      lead: 'every body is different.',
      headline: 'Your screenings should be too.',
      headlineSerif: true,
    },
    {
      eyebrow: 'So before your visit',
      lead: 'we’ll ask a few questions —',
      headline: 'and build a plan made for you.',
      headlineSerif: false,
    },
    {
      eyebrow: 'Ready when you are',
      lead: 'Cancer screening,',
      headline: 'made for your body.',
      headlineSerif: true,
      isFinal: true,
    },
  ];
  const [page, setPage] = useState(0);
  const total = pages.length;
  const isFinal = page === total - 1;

  // Auto-advance: time per page scales with text length so the typewriter finishes,
  // then the line dwells for a beat before sliding to the next page.
  useEffect(() => {
    if (isFinal) return;
    const cur = pages[page];
    const totalChars = cur.eyebrow.length + cur.lead.length + cur.headline.length;
    const dwell = 1400; // beat after typing finishes
    const ms = 950 + totalChars * 32 + dwell;
    const t = setTimeout(() => setPage(p => Math.min(p + 1, total - 1)), ms);
    return () => clearTimeout(t);
  }, [page, isFinal]);

  const cur = pages[page];

  return (
    <div
      className="app-root"
      style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)', overflow: 'hidden' }}
    >
      {/* animated ambient auras (parallax-shift on page change) */}
      <div className="aura-wrap" aria-hidden="true">
        <div className={`aura aura-1 page-${page}`} />
        <div className={`aura aura-2 page-${page}`} />
        <div className={`aura aura-3 page-${page}`} />
      </div>

      {/* Skip — jump straight to the questions */}
      <button
        type="button"
        onClick={onStart}
        className="welcome-skip"
        aria-label="Skip intro"
      >
        Skip
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M3 2l4 4-4 4M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Centered slide content — top padding clears the Dynamic Island / status bar */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
        padding: '72px 32px 0', zIndex: 2,
      }}>
        <div key={page} style={{ width: '100%' }}>
          <Typewriter
            text={cur.eyebrow}
            startDelay={200}
            speed={28}
            className="caption"
            style={{
              marginBottom: 18, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--ink-3)',
            }}
          />
          <Typewriter
            text={cur.lead}
            startDelay={cur.eyebrow.length * 28 + 350}
            speed={32}
            style={{
              fontSize: 19, color: 'var(--ink-2)', marginBottom: 8,
              letterSpacing: '-0.01em', lineHeight: 1.3,
            }}
          />
          <Typewriter
            text={cur.headline}
            startDelay={(cur.eyebrow.length + cur.lead.length) * 30 + 600}
            speed={36}
            showCaret
            style={{
              fontFamily: cur.headlineSerif ? 'Newsreader, serif' : 'inherit',
              fontStyle: cur.headlineSerif ? 'italic' : 'normal',
              fontWeight: cur.headlineSerif ? 400 : 600,
              fontSize: 32, lineHeight: 1.15, letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          />
        </div>
      </div>

      {/* No pagination dots — auto-play intro keeps user on rails */}

      {/* Final-page CTA */}
      {isFinal && (
        <div className="footer-cta intro-cta-in">
          <button className="btn primary full" onClick={onStart}>
            Build my guide
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', paddingTop: 8 }}>
            Takes about 3 minutes · Nothing is saved
          </div>
        </div>
      )}

    </div>
  );
}

function FeatureRow({ icon, title, body }) {
  const icons = {
    lock: <path d="M5 9V6a4 4 0 118 0v3M4 9h10v8H4V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />,
    body: <path d="M9 4a2 2 0 110-4 2 2 0 010 4zm-3 5l3-2 3 2v6l-2 3v3H8v-3l-2-3V9z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>,
    doc:  <path d="M5 1h6l3 3v13H5V1zm6 0v3h3M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '4px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary)', flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18">{icons[icon]}</svg>
      </div>
      <div style={{ paddingTop: 2 }}>
        <div className="body-sm" style={{ fontWeight: 500, marginBottom: 2 }}>{title}</div>
        <div className="caption">{body}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Identity question
// ─────────────────────────────────────────────────────────────
function IdentityScreen({ value, onChange, onNext, onBack, progress }) {
  const [selfDescribe, setSelfDescribe] = useState('');
  return (
    <ScreenShell
      progress={progress}
      onBack={onBack}
      footer={
        <button className="btn primary full" onClick={onNext} disabled={!value}>Continue</button>
      }>
      <div style={{ paddingTop: 4 }}>
        <div className="h-section" style={{ marginBottom: 10 }}>About you · 1 of 4</div>
        <div className="h-title" style={{ marginBottom: 8 }}>
          How do you describe <span className="serif">your gender?</span>
        </div>
        <div className="caption" style={{ marginBottom: 22 }}>
          Pick whatever feels right. This helps us ask better follow-up questions — not to assume your body.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {IDENTITIES.filter(i => i.id !== 'skip').map(opt => (
            <button key={opt.id} className={'opt' + (value === opt.id ? ' selected' : '')} onClick={() => onChange(opt.id)}>
              <div className="opt-bullet" />
              <div style={{ flex: 1 }}>
                <div className="body-sm" style={{ fontWeight: 500 }}>{opt.label}</div>
                <div className="caption">{opt.sub}</div>
              </div>
            </button>
          ))}
          {value === 'self-describe' && (
            <input
              className="fade-in"
              autoFocus
              value={selfDescribe}
              onChange={(e) => setSelfDescribe(e.target.value)}
              placeholder="In your own words…"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1.5px solid var(--primary)', background: 'var(--surface)',
                fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)',
                outline: 'none',
              }}
            />
          )}

          {/* Skip option — final row in the option list */}
          <button
            className={'opt opt-muted' + (value === 'skip' ? ' selected' : '')}
            onClick={() => onChange('skip')}
            style={{ marginTop: 4 }}
          >
            <div className="opt-bullet" />
            <div style={{ flex: 1 }}>
              <div className="body-sm" style={{ fontWeight: 500, color: 'var(--ink-2)' }}>Prefer not to say</div>
              <div className="caption">Skip this question. We’ll ask about your body next.</div>
            </div>
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Age question — custom roller-style picker
// ─────────────────────────────────────────────────────────────
function AgeScreen({ value, onChange, onNext, onBack, progress }) {
  const [val, setVal] = useState(value || 35);
  useEffect(() => { onChange(val); }, [val]);

  return (
    <ScreenShell
      progress={progress}
      onBack={onBack}
      footer={<button className="btn primary full" onClick={onNext}>Continue</button>}
    >
      <div style={{ paddingTop: 4 }}>
        <div className="h-section" style={{ marginBottom: 10 }}>About you · 2 of 4</div>
        <div className="h-title" style={{ marginBottom: 8 }}>
          How old <span className="serif">are you?</span>
        </div>
        <div className="caption" style={{ marginBottom: 36 }}>
          Some screenings start at certain ages. Trust us — doctors mostly care about this for the screening tables.
        </div>

        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 96, fontWeight: 400, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.04em' }}>
            {val}
          </div>
          <div className="caption" style={{ marginTop: 4 }}>years old</div>
        </div>

        <input
          type="range" min="18" max="90" value={val}
          onChange={(e) => setVal(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
          <span>18</span><span>54</span><span>90+</span>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          {[25, 35, 45, 55, 65].map(a => (
            <button key={a} className="chip" onClick={() => setVal(a)} style={{ cursor: 'pointer', background: val === a ? 'var(--primary-soft)' : 'var(--surface)' }}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Body inventory — interactive body map
// ─────────────────────────────────────────────────────────────
function BodyMapScreen({ value, onChange, onNext, onBack, progress, identity }) {
  // start from identity-default if nothing selected yet
  const initial = useMemo(() => {
    if (value && value.size > 0) return value;
    return new Set(DEFAULT_ORGANS[identity] || ['colon', 'lungs']);
  }, []);
  const [selected, setSelected] = useState(initial);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { onChange(selected); }, [selected]);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    setExpanded(id);
    setTimeout(() => setExpanded((cur) => (cur === id ? null : cur)), 1800);
  };

  const has = (id) => selected.has(id);

  return (
    <ScreenShell
      progress={progress}
      onBack={onBack}
      footer={<button className="btn primary full" onClick={onNext}>Continue</button>}>
      <div style={{ paddingTop: 4 }}>
        <div className="h-section" style={{ marginBottom: 10 }}>Your body · 3 of 4</div>
        <div className="h-title" style={{ marginBottom: 8 }}>
          Which of these <span className="serif">do you have?</span>
        </div>
        <div className="caption" style={{ marginBottom: 14 }}>
          Tap any organ to toggle it. We’ve started with a guess based on your last answer — adjust anything that’s wrong. <strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>This matters more than how you identify.</strong>
        </div>

        <BodyMapSVG selected={selected} onToggle={toggle} />

        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ORGANS.map(o => (
            <BodyOrganRow key={o.id} organ={o} on={has(o.id)} expanded={expanded === o.id} onToggle={() => toggle(o.id)} />
          ))}
        </div>

        <div style={{
          marginTop: 18, padding: '12px 14px', background: 'var(--primary-soft)',
          borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: 'var(--primary)', fontSize: 18, lineHeight: 1, paddingTop: 2 }}>✦</div>
          <div className="caption" style={{ color: 'var(--primary)' }}>
            <strong style={{ fontWeight: 600 }}>Did you know?</strong> About 1 in 5 trans women keep some breast tissue after surgery, and almost everyone keeps their prostate. Body parts aren’t the same as gender.
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function BodyMapSVG({ selected, onToggle }) {
  // Line-art outline silhouette — clean stroke, no fill (matches reference).
  // Front view, gender-neutral: bald rounded head, neck, broad shoulders,
  // arms hanging out with simple hands, tapered waist, separate legs, feet.
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '280/520',
      background: 'var(--surface-2)', borderRadius: 18, border: '1px solid var(--line)',
      overflow: 'hidden', marginBottom: 14,
    }}>
      <svg viewBox="0 0 280 520" className="bodymap-svg" preserveAspectRatio="xMidYMid meet">
        {/* Outline path — single continuous stroke around the figure.
            Coordinate system: 280 wide, 520 tall, head ~y=22, feet ~y=506.
            Path traces: top of head → R side of head → R ear → R neck →
            R shoulder → R arm out & down → R hand → up R arm inside → armpit →
            R torso → R waist → R hip → R outer leg → R foot → between legs →
            L outer leg up (mirror) → and back. */}
        <path
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="
            M 140 22
            C 162 22, 178 40, 178 64
            C 178 78, 174 90, 168 98
            L 168 102
            C 172 104, 174 108, 174 112
            L 174 118

            C 184 120, 194 124, 204 132
            L 220 152

            C 224 162, 226 174, 226 186
            L 226 224

            C 226 240, 224 252, 222 264
            L 220 282

            C 218 296, 216 304, 216 310
            C 216 314, 214 316, 210 316
            C 206 316, 204 314, 204 310

            C 204 304, 204 298, 204 292

            C 204 296, 204 300, 200 302
            C 196 304, 192 302, 192 298

            C 192 302, 190 304, 186 304
            C 182 304, 180 302, 180 298

            C 180 302, 178 304, 174 304
            C 170 304, 168 300, 170 296
            L 174 280

            C 178 264, 180 252, 182 240
            L 184 218
            L 184 192

            L 184 138
            C 184 134, 182 132, 180 132

            L 178 192
            L 174 244

            L 172 290
            C 170 320, 170 348, 172 374
            L 178 432
            C 180 452, 182 472, 184 488
            C 184 496, 182 502, 176 504
            L 158 504
            C 152 504, 150 500, 150 494
            L 150 460
            C 150 444, 148 428, 146 412
            L 144 384

            C 142 374, 140 372, 140 372
            C 140 372, 138 374, 136 384
            L 134 412
            C 132 428, 130 444, 130 460
            L 130 494
            C 130 500, 128 504, 122 504
            L 104 504
            C 98 502, 96 496, 96 488
            C 98 472, 100 452, 102 432
            L 108 374
            C 110 348, 110 320, 108 290
            L 106 244
            L 102 192
            L 100 132
            C 98 132, 96 134, 96 138
            L 96 192
            L 96 218
            L 98 240
            C 100 252, 102 264, 106 280
            L 110 296
            C 112 300, 110 304, 106 304
            C 102 304, 100 302, 100 298
            C 100 302, 98 304, 94 304
            C 90 304, 88 302, 88 298
            C 88 302, 84 304, 80 302
            C 76 300, 76 296, 76 292
            C 76 298, 76 304, 76 310
            C 76 314, 74 316, 70 316
            C 66 316, 64 314, 64 310
            C 64 304, 62 296, 60 282
            L 58 264
            C 56 252, 54 240, 54 224
            L 54 186
            C 54 174, 56 162, 60 152
            L 76 132
            C 86 124, 96 120, 106 118
            L 106 112
            C 106 108, 108 104, 112 102
            L 112 98
            C 106 90, 102 78, 102 64
            C 102 40, 118 22, 140 22
            Z
          "
        />

        {/* organ dots — positioned anatomically on the outline */}
        {ORGANS.map(o => {
          const on = selected.has(o.id);
          // anatomical placements (chest, lungs, breast, abdomen, pelvis)
          const pos = {
            lungs:    { x: 116, y: 168 },  // left chest
            breast:   { x: 164, y: 178 },  // right pec
            colon:    { x: 140, y: 240 },  // mid-abdomen
            uterus:   { x: 128, y: 308 },  // pelvic, slightly left
            ovaries:  { x: 158, y: 308 },  // pelvic, slightly right
            cervix:   { x: 140, y: 332 },  // lower pelvis
            prostate: { x: 140, y: 348 },  // below pelvis
            testes:   { x: 140, y: 372 },  // groin
          };
          const p = pos[o.id];
          if (!p) return null;
          return (
            <g key={o.id} className={'bodymap-organ' + (on ? ' have' : '')} onClick={() => onToggle(o.id)} style={{ cursor: 'pointer' }}>
              <circle className="fill" cx={p.x} cy={p.y} r={on ? 17 : 11} />
              {on && <text className="label" x={p.x} y={p.y + 4} textAnchor="middle">{o.short}</text>}
            </g>
          );
        })}
      </svg>

      <div style={{
        position: 'absolute', top: 12, left: 12,
        background: 'var(--surface)', borderRadius: 99, padding: '5px 11px',
        fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: 'var(--ink-3)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>Tap to toggle</div>
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: 'var(--primary)', color: 'white', borderRadius: 99,
        padding: '5px 11px', fontSize: 11, fontWeight: 500,
      }}>{selected.size} selected</div>
    </div>
  );
}

function BodyOrganRow({ organ, on, expanded, onToggle }) {
  return (
    <button
      className={'opt checkbox' + (on ? ' selected' : '')}
      onClick={onToggle}
      style={{ alignItems: expanded ? 'flex-start' : 'center', padding: expanded ? '13px 16px' : '11px 16px' }}
    >
      <div className="opt-bullet" style={{ marginTop: expanded ? 2 : 0 }} />
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div className="body-sm" style={{ fontWeight: 500 }}>{organ.label}</div>
        {expanded && <div className="caption flash-in" style={{ marginTop: 4 }}>{organ.plain}</div>}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. History screen — smoking + family
// ─────────────────────────────────────────────────────────────
function HistoryScreen({ smoked, familyHistory, onChange, onNext, onBack, progress }) {
  return (
    <ScreenShell
      progress={progress}
      onBack={onBack}
      footer={<button className="btn primary full" onClick={onNext}>Build my guide</button>}>
      <div style={{ paddingTop: 4 }}>
        <div className="h-section" style={{ marginBottom: 10 }}>A few last things · 4 of 4</div>
        <div className="h-title" style={{ marginBottom: 8 }}>
          Two questions <span className="serif">about your history.</span>
        </div>
        <div className="caption" style={{ marginBottom: 24 }}>
          These change which screenings start earlier. Skip either if you’d rather not say.
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="body-sm" style={{ fontWeight: 500, marginBottom: 10 }}>
            Have you smoked regularly for 20 years or more?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ToggleBig label="Yes" selected={smoked === true} onClick={() => onChange({ smoked: true })} />
            <ToggleBig label="No"  selected={smoked === false} onClick={() => onChange({ smoked: false })} />
            <ToggleBig label="Skip" muted selected={smoked === null} onClick={() => onChange({ smoked: null })} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="body-sm" style={{ fontWeight: 500, marginBottom: 10 }}>
            Has a parent, sibling, or child had cancer?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ToggleBig label="Yes" selected={familyHistory === true} onClick={() => onChange({ familyHistory: true })} />
            <ToggleBig label="No"  selected={familyHistory === false} onClick={() => onChange({ familyHistory: false })} />
            <ToggleBig label="Not sure" muted selected={familyHistory === null} onClick={() => onChange({ familyHistory: null })} />
          </div>
        </div>

        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="h-section" style={{ marginBottom: 8 }}>Almost done</div>
          <div className="body-sm" style={{ color: 'var(--ink-2)' }}>
            We’ll generate a one-page guide. You can read it now, save it as a PDF, or bring it up on your phone at the appointment.
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function ToggleBig({ label, selected, muted, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 8px', borderRadius: 12,
      border: '1px solid ' + (selected ? 'var(--primary)' : 'var(--line-2)'),
      background: selected ? 'var(--primary)' : 'var(--surface)',
      color: selected ? 'white' : (muted ? 'var(--ink-3)' : 'var(--ink)'),
      fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
      cursor: 'pointer', transition: 'all 0.15s ease',
      boxShadow: selected ? '0 0 0 3px var(--primary-soft)' : 'none',
    }}>{label}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. Generating animation
// ─────────────────────────────────────────────────────────────
function GeneratingScreen({ onDone }) {
  const steps = [
    'Reading your answers…',
    'Matching to current guidelines…',
    'Writing your guide…',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setI(1), 900);
    const t2 = setTimeout(() => setI(2), 1900);
    const t3 = setTimeout(onDone, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  return (
    <div className="app-root" style={{
      width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      padding: 32, background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Soft ambient glow blobs */}
      <div className="gen-blob gen-blob-a" />
      <div className="gen-blob gen-blob-b" />

      {/* Animated rings + orbiting dots */}
      <div className="gen-stage" style={{ marginBottom: 36 }}>
        <div className="gen-ring gen-ring-1" />
        <div className="gen-ring gen-ring-2" />
        <div className="gen-ring gen-ring-3" />

        <div className="gen-orbit gen-orbit-1">
          <div className="gen-orbit-dot" />
        </div>
        <div className="gen-orbit gen-orbit-2">
          <div className="gen-orbit-dot gen-orbit-dot-clay" />
        </div>
        <div className="gen-orbit gen-orbit-3">
          <div className="gen-orbit-dot gen-orbit-dot-sage" />
        </div>

        {/* Center pulse */}
        <div className="gen-core">
          <div className="gen-core-inner" />
        </div>
      </div>

      {/* Step ladder — all three visible, current one highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start', minWidth: 240 }}>
        {steps.map((s, idx) => (
          <div key={idx} className="gen-step" data-state={idx < i ? 'done' : idx === i ? 'active' : 'pending'}>
            <div className="gen-step-icon">
              {idx < i ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : idx === i ? (
                <div className="gen-step-spin" />
              ) : (
                <div className="gen-step-pending" />
              )}
            </div>
            <div className="gen-step-label">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenShell, Progress,
  LanguageScreen,
  WelcomeScreen, IdentityScreen, AgeScreen,
  BodyMapScreen, HistoryScreen, GeneratingScreen,
  ColorScreen,
});

// ─────────────────────────────────────────────────────────────
// 7. Color picker — choose a personal accent color
// ─────────────────────────────────────────────────────────────
function ColorScreen({ value, themes, onPick, onContinue, onBack }) {
  const keys = Object.keys(themes);
  const cur = themes[value] || themes.teal;

  return (
    <div className="app-root color-screen" style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'var(--bg)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* live aura that shifts with chosen color */}
      <div className="color-aura" aria-hidden="true">
        <div className="color-aura-blob color-aura-blob-1" />
        <div className="color-aura-blob color-aura-blob-2" />
      </div>

      {/* Back button */}
      <div style={{ padding: '60px 22px 0', position: 'relative', zIndex: 2 }}>
        <button onClick={onBack} className="back-link" aria-label="Back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Headline */}
      <div style={{ padding: '24px 28px 0', position: 'relative', zIndex: 2 }}>
        <div className="caption" style={{
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 12, fontWeight: 500, fontSize: 11,
        }}>
          Make it yours
        </div>
        <div style={{
          fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.02em',
          color: 'var(--ink)', marginBottom: 12, fontWeight: 500,
        }}>
          Pick a color <span className="serif">that feels like you.</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 320 }}>
          This is your guide. Choose the mood — we’ll carry it through every screen.
        </div>
      </div>

      {/* Live preview card */}
      <div style={{ padding: '32px 22px 0', position: 'relative', zIndex: 2 }}>
        <div className="color-preview-card">
          <div className="color-preview-meta">
            <div className="color-preview-dot" style={{ background: cur['--primary'] }} />
            <div>
              <div className="color-preview-label">{cur.label.split(' · ')[0]}</div>
              <div className="color-preview-mood">{cur.label.split(' · ')[1] || ''}</div>
            </div>
          </div>
          <div className="color-preview-sample">
            <span className="color-preview-italic">made for your body,</span>
            <br />
            backed by guidelines.
          </div>
          <div className="color-preview-pill">
            <span className="color-preview-pill-dot" style={{ background: cur['--primary'] }} />
            Sample chip
          </div>
        </div>
      </div>

      {/* Color swatches */}
      <div style={{ padding: '24px 22px 0', position: 'relative', zIndex: 2 }}>
        <div className="color-swatch-row">
          {keys.map((k) => {
            const th = themes[k];
            const active = k === value;
            return (
              <button
                key={k}
                onClick={() => onPick(k)}
                className={'color-swatch' + (active ? ' is-active' : '')}
                aria-pressed={active}
                aria-label={th.label}
              >
                <span className="color-swatch-ring" style={{
                  background: th['--primary'],
                  boxShadow: active
                    ? `0 0 0 3px var(--surface), 0 0 0 5px ${th['--primary']}`
                    : 'none',
                }} />
                <span className="color-swatch-name">{th.label.split(' · ')[0]}</span>
                <span className="color-swatch-mood">{th.label.split(' · ')[1] || ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Continue */}
      <div className="footer-cta" style={{ position: 'relative', zIndex: 2 }}>
        <button className="btn primary full" onClick={onContinue}>
          Continue
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{
          textAlign: 'center', fontSize: 11, color: 'var(--ink-3)',
          marginTop: 10, fontStyle: 'italic',
        }}>
          You can change this anytime.
        </div>
      </div>
    </div>
  );
}
