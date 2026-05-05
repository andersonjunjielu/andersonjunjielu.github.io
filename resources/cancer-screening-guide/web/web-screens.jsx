// web-screens.jsx — question screens for the desktop two-column layout.
// Reuses data.jsx (ORGANS, GENDERS, etc) loaded globally.

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ─── Single-select option list ─────────────────────────────────────
function OptList({ options, value, onChange, multi = false, exclusive = [], grid = false }) {
  const isSelected = (id) => multi ? (value || []).includes(id) : value === id;
  const handle = (id) => {
    if (!multi) {
      onChange(id);
      return;
    }
    const cur = value || [];
    let next;
    if (cur.includes(id)) {
      next = cur.filter(x => x !== id);
    } else {
      // exclusive (e.g. "skip", "none") — clear others; or remove exclusive if picking another
      if (exclusive.includes(id)) {
        next = [id];
      } else {
        next = cur.filter(x => !exclusive.includes(x)).concat(id);
      }
    }
    onChange(next);
  };
  return (
    <div className={grid ? "opts opts-grid" : "opts"}>
      {options.map(o => (
        <button key={o.id} type="button"
          className={"opt" + (isSelected(o.id) ? " is-selected" : "")}
          onClick={() => handle(o.id)}>
          <div>
            <div className="opt-label">{o.label}</div>
            {o.sub && <div className="opt-sub">{o.sub}</div>}
          </div>
          <div className={"opt-check" + (multi ? " multi" : "")}></div>
        </button>
      ))}
    </div>
  );
}

// ─── Generic question card (right column) ────────────────────────
function QCard({ stepIdx, total, title, subtitle, children, onBack, onNext, nextDisabled, nextLabel = "Continue", backLabel = "Back" }) {
  return (
    <div className="qcard fade-in">
      <div className="qcard-meta">
        Question {stepIdx + 1} of {total}
      </div>
      <h1>{title}</h1>
      {subtitle && <p className="qsub">{subtitle}</p>}
      <div className="qcard-body">
        {children}
      </div>
      <div className="qcard-foot">
        <div className="qcard-foot-left">
          {onBack && (
            <button className="btn btn-text with-arrow" onClick={onBack}>{backLabel}</button>
          )}
        </div>
        <div className="qcard-foot-right">
          <button className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Age screen ───────────────────────────────────────────────────
function AgeScreen({ value, onChange, ...cardProps }) {
  return (
    <QCard {...cardProps}>
      <div className="age-input-wrap">
        <input type="number" className="age-input" min={18} max={100}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 18 && v <= 100) onChange(v);
            else if (e.target.value === '') onChange('');
          }} />
        <div className="age-slider-wrap">
          <input type="range" className="age-slider" min={18} max={100}
            value={typeof value === 'number' ? value : 35}
            onChange={(e) => onChange(parseInt(e.target.value, 10))} />
          <div className="age-ticks">
            <span>18</span><span>40</span><span>60</span><span>80</span><span>100</span>
          </div>
        </div>
      </div>
    </QCard>
  );
}

// ─── Body inventory (per-organ state dropdown) ────────────────────
function BodyScreen({ value, onChange, sex, ...cardProps }) {
  // value = { organId: state }
  const setState = (oid, st) => onChange({ ...value, [oid]: st });

  // Show all 10 organs with state-select; "applicable" defaults bubble to top
  const stateLookup = Object.fromEntries(ORGAN_STATES.map(s => [s.id, s.label]));

  return (
    <QCard {...cardProps}>
      <div className="organ-list">
        {ORGANS.map(o => {
          const validStates = ORGAN_STATE_MAP[o.id] || ['present','removed','unsure','na'];
          const cur = value[o.id];
          const hasState = cur && cur !== 'na';
          return (
            <div key={o.id} className={"organ-row" + (hasState ? " has-state" : "")}>
              <div>
                <div className="organ-name">{o.label}</div>
                <div className="organ-plain">{o.plain}</div>
              </div>
              <select className="organ-state-select"
                value={cur || ''}
                onChange={(e) => setState(o.id, e.target.value || null)}>
                <option value="">Choose…</option>
                {validStates.map(stId => {
                  const stObj = ORGAN_STATES.find(s => s.id === stId);
                  return <option key={stId} value={stId}>{stObj?.label || stId}</option>;
                })}
              </select>
            </div>
          );
        })}
      </div>
    </QCard>
  );
}

// ─── Review screen ────────────────────────────────────────────────
function ReviewScreen({ data, onEdit, onBack, onContinue, stepIdx, total }) {
  const fmt = {
    sex: () => SEX_AT_BIRTH.find(s => s.id === data.sex)?.label || '—',
    genders: () => (data.genders || []).map(id => GENDERS.find(g => g.id === id)?.label).filter(Boolean).join(', ') || '—',
    pronouns: () => (data.pronouns || []).map(id => PRONOUNS.find(p => p.id === id)?.label).filter(Boolean).join(', ') || '—',
    orientations: () => (data.orientations || []).map(id => ORIENTATIONS.find(o => o.id === id)?.label).filter(Boolean).join(', ') || '—',
    races: () => (data.races || []).map(id => RACES.find(r => r.id === id)?.label).filter(Boolean).join(', ') || '—',
    age: () => String(data.age || '—'),
    body: () => {
      const list = Object.entries(data.organStates || {})
        .filter(([_, st]) => st && st !== 'na')
        .map(([oid, st]) => {
          const organ = ORGANS.find(o => o.id === oid);
          const state = ORGAN_STATES.find(s => s.id === st);
          if (!organ) return null;
          return `${organ.short}${st !== 'present' ? ` (${state?.label.toLowerCase()})` : ''}`;
        })
        .filter(Boolean);
      return list.length ? list.join(', ') : '—';
    },
    hpv: () => {
      const map = { yes: 'Yes, full series', partial: 'Yes, partial', no: 'No', unsure: 'Don\'t know', skip: 'Prefer not to say' };
      return map[data.hpv] || '—';
    },
    family: () => {
      const list = (data.familyMembers || []).map(id => FAMILY.find(f => f.id === id)?.label).filter(Boolean);
      return list.length ? list.join(', ') : '—';
    },
    smoking: () => {
      if (data.smoked === true) return 'Yes — 20+ years';
      if (data.smoked === 'some') return 'Yes, less than 20 years';
      if (data.smoked === false) return 'No, never regularly';
      if (data.smoked === null) return 'Prefer not to say';
      return '—';
    },
  };

  const rows = [
    { id: 'sex', key: 'Sex assigned at birth' },
    { id: 'gender', key: 'Gender identity', read: 'genders' },
    { id: 'pronouns', key: 'Pronouns' },
    { id: 'orientation', key: 'Sexual orientation', read: 'orientations' },
    { id: 'race', key: 'Race / ethnicity', read: 'races' },
    { id: 'age', key: 'Age' },
    { id: 'body', key: 'Body inventory' },
    { id: 'hpv', key: 'HPV vaccine' },
    { id: 'family', key: 'Family history of cancer', read: 'family' },
    { id: 'smoking', key: 'Smoking history' },
  ];

  return (
    <QCard
      stepIdx={stepIdx} total={total}
      title={<span>Let's <em>review</em> before we generate.</span>}
      subtitle="Click any row to change your answer. Nothing leaves this device."
      onBack={onBack}
      onNext={onContinue}
      nextLabel="See my screening guide"
    >
      <div className="review-grid">
        {rows.map(r => {
          const val = fmt[r.read || r.id]();
          return (
            <div key={r.id} className="review-row">
              <div className="review-key">{r.key}</div>
              <div className={"review-val" + (val === '—' ? ' empty' : '')}>{val}</div>
              <button className="review-edit" onClick={() => onEdit(r.id)}>Edit</button>
            </div>
          );
        })}
      </div>
    </QCard>
  );
}

// Export to global scope for other Babel scripts
Object.assign(window, {
  OptList, QCard, AgeScreen, BodyScreen, ReviewScreen,
});
