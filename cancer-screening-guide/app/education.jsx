// education.jsx — health education content with stats + citations + prevention interventions

const { useState: useStateE, useEffect: useEffectE } = React;

// ── Animated number counter ─────────────────────────────────
function CountUp({ to, suffix = '', duration = 1100 }) {
  const [n, setN] = useStateE(0);
  useEffectE(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  const decimals = to % 1 !== 0 ? 1 : 0;
  return <span>{n.toFixed(decimals)}{suffix}</span>;
}

// ── Stats curated to relevant organs ────────────────────────
const STATS = [
  {
    organ: 'breast',
    big: 13, suffix: '%',
    label: 'reduction in breast cancer mortality from regular mammograms',
    cite: 'American Cancer Society, 2024',
    detail: 'Mammograms have meaningfully cut deaths from breast cancer. Anyone with breast tissue benefits — including trans women on long-term estrogen.',
  },
  {
    organ: 'cervix',
    big: 3.3, suffix: '×',
    label: 'less likely: trans men with cervix who report discrimination skip cervical screening',
    cite: 'Johnson et al., 2016',
    detail: 'Stigma in clinic is the #1 reason cervical screening gets skipped — not the medical procedure itself.',
  },
  {
    organ: 'prostate',
    big: 99, suffix: '%',
    label: 'of trans women retain their prostate, even after gender-affirming surgery',
    cite: 'ACS LGBTQ Fact Sheet, 2024',
    detail: 'Vaginoplasty does not remove the prostate. PSA screening conversations still apply.',
  },
  {
    organ: 'colon',
    big: 13, suffix: '%',
    label: 'reduction in colorectal cancer mortality from screening',
    cite: 'Cao et al., Transl Androl Urol, 2021',
    detail: 'A simple at-home stool test once a year is one of the most effective things in preventive medicine.',
  },
  {
    organ: 'lungs',
    big: 14, suffix: '%',
    label: 'reduction in lung cancer mortality from low-dose CT screening',
    cite: 'NLST, 2011',
    detail: 'For people with significant smoking history, this is one of few screenings that demonstrably saves lives.',
  },
];

const BARRIERS = [
  { stat: 30, suffix: '%', label: 'of transgender people delay or avoid medical care because of past discrimination', cite: 'Center for American Progress survey' },
  { stat: 65, suffix: '%', label: 'of LGBTQ+ adults are unsure which screenings they should receive', cite: 'Kratzer et al., Cancer, 2024' },
  { stat: 70, suffix: '%', label: 'are unsure when to begin screening', cite: 'Kratzer et al., Cancer, 2024' },
];

const INTERVENTIONS = [
  {
    icon: 'shield',
    title: 'Bring this guide',
    body: 'Patients who arrive with an organ inventory get the right screenings far more often. The conversation starts grounded.',
  },
  {
    icon: 'chat',
    title: 'Ask: “What screenings do you recommend for someone with my anatomy?”',
    body: 'This phrasing works better than gender-based phrasing — it points the doctor to guidelines, not assumptions.',
  },
  {
    icon: 'self',
    title: 'Self-swab options',
    body: 'Many clinics now offer self-collected HPV swabs as an alternative to a speculum exam. You can ask.',
  },
  {
    icon: 'partner',
    title: 'Bring a support person',
    body: 'You can ask for a chaperone or bring a friend. This is a normal, reasonable request — not unusual.',
  },
];

// ── Main "Learn" view ───────────────────────────────────────
function LearnView({ data }) {
  const userOrgans = data.organs;
  // pick stats relevant to the user's organs (max 3)
  const relevantStats = STATS.filter(s => userOrgans.has(s.organ)).slice(0, 3);
  // fallback if user has none of the matched organs
  const showStats = relevantStats.length > 0 ? relevantStats : STATS.slice(0, 3);

  return (
    <div style={{ padding: '0 22px' }}>
      {/* Lead message */}
      <div className="card fade-in" style={{ marginBottom: 18, background: 'var(--surface)', padding: 18 }}>
        <div className="h-section" style={{ marginBottom: 10 }}>Why this matters</div>
        <div className="body-sm" style={{ lineHeight: 1.55, color: 'var(--ink-2)' }}>
          Cancer screening reduces deaths — sometimes dramatically. But for many people, especially trans, nonbinary, and intersex individuals, screening rates lag behind the general population. Here’s what the data says, and what helps.
        </div>
      </div>

      {/* Numbers section — relevant to user */}
      <div className="h-section" style={{ marginBottom: 4, marginLeft: 2 }}>For your body</div>
      <div className="caption" style={{ marginBottom: 14, marginLeft: 2 }}>
        Stats that connect to the screenings on your guide.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
        {showStats.map((s, i) => <StatCard key={s.organ} stat={s} delay={i * 80} />)}
      </div>

      {/* Barriers — present visually */}
      <div className="h-section" style={{ marginBottom: 4, marginLeft: 2 }}>The screening gap</div>
      <div className="caption" style={{ marginBottom: 14, marginLeft: 2 }}>
        Why so many people delay screening.
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 26 }}>
        {BARRIERS.map((b, i) => (
          <BarRow key={i} stat={b} delay={i * 120} isLast={i === BARRIERS.length - 1} />
        ))}
      </div>

      {/* Prevention interventions */}
      <div className="h-section" style={{ marginBottom: 4, marginLeft: 2 }}>What helps</div>
      <div className="caption" style={{ marginBottom: 14, marginLeft: 2 }}>
        Small things, individually proven.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {INTERVENTIONS.map((iv, i) => <InterventionCard key={i} iv={iv} delay={i * 90} />)}
      </div>

      {/* Sources */}
      <div style={{
        marginTop: 12, padding: '14px 16px', background: 'var(--surface-2)',
        border: '1px solid var(--line)', borderRadius: 12,
      }}>
        <div className="h-section" style={{ marginBottom: 8 }}>Sources</div>
        <div className="caption" style={{ lineHeight: 1.5, color: 'var(--ink-2)' }}>
          American Cancer Society, <em>Cancer Facts & Figures 2024</em>, Special Section on LGBTQ+. Kratzer T et al., <em>Cancer</em>, 2024. Johnson MJ, Mueller M, et al., 2016. Cao W et al., <em>Transl Androl Urol</em>, 2021. National Lung Screening Trial, <em>NEJM</em>, 2011. Mahal AR et al., systematic review, <em>BMJ Public Health</em>, 2024.
        </div>
      </div>
    </div>
  );
}

// ── Stat card with animated number ──────────────────────────
function StatCard({ stat, delay = 0 }) {
  const [ready, setReady] = useStateE(false);
  useEffectE(() => { const t = setTimeout(() => setReady(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div className="card fade-in" style={{ animationDelay: `${delay}ms`, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <div style={{
          fontFamily: 'Newsreader, serif', fontSize: 56, fontWeight: 400,
          lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--primary)',
        }}>
          {ready ? <CountUp to={stat.big} suffix={stat.suffix} /> : '0' + stat.suffix}
        </div>
      </div>
      <div className="body-sm" style={{ fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>
        {stat.label}
      </div>
      <div className="caption" style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 10 }}>
        {stat.detail}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 1, background: 'var(--ink-3)' }} />
        <div className="caption" style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          {stat.cite}
        </div>
      </div>
    </div>
  );
}

// ── Animated bar row ────────────────────────────────────────
function BarRow({ stat, delay = 0, isLast }) {
  const [w, setW] = useStateE(0);
  useEffectE(() => {
    const t = setTimeout(() => setW(stat.stat), delay + 200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      padding: '14px 16px', borderBottom: isLast ? 'none' : '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <div className="mono" style={{
          fontSize: 22, fontWeight: 600, color: 'var(--accent)',
          minWidth: 56, letterSpacing: '-0.02em',
        }}>
          <CountUp to={stat.stat} suffix={stat.suffix} duration={900} />
        </div>
        <div className="body-sm" style={{ flex: 1, lineHeight: 1.4, color: 'var(--ink)' }}>
          {stat.label}
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${w}%`, height: '100%', background: 'var(--accent)',
          transition: 'width 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }} />
      </div>
      <div className="caption" style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
        {stat.cite}
      </div>
    </div>
  );
}

// ── Intervention card ───────────────────────────────────────
function InterventionCard({ iv, delay = 0 }) {
  const icons = {
    shield: <path d="M11 2l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V5l8-3z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>,
    chat:   <path d="M3 6a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3H9l-4 4v-4H6a3 3 0 01-3-3V6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>,
    self:   <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><circle cx="11" cy="6" r="3"/><path d="M5 19c0-3 3-6 6-6s6 3 6 6"/></g>,
    partner:<g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><circle cx="7" cy="7" r="2.5"/><circle cx="15" cy="7" r="2.5"/><path d="M2 17c0-3 2-5 5-5s5 2 5 5M10 17c0-3 2-5 5-5s5 2 5 5"/></g>,
  };
  return (
    <div className="card fade-in" style={{
      animationDelay: `${delay}ms`,
      padding: 14, display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'var(--primary-soft)', color: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 22 22">{icons[iv.icon]}</svg>
      </div>
      <div style={{ flex: 1, paddingTop: 2 }}>
        <div className="body-sm" style={{ fontWeight: 500, marginBottom: 4, lineHeight: 1.35 }}>{iv.title}</div>
        <div className="caption" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>{iv.body}</div>
      </div>
    </div>
  );
}

Object.assign(window, { LearnView, CountUp });
