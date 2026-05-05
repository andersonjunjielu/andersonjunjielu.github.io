// guide.jsx — the personalized guide screen (result)

const { useState: useStateG, useMemo: useMemoG } = React;

function GuideScreen({ data, onRestart, theme, themes, onThemeChange }) {
  const recs = useMemoG(() => buildScreenings({
    organs: data.organs,
    age: data.age,
    smoked: data.smoked,
    familyHistory: data.familyHistory,
  }), [data]);

  const [tab, setTab] = useStateG('me'); // me | doctor

  const identityLabel = (IDENTITIES.find(i => i.id === data.identity) || {}).label || 'Not specified';
  const organList = ORGANS.filter(o => data.organs.has(o.id)).map(o => o.short);

  const exportPDF = async () => {
    const payload = {
      identityLabel,
      pronouns: data.pronouns || '',
      age: data.age,
      organList,
      hpv: data.hpv,
      smoked: data.smoked,
      familyMembers: data.familyMembers || [],
      recs,
    };
    try {
      sessionStorage.setItem('__pdfData', JSON.stringify(payload));
    } catch (e) {}

    // Fetch the template, inject our data inline, then open as a Blob URL.
    // Blob URLs work inside sandboxed previews where relative-URL navigation
    // hits "preview token required" gates.
    let html;
    try {
      const res = await fetch('pdf-export.html');
      html = await res.text();
    } catch (e) {
      alert('Could not load PDF template. Please refresh and try again.');
      return;
    }
    const inject = '<' + 'script>window.__pdfData = ' +
      JSON.stringify(payload).replace(/</g, '\\u003c') +
      ';</' + 'script>';
    html = html.replace('<body>', '<body>\n' + inject);

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // Fallback: navigate top frame so it escapes the sandbox iframe
      try {
        window.top.location.href = url;
      } catch (e) {
        alert('Popup was blocked — please allow popups to view your PDF.');
      }
    }
  };

  return (
    <div className="app-root" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)' }}>
      <div className="scroll" style={{ paddingTop: 92, paddingBottom: 100 }}>

        {/* Header / title block */}
        <div style={{ padding: '6px 22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div className="caption" style={{ color: 'var(--primary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Your guide · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            {themes && onThemeChange && (
              <ThemePill theme={theme} themes={themes} onChange={onThemeChange} />
            )}
          </div>
          <div className="h-display" style={{ marginBottom: 10 }}>
            Here’s what’s right <span className="serif">for your body.</span>
          </div>
          <div className="caption" style={{ color: 'var(--ink-2)' }}>
            Based on the answers you gave. Bring this to your appointment — or share it as a PDF.
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ padding: '0 22px 16px' }}>
          <div style={{
            display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 3,
            border: '1px solid var(--line)',
          }}>
            <TabBtn active={tab === 'me'} onClick={() => setTab('me')}>For me</TabBtn>
            <TabBtn active={tab === 'doctor'} onClick={() => setTab('doctor')}>For my doctor</TabBtn>
            <TabBtn active={tab === 'learn'} onClick={() => setTab('learn')}>Learn</TabBtn>
          </div>
        </div>

        {tab === 'me' ? (
          <div key="me" className="tab-anim"><MeView recs={recs} data={data} identityLabel={identityLabel} organList={organList} /></div>
        ) : tab === 'doctor' ? (
          <div key="doc" className="tab-anim"><DoctorView recs={recs} data={data} identityLabel={identityLabel} organList={organList} /></div>
        ) : (
          <div key="learn" className="tab-anim"><LearnView data={data} /></div>
        )}

        {/* Footer actions */}
        <div style={{ padding: '8px 22px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn primary full" onClick={exportPDF}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9m0 0L4 6m4 4l4-4M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save as PDF
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn tonal" style={{ flex: 1 }} onClick={() => alert('Email link copied.')}>Email to me</button>
            <button className="btn tonal" style={{ flex: 1 }} onClick={onRestart}>Edit answers</button>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', padding: '8px 0' }}>
            Nothing saved on our servers. This guide lives only on your phone.
          </div>
        </div>
      </div>

      {/* Top frosted-glass mask — hides content scrolling under the status bar */}
      <div className="top-frost" aria-hidden="true" />
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '9px 12px', border: 0, cursor: 'pointer',
      background: active ? 'var(--surface)' : 'transparent',
      color: active ? 'var(--ink)' : 'var(--ink-3)',
      fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
      borderRadius: 9, transition: 'all 0.15s ease',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// "For me" view — recommendations as cards
// ─────────────────────────────────────────────────────────────
function MeView({ recs, data, identityLabel, organList }) {
  const high = recs.filter(r => r.priority === 'high');
  const soon = recs.filter(r => r.priority === 'soon');
  const discuss = recs.filter(r => r.priority === 'discuss');

  return (
    <div style={{ padding: '0 22px' }}>
      {/* Summary card */}
      <div className="card" style={{ marginBottom: 18, background: 'var(--surface)' }}>
        <div className="h-section" style={{ marginBottom: 10 }}>At a glance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow label="Age" value={`${data.age}`} />
          <div className="hr" />
          <SummaryRow label="Identifies as" value={identityLabel} />
          <div className="hr" />
          <SummaryRow label="Body parts" value={organList.join(' · ') || '—'} />
        </div>
      </div>

      {high.length > 0 && (
        <Section title="Do these now" subtitle={`${high.length} screening${high.length > 1 ? 's' : ''} due based on your age and body`} tone="primary">
          {high.map(r => <RecCard key={r.id} rec={r} />)}
        </Section>
      )}

      {soon.length > 0 && (
        <Section title="Do these soon" subtitle="Routine screenings on your schedule" tone="neutral">
          {soon.map(r => <RecCard key={r.id} rec={r} />)}
        </Section>
      )}

      {discuss.length > 0 && (
        <Section title="Worth a conversation" subtitle="Talk through with your doctor — there’s nuance here" tone="muted">
          {discuss.map(r => <RecCard key={r.id} rec={r} />)}
        </Section>
      )}

      {/* Tips for the visit */}
      <div style={{
        marginTop: 8, padding: 18, borderRadius: 16,
        background: 'var(--ink)', color: 'rgba(255,255,255,0.92)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
          Bringing this to your appointment
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Tip n="1" body="Open the “For my doctor” tab when you’re in the room. It has the language they need." />
          <Tip n="2" body="You can ask for a chaperone, a smaller speculum, or to skip a question. These are normal asks." />
          <Tip n="3" body="If something feels off, you can stop. Screenings are about you — your pace, your comfort." />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '4px 0' }}>
      <div className="caption" style={{ flexShrink: 0 }}>{label}</div>
      <div className="body-sm" style={{ textAlign: 'right', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function Section({ title, subtitle, tone, children }) {
  const dot = tone === 'primary' ? 'var(--primary)' : tone === 'muted' ? 'var(--ink-3)' : 'var(--accent)';
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: 99, background: dot }} />
        <div className="h-section" style={{ color: 'var(--ink)' }}>{title}</div>
      </div>
      <div className="caption" style={{ marginBottom: 12, marginLeft: 16 }}>{subtitle}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function RecCard({ rec }) {
  const [open, setOpen] = useStateG(false);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: 16, border: 0, background: 'transparent',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: 'var(--ink)',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div className="body-sm" style={{ fontWeight: 600, marginBottom: 3, fontSize: 16 }}>{rec.title}</div>
          <div className="caption mono" style={{ color: 'var(--primary)', fontWeight: 500 }}>{rec.cadence}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="fade-in" style={{ padding: '0 16px 16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ paddingTop: 14, marginBottom: 12 }}>
            <div className="h-section" style={{ marginBottom: 6 }}>Why this is for you</div>
            <div className="body-sm" style={{ color: 'var(--ink-2)' }}>{rec.because}</div>
          </div>
          <div>
            <div className="h-section" style={{ marginBottom: 6 }}>What to expect</div>
            <div className="body-sm" style={{ color: 'var(--ink-2)' }}>{rec.what}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tip({ n, body }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99, flexShrink: 0,
        background: 'rgba(255,255,255,0.12)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600,
      }}>{n}</div>
      <div className="body-sm" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.45 }}>{body}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// "For my doctor" view — clinical handoff card
// ─────────────────────────────────────────────────────────────
function DoctorView({ recs, data, identityLabel, organList }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div style={{ padding: '0 22px' }}>
      <div className="card" style={{ background: 'var(--surface)', border: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="h-section" style={{ marginBottom: 4 }}>Patient guide</div>
            <div className="caption">Hand to provider · {today}</div>
          </div>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2v18M2 11h18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="body-sm" style={{ fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}>
            Hi — I’m a {data.age}-year-old patient. I identify as <strong>{identityLabel.toLowerCase()}</strong>. So you don’t have to guess, here’s an inventory of my anatomy and history.
          </div>
        </div>

        <ClinicalRow label="Age" value={String(data.age)} />
        <ClinicalRow label="Gender identity" value={identityLabel} />
        <ClinicalRow label="Anatomy present" value={organList.join(', ') || 'Not specified'} />
        <ClinicalRow label="Smoking history (20+ yr)" value={data.smoked === true ? 'Yes' : data.smoked === false ? 'No' : 'Declined'} />
        <ClinicalRow label="Family hx of cancer" value={data.familyHistory === true ? 'Yes (1st-degree relative)' : data.familyHistory === false ? 'No known' : 'Unsure'} />

        <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }} />

        <div className="h-section" style={{ marginBottom: 10 }}>Screenings I want to discuss</div>
        <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recs.map(r => (
            <li key={r.id} className="body-sm" style={{ lineHeight: 1.4 }}>
              <strong style={{ fontWeight: 600 }}>{r.title}</strong>{' '}
              <span className="mono caption" style={{ color: 'var(--primary)' }}>· {r.cadence}</span>
            </li>
          ))}
        </ol>

        <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }} />

        <div className="caption" style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>
          Generated from createyourguide-style intake. Patient should still be assessed individually; recommendations follow current USPSTF + ACS guidelines.
        </div>
      </div>

      <div style={{
        marginTop: 14, padding: '14px 16px', background: 'var(--accent)', color: 'white',
        borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 16, lineHeight: 1, paddingTop: 2 }}>✦</div>
        <div className="caption" style={{ color: 'rgba(255,255,255,0.95)' }}>
          <strong style={{ fontWeight: 600 }}>Tip.</strong> If your doctor seems unsure, asking <em>“What screenings do you recommend for someone with my anatomy?”</em> works better than gender-based phrasing.
        </div>
      </div>
    </div>
  );
}

function ClinicalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', alignItems: 'baseline' }}>
      <div className="caption" style={{ width: 130, flexShrink: 0, color: 'var(--ink-3)' }}>{label}</div>
      <div className="body-sm" style={{ fontWeight: 500, flex: 1 }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Next-step icon button
// ─────────────────────────────────────────────────────────────
function NextStep({ icon, label, onClick }) {
  const icons = {
    calendar: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="16" height="14" rx="2"/><path d="M3 9h16M7 3v4M15 3v4"/></g>,
    bell:     <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 3a5 5 0 015 5v3l1.5 3H4.5L6 11V8a5 5 0 015-5z"/><path d="M9 18a2 2 0 004 0"/></g>,
    share:    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="11" r="2.5"/><circle cx="16" cy="5" r="2.5"/><circle cx="16" cy="17" r="2.5"/><path d="M8.2 9.8l5.6-3.6M8.2 12.2l5.6 3.6"/></g>,
    bookmark: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h12v17l-6-4-6 4V3z"/></g>,
  };
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '12px 6px', borderRadius: 12,
      background: 'var(--surface)', border: '1px solid var(--line)',
      cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
      transition: 'all 0.15s ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-soft)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface)'; }}>
      <div style={{
        width: 34, height: 34, borderRadius: 99,
        background: 'var(--primary-soft)', color: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 22 22">{icons[icon]}</svg>
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.005em' }}>{label}</div>
    </button>
  );
}

function ThemePill({ theme, themes, onChange }) {
  const [open, setOpen] = useStateG(false);
  const cur = themes[theme] || Object.values(themes)[0];
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="theme-pill"
        aria-label="Change theme"
        aria-expanded={open}
      >
        <span className="theme-pill-dot" style={{ background: cur['--primary'] }} />
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{
          transition: 'transform 0.2s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          color: 'var(--ink-3)',
          flexShrink: 0,
        }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 100,
          }} />
          <div className="theme-pill-popover">
            {Object.keys(themes).map(k => {
              const th = themes[k];
              const active = k === theme;
              return (
                <button
                  key={k}
                  onClick={() => { onChange(k); setOpen(false); }}
                  className={'theme-pill-row' + (active ? ' is-active' : '')}
                >
                  <span className="theme-pill-row-dot" style={{ background: th['--primary'] }} />
                  <span className="theme-pill-row-label">
                    <span className="theme-pill-row-name">{th.label.split(' · ')[0]}</span>
                    <span className="theme-pill-row-mood">{th.label.split(' · ')[1] || ''}</span>
                  </span>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--primary)' }}>
                      <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { GuideScreen, ThemePill });
