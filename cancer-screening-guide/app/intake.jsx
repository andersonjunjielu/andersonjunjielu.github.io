// intake.jsx — refined intake flow v2
// New screens: Sex / Gender / Pronouns / Orientation / Race / Age /
// BodyInventory (with per-organ 5-state drawer) / HPV / Family / Personal /
// Review (answer summary screen).
// Plus: InfoButton + InfoDrawer (ⓘ -> bottom sheet), IntakeShell with ambient aura,
// floating ReviewPill, refined Opt + Btn components.

const { useState: useStateI, useEffect: useEffectI, useMemo: useMemoI } = React;

// ─────────────────────────────────────────────────────────────
// Refined option button (single + multi)
// ─────────────────────────────────────────────────────────────
function OptV2({ label, sub, selected, multi, muted, onClick, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'opt-v2'
        + (selected ? ' selected' : '')
        + (multi ? ' checkbox' : '')
        + (muted ? ' muted' : '')
        + (compact ? ' compact' : '')
      }
    >
      <div className="check">
        {multi ? (
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="3" fill="currentColor"/>
          </svg>
        )}
      </div>
      <div className="label-stack">
        <div className="label">{label}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Refined buttons
// ─────────────────────────────────────────────────────────────
function BtnV2({ children, kind = 'primary', full, disabled, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={'btn-v2 ' + kind + (full ? ' full' : '')}
      style={style}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// InfoButton + bottom-sheet drawer
// ─────────────────────────────────────────────────────────────
function InfoButton({ onClick }) {
  return (
    <button type="button" className="info-btn" onClick={onClick} aria-label="Why we ask this">
      i
    </button>
  );
}

function InfoSheet({ open, title, body, onClose }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{title}</div>
        <div className="sheet-body">{body}</div>
        <div style={{ height: 14 }} />
        <BtnV2 kind="ghost" full onClick={onClose}>Got it</BtnV2>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// IntakeShell — common chrome for every intake question screen
// Props: step, total, phase ('identity'|'body'|'history'),
//        onBack, onNext, nextLabel, nextDisabled, onReview,
//        title, subtitle, info {title, body}
// ─────────────────────────────────────────────────────────────
function IntakeShell({
  step, total, phase = 'identity',
  onBack, onNext, nextLabel = 'Continue', nextDisabled,
  onReview, title, subtitle, info, children,
  theme, themes, onThemeChange,
}) {
  const [infoOpen, setInfoOpen] = useStateI(false);
  const pct = total ? ((step) / total) * 100 : 0;

  return (
    <div className={'app-root phase-' + phase} style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)' }}>
      {/* Subtle ambient aura — phase-tinted */}
      <div className="intake-aura-wrap" aria-hidden="true">
        <div className="intake-aura a1" />
        <div className="intake-aura a2" />
      </div>

      {/* scrollable content */}
      <div className="scroll" style={{ paddingTop: 92, paddingBottom: 140, zIndex: 1 }}>
        <div style={{ padding: '0 22px' }}>
          {/* Step counter + slim progress bar */}
          {total > 0 && (
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                <span className="step-counter">
                  Step <strong>{step + 1}</strong> of {total}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {themes && onThemeChange && window.ThemePill && (
                    <window.ThemePill theme={theme} themes={themes} onChange={onThemeChange} />
                  )}
                  {onReview && (
                    <button type="button" className="review-link" onClick={onReview}>
                      Review answers
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: pct + '%' }} />
              </div>
            </div>
          )}

          {/* Question head */}
          <div className="q-head">
            <div className="h-q">{title}</div>
            {info && <InfoButton onClick={() => setInfoOpen(true)} />}
          </div>
          {subtitle && <div className="q-sub">{subtitle}</div>}

          {children}
        </div>
      </div>

      {/* Top frosted-glass mask — hides content scrolling under the status bar */}
      <div className="top-frost" aria-hidden="true" />

      {/* Bottom action bar */}
      <div className="footer-cta">
        <div style={{ display: 'flex', gap: 10 }}>
          {onBack && (
            <BtnV2 kind="ghost" onClick={onBack} style={{ flex: '0 0 38%' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </BtnV2>
          )}
          <BtnV2 kind="primary" onClick={onNext} disabled={nextDisabled} style={{ flex: 1 }}>
            {nextLabel}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BtnV2>
        </div>
      </div>

      {/* Info drawer */}
      <InfoSheet open={infoOpen} title={info?.title} body={info?.body} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single-select question screen (used for Sex, HPV, etc.)
// ─────────────────────────────────────────────────────────────
function SingleSelectScreen({ shellProps, options, value, onChange }) {
  return (
    <IntakeShell {...shellProps} nextDisabled={!value}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(o => (
          <OptV2
            key={o.id}
            label={o.label}
            sub={o.sub}
            selected={value === o.id}
            muted={o.id === 'skip'}
            onClick={() => onChange(o.id)}
          />
        ))}
      </div>
    </IntakeShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Multi-select question screen (Gender, Pronouns, Orientation, Race, Family)
// ─────────────────────────────────────────────────────────────
function MultiSelectScreen({ shellProps, options, value, onChange, exclusive }) {
  // value is an array of ids
  const sel = new Set(value || []);
  const toggle = (id) => {
    const next = new Set(sel);
    // exclusive ids (skip, none) clear everything else
    if (exclusive && exclusive.includes(id)) {
      onChange([id]);
      return;
    }
    if (next.has(id)) next.delete(id); else {
      // adding a normal id removes any exclusive ones
      if (exclusive) exclusive.forEach(e => next.delete(e));
      next.add(id);
    }
    onChange(Array.from(next));
  };
  return (
    <IntakeShell {...shellProps} nextDisabled={!value || value.length === 0}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(o => (
          <OptV2
            key={o.id}
            label={o.label}
            sub={o.sub}
            multi
            selected={sel.has(o.id)}
            muted={o.id === 'skip' || o.id === 'none'}
            onClick={() => toggle(o.id)}
          />
        ))}
      </div>
    </IntakeShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Age screen — refined slider
// ─────────────────────────────────────────────────────────────

// Age-banded screening previews. Each entry: { id, name, ageStart, ageEnd, who, ref }
// Sources are USPSTF (uspreventiveservicestaskforce.org) + ACS (cancer.org) recommendations
// current as of 2024. ageEnd is the upper bound or null = continues with risk assessment.
const AGE_PREVIEW = [
  { id: 'cervical', name: 'Cervical cancer',   ageStart: 21, ageEnd: 65, who: 'people with a cervix',
    ref: 'USPSTF 2018 · Pap/HPV every 3–5 yrs' },
  { id: 'breast',   name: 'Breast cancer',     ageStart: 40, ageEnd: 74, who: 'people with breast tissue',
    ref: 'USPSTF 2024 · biennial mammogram from 40' },
  { id: 'colon',    name: 'Colorectal cancer', ageStart: 45, ageEnd: 75, who: 'all adults',
    ref: 'USPSTF 2021 · colonoscopy or stool test from 45' },
  { id: 'lung',     name: 'Lung cancer',       ageStart: 50, ageEnd: 80, who: 'adults with 20+ pack-yr smoking history',
    ref: 'USPSTF 2021 · annual low-dose CT' },
  { id: 'prostate', name: 'Prostate cancer',   ageStart: 50, ageEnd: 70, who: 'people with a prostate (earlier if Black or family hx)',
    ref: 'ACS 2023 · individual decision with PSA' },
];

function AgeScreenV2({ shellProps, value, onChange }) {
  const [val, setVal] = useStateI(value || 35);
  useEffectI(() => { onChange(val); }, [val]);

  // Which screenings are relevant at this age?
  const eligible = AGE_PREVIEW.filter(s => val >= s.ageStart && (s.ageEnd === null || val <= s.ageEnd));
  const upcoming = AGE_PREVIEW.filter(s => val < s.ageStart && s.ageStart - val <= 10);

  return (
    <IntakeShell {...shellProps}>
      <div style={{ textAlign: 'center', padding: '8px 0 18px' }}>
        <div style={{ fontFamily: 'Newsreader, serif', fontSize: 88, fontWeight: 400, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.04em' }}>
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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        {[25, 35, 45, 55, 65].map(a => (
          <button key={a} type="button" onClick={() => setVal(a)} style={{
            padding: '7px 14px', borderRadius: 99,
            border: '1px solid ' + (val === a ? 'var(--primary)' : 'var(--line-2)'),
            background: val === a ? 'var(--primary-soft)' : 'rgba(255,255,255,0.6)',
            color: val === a ? 'var(--primary)' : 'var(--ink-2)',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.15s ease',
            backdropFilter: 'blur(6px)',
          }}>{a}</button>
        ))}
      </div>

      {/* Age-based screening preview */}
      <div style={{ marginTop: 32 }}>
        <div className="age-prev-title">
          At {val}, screening guidelines flag these cancers
        </div>
        <div className="caption" style={{ marginBottom: 12, color: 'var(--ink-3)' }}>
          Preview only — we’ll narrow this down based on your body and history in the next steps.
        </div>

        {eligible.length === 0 && upcoming.length === 0 && (
          <div className="age-prev-empty">
            Most population-wide cancer screenings start at age 21 (cervical) and 40 (breast). You’ll see options that fit your body in the final guide.
          </div>
        )}

        {eligible.map(s => (
          <div key={s.id} className="age-prev-card eligible">
            <div className="age-prev-row">
              <div className="age-prev-name">{s.name}</div>
              <span className="age-prev-tag">In window</span>
            </div>
            <div className="age-prev-who">For {s.who}</div>
            <div className="age-prev-ref">{s.ref}</div>
          </div>
        ))}

        {upcoming.map(s => (
          <div key={s.id} className="age-prev-card upcoming">
            <div className="age-prev-row">
              <div className="age-prev-name">{s.name}</div>
              <span className="age-prev-tag soon">Starts at {s.ageStart}</span>
            </div>
            <div className="age-prev-who">For {s.who}</div>
            <div className="age-prev-ref">{s.ref}</div>
          </div>
        ))}

        <div className="age-prev-foot">
          Sources: USPSTF · American Cancer Society · current 2024 recommendations
        </div>
      </div>
    </IntakeShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Body inventory v2 — per-organ expandable cards with 5-state options
// ─────────────────────────────────────────────────────────────
function BodyInventoryScreen({ shellProps, value, onChange, sex }) {
  // value is { organId: stateId, ... }
  // We deliberately do NOT pre-fill from sex assigned at birth — it would
  // make assumptions that a guide for trans/intersex bodies can't afford.
  // Users start blank and answer each one themselves.
  const initial = useMemoI(() => value && Object.keys(value).length > 0 ? value : {}, []);
  const [states, setStates] = useStateI(initial);
  const [openId, setOpenId] = useStateI(null);
  useEffectI(() => { onChange(states); }, [states]);

  const setOne = (oid, sid) => {
    setStates(prev => ({ ...prev, [oid]: sid }));
    // auto-collapse after a beat
    setTimeout(() => setOpenId(cur => cur === oid ? null : cur), 320);
  };

  const stateLabel = (sid) => ORGAN_STATES.find(s => s.id === sid)?.label;

  return (
    <IntakeShell {...shellProps} nextDisabled={Object.keys(states).length === 0}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ORGANS.map(o => {
          const sid = states[o.id];
          const isOpen = openId === o.id;
          const isSet = sid && sid !== 'na';
          const validStates = ORGAN_STATE_MAP[o.id] || ['present','removed','unsure','na'];
          return (
            <div key={o.id} className={'organ-card' + (isOpen ? ' open' : '') + (isSet ? ' set' : '')}>
              <div className="row" onClick={() => setOpenId(cur => cur === o.id ? null : o.id)}>
                <div className="name">{o.label}</div>
                <div className={'state-pill' + (sid ? '' : ' unset')}>
                  {sid ? stateLabel(sid) : 'Tap to answer'}
                </div>
                <svg className="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="body">
                <div className="body-inner">
                  {validStates.map(stid => {
                    const s = ORGAN_STATES.find(x => x.id === stid);
                    if (!s) return null;
                    return (
                      <OptV2
                        key={stid}
                        label={s.label}
                        sub={s.sub}
                        selected={sid === stid}
                        compact
                        onClick={() => setOne(o.id, stid)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 18, padding: '12px 14px', background: 'var(--primary-soft)',
        borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <div style={{ color: 'var(--primary)', fontSize: 18, lineHeight: 1, paddingTop: 2 }}>✦</div>
        <div className="caption" style={{ color: 'var(--primary)' }}>
          <strong style={{ fontWeight: 600 }}>Did you know?</strong> Cancer screening matches anatomy, not gender. A trans woman keeps her prostate. A trans man with a cervix still needs cervical screening.
        </div>
      </div>
    </IntakeShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Review screen — summary of all answers with edit links
// ─────────────────────────────────────────────────────────────
function ReviewScreen({ data, onEdit, onContinue, onBack }) {
  const labelFor = (list, ids) => {
    if (!ids || (Array.isArray(ids) ? ids.length === 0 : !ids)) return null;
    const arr = Array.isArray(ids) ? ids : [ids];
    return arr.map(id => list.find(o => o.id === id)?.label).filter(Boolean).join(', ');
  };
  const organSummary = () => {
    const states = data.organStates || {};
    const have = Object.entries(states).filter(([,s]) => ['present','constructed','hormones'].includes(s));
    if (have.length === 0) return null;
    return have.map(([oid]) => ORGANS.find(o => o.id === oid)?.short).filter(Boolean).join(', ');
  };
  const familySummary = () => {
    if (!data.familyMembers || data.familyMembers.length === 0) return null;
    if (data.familyMembers.includes('none')) return 'No family history';
    return labelFor(FAMILY, data.familyMembers);
  };

  const rows = [
    { id: 'sex',         q: 'Sex at birth',  a: labelFor(SEX_AT_BIRTH, data.sex) },
    { id: 'gender',      q: 'Gender',        a: labelFor(GENDERS, data.genders) },
    { id: 'pronouns',    q: 'Pronouns',      a: labelFor(PRONOUNS, data.pronouns) },
    { id: 'orientation', q: 'Orientation',   a: labelFor(ORIENTATIONS, data.orientations) },
    { id: 'race',        q: 'Race',          a: labelFor(RACES, data.races) },
    { id: 'age',         q: 'Age',           a: data.age ? data.age + ' years old' : null },
    { id: 'body',        q: 'Body inventory', a: organSummary() },
    { id: 'hpv',         q: 'HPV vaccine',   a: data.hpv === 'yes' ? 'Yes' : data.hpv === 'no' ? 'No' : data.hpv === 'unsure' ? 'Not sure' : null },
    { id: 'family',      q: 'Family history', a: familySummary() },
    { id: 'smoking',     q: 'Smoking',       a: data.smoked === true ? 'Yes, 20+ years' : data.smoked === false ? 'No' : null },
  ];

  return (
    <div className="app-root phase-history" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)' }}>
      <div className="intake-aura-wrap" aria-hidden="true">
        <div className="intake-aura a1" />
        <div className="intake-aura a2" />
      </div>

      <div className="scroll" style={{ paddingTop: 92, paddingBottom: 140, zIndex: 1 }}>
        <div style={{ padding: '0 22px' }}>
          <div className="step-counter" style={{ marginBottom: 14 }}>Review</div>
          <div className="q-head" style={{ marginBottom: 8 }}>
            <div className="h-q">
              Your answers <span className="serif">at a glance.</span>
            </div>
          </div>
          <div className="q-sub">
            Tap any row to change it. Nothing is sent yet.
          </div>

          <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 16, padding: '4px 18px', border: '1px solid var(--line)', backdropFilter: 'blur(8px)' }}>
            {rows.map(r => (
              <div key={r.id} className="review-row">
                <div className="q">{r.q}</div>
                <div className="a">
                  {r.a ? r.a : <span className="empty">Not answered</span>}
                </div>
                <button type="button" className="edit-link" onClick={() => onEdit(r.id)}>Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-cta">
        <div style={{ display: 'flex', gap: 10 }}>
          <BtnV2 kind="ghost" onClick={onBack} style={{ flex: '0 0 38%' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </BtnV2>
          <BtnV2 kind="primary" onClick={onContinue} style={{ flex: 1 }}>
            Build my guide
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BtnV2>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  IntakeShell, OptV2, BtnV2, InfoButton, InfoSheet,
  SingleSelectScreen, MultiSelectScreen,
  AgeScreenV2, BodyInventoryScreen, ReviewScreen,
});
