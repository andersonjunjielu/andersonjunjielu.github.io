// web-app.jsx — main controller for the desktop web version.
// Two-column layout: left stepper, right question card.
// Visual continuity with mobile: aura blobs, themes, Newsreader italic.

const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

// ─── Themes (4 — matches mobile) ──────────────────────────────────
const WEB_THEMES = {
  teal: {
    label: 'Teal', mood: 'clinical, calm',
    '--bg': '#F4F1EC', '--surface': '#FFFFFF', '--surface-2': '#FAF7F2',
    '--ink': '#1B2530', '--ink-2': '#4A5560', '--ink-3': '#8A8F96',
    '--line': 'rgba(27,37,48,0.08)', '--line-2': 'rgba(27,37,48,0.14)',
    '--primary': '#2F5D5A', '--primary-soft': '#E8EFEE', '--accent': '#D4623A',
  },
  midnight: {
    label: 'Midnight', mood: 'serious, grounded',
    '--bg': '#F1F2F4', '--surface': '#FFFFFF', '--surface-2': '#F7F8FA',
    '--ink': '#0E1320', '--ink-2': '#3F485C', '--ink-3': '#8A92A3',
    '--line': 'rgba(14,19,32,0.07)', '--line-2': 'rgba(14,19,32,0.13)',
    '--primary': '#1F2A4A', '--primary-soft': '#E5E8F2', '--accent': '#C5523F',
  },
  sage: {
    label: 'Sage', mood: 'soft, alive',
    '--bg': '#F1F0EA', '--surface': '#FFFFFF', '--surface-2': '#F9F8F2',
    '--ink': '#26302A', '--ink-2': '#4F5C53', '--ink-3': '#8B968D',
    '--line': 'rgba(38,48,42,0.07)', '--line-2': 'rgba(38,48,42,0.14)',
    '--primary': '#5A7355', '--primary-soft': '#E9EFE5', '--accent': '#B8704A',
  },
  plum: {
    label: 'Plum', mood: 'warm, intimate',
    '--bg': '#F4EFEC', '--surface': '#FFFFFF', '--surface-2': '#FBF6F3',
    '--ink': '#231722', '--ink-2': '#503B49', '--ink-3': '#94808F',
    '--line': 'rgba(35,23,34,0.07)', '--line-2': 'rgba(35,23,34,0.13)',
    '--primary': '#6E3A5E', '--primary-soft': '#F0E5EC', '--accent': '#C28A3C',
  },
};

function applyWebTheme(name) {
  const root = document.documentElement;
  const t = WEB_THEMES[name] || WEB_THEMES.teal;
  Object.entries(t).forEach(([k, v]) => {
    if (k.startsWith('--')) root.style.setProperty(k, v);
  });
}

// ─── Languages ────────────────────────────────────────────────────
const WEB_LANGUAGES = [
  { code: 'en', label: 'English',     hello: 'Hello',     native: 'English' },
  { code: 'es', label: 'Spanish',     hello: 'Hola',      native: 'Español' },
  { code: 'zh', label: 'Chinese',     hello: '你好',       native: '中文' },
  { code: 'fr', label: 'French',      hello: 'Bonjour',   native: 'Français' },
  { code: 'pt', label: 'Portuguese',  hello: 'Olá',       native: 'Português' },
  { code: 'ar', label: 'Arabic',      hello: 'مرحبا',     native: 'العربية' },
  { code: 'vi', label: 'Vietnamese',  hello: 'Xin chào',  native: 'Tiếng Việt' },
  { code: 'ko', label: 'Korean',      hello: '안녕하세요',   native: '한국어' },
  { code: 'tl', label: 'Tagalog',     hello: 'Kumusta',   native: 'Tagalog' },
  { code: 'ru', label: 'Russian',     hello: 'Привет',    native: 'Русский' },
];

// Floating background "hello"s — placed AROUND the central content stack
// so they never overlap the headline / picker / CTA. Positions tuned for
// a wide (1280px+) desktop viewport.
const WEB_FLOAT_HELLOS = [
  // top band
  { text: 'Hello',     x: '8%',  y: '14%', size: 38, delay: 0 },
  { text: 'Hola',      x: '88%', y: '12%', size: 36, delay: 1.2 },
  { text: '你好',       x: '22%', y: '24%', size: 44, delay: 2.4 },
  { text: 'Bonjour',   x: '74%', y: '22%', size: 32, delay: 3.6 },
  { text: 'Olá',       x: '50%', y: '8%',  size: 30, delay: 4.8 },
  { text: 'こんにちは',   x: '6%',  y: '32%', size: 28, delay: 6.0 },
  // sides
  { text: 'مرحبا',      x: '4%',  y: '52%', size: 36, delay: 7.2 },
  { text: 'Привет',    x: '94%', y: '46%', size: 34, delay: 8.4 },
  { text: 'नमस्ते',      x: '8%',  y: '70%', size: 32, delay: 9.6 },
  { text: 'Ciao',      x: '92%', y: '68%', size: 34, delay: 10.8 },
  // bottom band
  { text: 'Xin chào',  x: '18%', y: '84%', size: 32, delay: 12.0 },
  { text: '안녕하세요',   x: '76%', y: '86%', size: 28, delay: 13.2 },
  { text: 'Kumusta',   x: '38%', y: '90%', size: 30, delay: 14.4 },
  { text: 'Hej',       x: '60%', y: '92%', size: 32, delay: 15.6 },
  { text: 'Salām',     x: '50%', y: '78%', size: 28, delay: 16.8 },
];

// ─── Steps ────────────────────────────────────────────────────────
const WEB_STEPS = [
  { id: 'sex',         label: 'Sex at birth' },
  { id: 'gender',      label: 'Gender' },
  { id: 'pronouns',    label: 'Pronouns' },
  { id: 'orientation', label: 'Orientation' },
  { id: 'race',        label: 'Race / ethnicity' },
  { id: 'age',         label: 'Age' },
  { id: 'body',        label: 'Body inventory' },
  { id: 'hpv',         label: 'HPV vaccine' },
  { id: 'family',      label: 'Family history' },
  { id: 'smoking',     label: 'Smoking' },
];
const STEP_IDS = WEB_STEPS.map(s => s.id);

// ─── Per-step copy ────────────────────────────────────────────────
const STEP_COPY = {
  sex: {
    title: <span>What sex were you <em>assigned at birth?</em></span>,
    sub: 'This is a starting point only — we\'ll confirm your actual anatomy in a few steps.',
    whyTitle: 'Why we ask',
    why: 'Many medical screening tables still use sex assigned at birth. We use it as a hint to pre-fill your body inventory, then ask about each organ directly.',
  },
  gender: {
    title: <span>How do you describe <em>your gender?</em></span>,
    sub: 'Pick anything that fits. You can choose more than one.',
    whyTitle: 'Why we ask',
    why: 'Gender shapes how your guide and doctor handoff are written. It does not, by itself, decide which screenings you need.',
  },
  pronouns: {
    title: <span>What are <em>your pronouns?</em></span>,
    sub: 'Pick all that apply.',
    whyTitle: 'Why we ask',
    why: 'So your guide and the doctor handoff use language that feels right.',
  },
  orientation: {
    title: <span>What is <em>your sexual orientation?</em></span>,
    sub: 'Pick all that apply.',
    whyTitle: 'Why we ask',
    why: 'Some sexual health screenings (HPV, anal, STI) are recommended based on the kinds of sex a person has. We never assume from this answer alone.',
  },
  race: {
    title: <span>What race or ethnicity <em>describes you?</em></span>,
    sub: 'Pick all that apply. This is optional.',
    whyTitle: 'Why we ask',
    why: 'Some cancers (prostate, stomach, liver) have different rates in different communities. Sharing this is optional — your guide works without it.',
  },
  age: {
    title: <span>How old <em>are you?</em></span>,
    sub: 'Most screening guidelines use age to decide when to start and stop.',
    whyTitle: 'Why we ask',
    why: 'Most cancer screening guidelines use age to set the start, stop, and frequency of screening. Your doctor relies on this for the timing tables.',
  },
  body: {
    title: <span>About <em>your body.</em></span>,
    sub: 'Choose the current state of each part. Nothing is filled in for you — every body is different, so we ask directly.',
    whyTitle: 'Why we ask each part',
    why: 'Cancer screening matches anatomy, not gender. A trans woman keeps her prostate; a trans man with a cervix still needs cervical screening. We ask each part separately so nothing is assumed.',
  },
  hpv: {
    title: <span>Did you get <em>the HPV vaccine?</em></span>,
    sub: 'It\'s okay if you don\'t remember. The vaccine prevents most cervical, anal, and some throat cancers.',
    whyTitle: 'Why this matters',
    why: 'HPV vaccination changes how often cervical screening is recommended. Full series typically allows a 5-year cadence; otherwise 3 years.',
  },
  family: {
    title: <span>Has anyone in <em>your family</em> had cancer?</span>,
    sub: 'Blood relatives only. Pick all that apply.',
    whyTitle: 'Why we ask',
    why: 'A close blood relative with breast, ovarian, colon, or prostate cancer can mean you should start screening earlier or talk to a genetic counselor.',
  },
  smoking: {
    title: <span>Have you ever <em>smoked regularly?</em></span>,
    sub: 'Lung cancer screening depends on this.',
    whyTitle: 'Why we ask',
    why: 'Lung cancer screening (low-dose CT) is recommended for adults 50–80 with a 20+ pack-year smoking history. Honest answers make the difference.',
  },
};

// ─── Aura background (3 drifting blobs) ───────────────────────────
function Aura() {
  return (
    <div className="aura-wrap" aria-hidden="true">
      <div className="aura aura-1"></div>
      <div className="aura aura-2"></div>
      <div className="aura aura-3"></div>
    </div>
  );
}

// ─── Theme picker (top-right pill) ────────────────────────────────
function ThemePicker({ theme, onChange }) {
  const [open, setOpen] = useStateW(false);
  const ref = useRefW(null);

  useEffectW(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="theme-pill" onClick={() => setOpen(o => !o)} aria-label="Change theme">
        <span className="theme-swatch"></span>
        <span className="theme-pill-label">{WEB_THEMES[theme].label}</span>
      </button>
      {open && (
        <div className="theme-pill-popover">
          {Object.entries(WEB_THEMES).map(([key, t]) => (
            <button
              key={key}
              className={"theme-pill-row" + (key === theme ? " is-active" : "")}
              onClick={() => { onChange(key); setOpen(false); }}>
              <span className="theme-swatch" style={{ background: t['--primary'] }}></span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Language screen — floating multilingual hellos + dropdown pill ──
function LanguageScreen({ onPick }) {
  const [chosen, setChosen] = useStateW('en');
  const [open, setOpen] = useStateW(false);
  const ref = useRefW(null);

  useEffectW(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const cur = WEB_LANGUAGES.find(l => l.code === chosen);

  return (
    <div className="lang-stage fade-in">
      {/* Floating multilingual hellos in the background */}
      <div className="hello-field" aria-hidden="true">
        {WEB_FLOAT_HELLOS.map((h, i) => (
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

      {/* Center stack */}
      <div className="lang-center">
        <div className="lang-clinic">Cancer Screening Guide · 2026</div>
        <h1 className="lang-headline">
          <span className="serif">Welcome.</span>
        </h1>
        <p className="lang-sub">
          Pick your language to begin.
        </p>

        {/* Dropdown pill */}
        <div ref={ref} style={{ position: 'relative', marginTop: 28 }}>
          <button
            onClick={() => setOpen(o => !o)}
            className="lang-pill-big"
            aria-expanded={open}>
            <span className="lang-pill-hello">{cur.hello}</span>
            <span className="lang-pill-native">{cur.native}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{
              transition: 'transform 0.25s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
              color: 'var(--ink-3)', marginLeft: 4,
            }}>
              <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div className="lang-dropdown-big">
              {WEB_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setChosen(lang.code); setOpen(false); }}
                  className={'lang-dd-row-big' + (chosen === lang.code ? ' is-chosen' : '')}>
                  <span className="lang-dd-hello">{lang.hello}</span>
                  <span className="lang-dd-native">{lang.native}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="welcome-cta" style={{ marginTop: 32 }} onClick={() => onPick(chosen)}>
          Continue in {cur.native}
        </button>
      </div>
    </div>
  );
}

// ─── Welcome screen — large serif greeting after language pick ───
function WelcomeScreen({ onContinue }) {
  return (
    <div className="welcome-stage fade-in">
      <div className="welcome-clinic">Cancer Screening Guide · 2026</div>

      <h1 className="welcome-headline">
        <span>Screening for </span>
        <em>every body.</em>
      </h1>

      <p className="welcome-lede">
        A few quiet questions about your body and history.
        We'll generate a personalized screening guide and a
        printable summary you can take to your doctor.
      </p>

      <button className="welcome-cta" onClick={onContinue}>
        Begin
      </button>

      <div className="welcome-meta">
        <div className="welcome-meta-item">
          <span className="welcome-meta-key">Time</span>
          <span>About 3 minutes</span>
        </div>
        <div className="welcome-meta-item">
          <span className="welcome-meta-key">Privacy</span>
          <span>Stays on your device</span>
        </div>
        <div className="welcome-meta-item">
          <span className="welcome-meta-key">Output</span>
          <span>Printable summary</span>
        </div>
      </div>
    </div>
  );
}

// ─── Color picker screen — 4 swatches with live preview ───────────
function ColorScreen({ value, onPick, onContinue, onBack }) {
  const keys = Object.keys(WEB_THEMES);
  const cur = WEB_THEMES[value] || WEB_THEMES.teal;

  return (
    <div className="color-stage fade-in">
      <div className="color-clinic">Make it yours · Step 0 of {WEB_STEPS.length}</div>

      <h1 className="color-headline">
        Pick a color <em>that feels like you.</em>
      </h1>
      <p className="color-sub">
        This is your guide. Choose the mood — we'll carry it through every screen.
        You can change this anytime.
      </p>

      <div className="color-grid">
        {/* Live preview card on the left */}
        <div className="color-preview-big">
          <div className="color-preview-meta">
            <div className="color-preview-dot-big" style={{ background: cur['--primary'] }} />
            <div>
              <div className="color-preview-name">{cur.label}</div>
              <div className="color-preview-mood-big">{cur.mood}</div>
            </div>
          </div>
          <div className="color-preview-sample-big">
            <span className="color-preview-italic-big">made for your body,</span>
            <br />
            backed by guidelines.
          </div>
          <div className="color-preview-pill-big">
            <span className="color-preview-pill-dot" style={{ background: cur['--primary'] }} />
            <span>Sample chip</span>
          </div>
        </div>

        {/* Swatches on the right */}
        <div className="color-swatches-big">
          {keys.map((k) => {
            const th = WEB_THEMES[k];
            const active = k === value;
            return (
              <button
                key={k}
                onClick={() => onPick(k)}
                className={'color-swatch-big' + (active ? ' is-active' : '')}
                aria-pressed={active}>
                <span className="color-swatch-ring-big" style={{
                  background: th['--primary'],
                  boxShadow: active
                    ? `0 0 0 4px var(--surface), 0 0 0 6px ${th['--primary']}`
                    : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                }} />
                <span className="color-swatch-name-big">{th.label}</span>
                <span className="color-swatch-mood-big">{th.mood}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="color-foot">
        <button className="btn btn-text with-arrow" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
}

// ─── Generating screen ───────────────────────────────────────────
function GeneratingScreen({ onDone }) {
  useEffectW(() => {
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="generating-stage fade-in">
      <div className="generating-spinner" />
      <p>Building your screening guide…</p>
    </div>
  );
}

// ─── Stepper (left rail) ─────────────────────────────────────────
function Stepper({ currentStep, completed, onJump, currentCopy }) {
  const idx = STEP_IDS.indexOf(currentStep);
  return (
    <aside className="stepper">
      <div className="stepper-progress">
        Step {Math.max(idx, 0) + 1} of {STEP_IDS.length}
      </div>
      <div className="stepper-list">
        {WEB_STEPS.map((s, i) => {
          const isCurrent = s.id === currentStep;
          const isDone = completed.has(s.id) && !isCurrent;
          return (
            <button key={s.id} type="button"
              className={"stepper-item" +
                (isCurrent ? " is-current" : "") +
                (isDone ? " is-done" : "")}
              onClick={() => isDone && onJump(s.id)}
              disabled={!isDone && !isCurrent}
              style={{ cursor: isDone ? 'pointer' : (isCurrent ? 'default' : 'not-allowed') }}>
              <span className="stepper-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {currentCopy && (
        <div className="stepper-context">
          <div className="stepper-context-title">{currentCopy.whyTitle}</div>
          <p>{currentCopy.why}</p>
        </div>
      )}
    </aside>
  );
}

// ─── Main App ────────────────────────────────────────────────────
function WebApp() {
  // Phase: 'language' | 'welcome' | 'color' | 'intake' | 'review' | 'generating' | 'results'
  const [phase, setPhase] = useStateW('language');
  const [step, setStep] = useStateW('sex');
  const [completed, setCompleted] = useStateW(new Set());
  const [aboutOpen, setAboutOpen] = useStateW(false);
  const [theme, setTheme] = useStateW('teal');
  const [language, setLanguage] = useStateW('en');

  // Form data
  const [sex, setSex] = useStateW(null);
  const [genders, setGenders] = useStateW([]);
  const [pronouns, setPronouns] = useStateW([]);
  const [orientations, setOrientations] = useStateW([]);
  const [races, setRaces] = useStateW([]);
  const [age, setAge] = useStateW(35);
  const [organStates, setOrganStates] = useStateW({});
  const [hpv, setHpv] = useStateW(null);
  const [familyMembers, setFamilyMembers] = useStateW([]);
  const [smoked, setSmoked] = useStateW(undefined);

  // Apply theme reactively
  useEffectW(() => { applyWebTheme(theme); }, [theme]);

  const stepIdx = STEP_IDS.indexOf(step);

  // Mark current step done and advance
  const advance = () => {
    setCompleted((prev) => new Set([...prev, step]));
    if (stepIdx < STEP_IDS.length - 1) {
      setStep(STEP_IDS[stepIdx + 1]);
    } else {
      setPhase('review');
    }
  };
  const goBack = () => {
    if (stepIdx > 0) {
      setStep(STEP_IDS[stepIdx - 1]);
    } else {
      setPhase('welcome');
    }
  };
  const jumpTo = (id) => {
    if (completed.has(id)) {
      setStep(id);
      setPhase('intake');
    }
  };

  // Edit from review screen
  const editFromReview = (id) => {
    setStep(id);
    setPhase('intake');
  };

  const startOver = () => {
    setSex(null); setGenders([]); setPronouns([]); setOrientations([]); setRaces([]);
    setAge(35); setOrganStates({}); setHpv(null); setFamilyMembers([]); setSmoked(undefined);
    setCompleted(new Set());
    setStep('sex');
    setPhase('language');
  };

  // ─ Render the current question (in 'intake' phase)
  const renderQuestion = () => {
    const copy = STEP_COPY[step];
    const cardProps = {
      stepIdx, total: STEP_IDS.length,
      title: copy.title, subtitle: copy.sub,
      onBack: goBack,
      onNext: advance,
    };

    switch (step) {
      case 'sex':
        return <QCard {...cardProps} nextDisabled={!sex}>
          <OptList options={SEX_AT_BIRTH} value={sex} onChange={setSex} />
        </QCard>;
      case 'gender':
        return <QCard {...cardProps} nextDisabled={(genders || []).length === 0}>
          <OptList options={GENDERS} value={genders} onChange={setGenders} multi exclusive={['skip']} grid />
        </QCard>;
      case 'pronouns':
        return <QCard {...cardProps} nextDisabled={(pronouns || []).length === 0}>
          <OptList options={PRONOUNS} value={pronouns} onChange={setPronouns} multi exclusive={['skip']} grid />
        </QCard>;
      case 'orientation':
        return <QCard {...cardProps} nextDisabled={(orientations || []).length === 0}>
          <OptList options={ORIENTATIONS} value={orientations} onChange={setOrientations} multi exclusive={['skip']} grid />
        </QCard>;
      case 'race':
        return <QCard {...cardProps} nextDisabled={(races || []).length === 0}>
          <OptList options={RACES} value={races} onChange={setRaces} multi exclusive={['skip']} grid />
        </QCard>;
      case 'age':
        return <AgeScreen {...cardProps}
          nextDisabled={!age || age < 18}
          value={age} onChange={setAge} />;
      case 'body':
        return <BodyScreen {...cardProps}
          nextDisabled={Object.keys(organStates).length === 0}
          value={organStates} onChange={setOrganStates} sex={sex} />;
      case 'hpv':
        return <QCard {...cardProps} nextDisabled={!hpv}>
          <OptList options={[
            { id: 'yes',     label: 'Yes, full series' },
            { id: 'partial', label: 'Yes, but not the full series' },
            { id: 'no',      label: 'No' },
            { id: 'unsure',  label: 'I don\'t know' },
            { id: 'skip',    label: 'Prefer not to say' },
          ]} value={hpv} onChange={setHpv} />
        </QCard>;
      case 'family':
        return <QCard {...cardProps} nextDisabled={(familyMembers || []).length === 0}>
          <OptList options={FAMILY} value={familyMembers} onChange={setFamilyMembers}
            multi exclusive={['none']} grid />
        </QCard>;
      case 'smoking':
        const smokedKey = smoked === true ? 'long' : smoked === 'some' ? 'some' : smoked === false ? 'no' : smoked === null ? 'skip' : null;
        return <QCard {...cardProps} nextDisabled={!smokedKey} nextLabel="Continue to review">
          <OptList options={[
            { id: 'long', label: 'Yes — 20+ years' },
            { id: 'some', label: 'Yes, but less than 20 years' },
            { id: 'no',   label: 'No, never regularly' },
            { id: 'skip', label: 'Prefer not to say' },
          ]} value={smokedKey}
          onChange={(v) => {
            if (v === 'long') setSmoked(true);
            else if (v === 'some') setSmoked('some');
            else if (v === 'no') setSmoked(false);
            else setSmoked(null);
          }} />
        </QCard>;
      default:
        return null;
    }
  };

  // Build screening data for results
  const organsForBuild = organsFromStates(organStates);
  const familyHistoryBool = (familyMembers || []).length > 0 && !familyMembers.includes('none');
  const identityLabel = (genders || []).map(id => GENDERS.find(g => g.id === id)?.label).filter(Boolean).join(', ') || '—';

  // ─ Topbar (always present, but hidden on language screen)
  const topbar = phase === 'language' ? null : (
    <header className="topbar">
      <div className="topbar-mark">
        <span className="dot"></span>
        <a href="../">Cancer Screening <span className="ital">Guide</span></a>
        <span className="sep">/</span>
        <span>Web</span>
      </div>
      <div className="topbar-actions">
        <button className="topbar-link" onClick={() => setAboutOpen(true)}>About</button>
        <button className="topbar-link" onClick={() => setPhase('color')}>Color</button>
        <a className="topbar-link" href="../" style={{ textDecoration: 'none' }}>Landing</a>
        <ThemePicker theme={theme} onChange={setTheme} />
      </div>
    </header>
  );

  // ─ Render by phase
  let content;
  if (phase === 'language') {
    content = <LanguageScreen onPick={(lang) => { setLanguage(lang); setPhase('welcome'); }} />;
  } else if (phase === 'welcome') {
    content = <WelcomeScreen onContinue={() => setPhase('color')} />;
  } else if (phase === 'color') {
    content = <ColorScreen
      value={theme}
      onPick={setTheme}
      onContinue={() => { setPhase('intake'); setStep('sex'); }}
      onBack={() => setPhase('welcome')} />;
  } else if (phase === 'intake') {
    content = (
      <main className="stage">
        <Stepper currentStep={step} completed={completed} onJump={jumpTo} currentCopy={STEP_COPY[step]} />
        <div>
          {renderQuestion()}
        </div>
      </main>
    );
  } else if (phase === 'review') {
    content = (
      <main className="stage">
        <Stepper currentStep="review" completed={new Set(STEP_IDS)} onJump={jumpTo}
          currentCopy={{ whyTitle: 'Almost done', why: 'Review your answers, edit anything that\'s off, and we\'ll generate your screening guide.' }} />
        <div>
          <ReviewScreen
            stepIdx={STEP_IDS.length}
            total={STEP_IDS.length}
            data={{ sex, genders, pronouns, orientations, races, age, organStates, hpv, familyMembers, smoked }}
            onEdit={editFromReview}
            onBack={() => { setPhase('intake'); setStep('smoking'); }}
            onContinue={() => setPhase('generating')} />
        </div>
      </main>
    );
  } else if (phase === 'generating') {
    content = <GeneratingScreen onDone={() => setPhase('results')} />;
  } else if (phase === 'results') {
    content = <ResultsPage
      data={{
        age,
        identityLabel,
        organs: organsForBuild.size > 0 ? organsForBuild : new Set(['colon','lungs']),
        smoked: smoked === true,
        familyHistory: familyHistoryBool,
        hpv,
      }}
      onRestart={startOver}
      onPrint={() => window.print()} />;
  }

  return (
    <React.Fragment>
      <Aura />
      {topbar}
      {content}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<WebApp />);
