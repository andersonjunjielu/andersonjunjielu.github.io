// web-results.jsx — printable one-page summary (results screen) + About modal

const { useState: useStateR, useEffect: useEffectR } = React;

// ─── Results page ─────────────────────────────────────────────────
function ResultsPage({ data, onRestart, onPrint }) {
  const recs = buildScreenings({
    organs: data.organs,
    age: data.age,
    smoked: data.smoked,
    familyHistory: data.familyHistory,
    hpv: data.hpv,
  });

  // Sort: high → soon → discuss
  const order = { high: 0, soon: 1, discuss: 2 };
  const sortedRecs = [...recs].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));

  // Format a couple of summary cells
  const ageLabel = data.age ? `${data.age}` : '—';
  const identityLabel = data.identityLabel || '—';
  const organCount = data.organs.size;

  return (
    <div className="results-stage fade-in">

      <div className="results-head">
        <div className="results-head-left">
          <div className="results-kicker">Your screening guide</div>
          <h1>Here's what makes <em>medical sense</em> for your body and history.</h1>
          <p className="results-head-sub">
            Based on your answers, you have {sortedRecs.length} screening{sortedRecs.length === 1 ? '' : 's'} worth knowing about.
            None are urgent on their own — they're a starting point for a conversation with your clinician.
          </p>
        </div>
        <div className="results-actions">
          <button className="btn btn-ghost" onClick={onPrint}>Print summary</button>
          <button className="btn btn-ghost" onClick={onRestart}>Start over</button>
        </div>
      </div>

      {/* Patient summary box */}
      <div className="results-summary">
        <div className="results-summary-cell">
          <div className="results-summary-key">Age</div>
          <div className="results-summary-val">{ageLabel}</div>
        </div>
        <div className="results-summary-cell">
          <div className="results-summary-key">Gender identity</div>
          <div className="results-summary-val">{identityLabel}</div>
        </div>
        <div className="results-summary-cell">
          <div className="results-summary-key">Anatomy considered</div>
          <div className="results-summary-val">
            {organCount > 0 ? `${organCount} organ${organCount === 1 ? '' : 's'}` : 'Not specified'}
          </div>
        </div>
        <div className="results-summary-cell">
          <div className="results-summary-key">Family history</div>
          <div className="results-summary-val">
            {data.familyHistory ? 'Yes' : 'None known'}
          </div>
        </div>
      </div>

      {/* Recommendation list */}
      <div className="rec-list">
        {sortedRecs.map(r => (
          <article key={r.id} className={"rec-card priority-" + r.priority}>
            <div>
              <span className={"rec-priority-tag priority-" + r.priority}>
                {r.priority === 'high' ? 'High priority' : r.priority === 'soon' ? 'Recommended' : 'Discuss with doctor'}
              </span>
              <h2>{r.title}</h2>
              <p className="rec-cadence">{r.cadence}</p>
              <p className="rec-because">
                <span className="rec-label">Why</span>{r.because}
              </p>
              <p className="rec-what">
                <span className="rec-label">What it is</span>{r.what}
              </p>
            </div>
            <dl className="rec-side">
              <dt>For your doctor</dt>
              <dd>{r.title}</dd>
              <dt>Cadence</dt>
              <dd>{r.cadence}</dd>
              <dt>Priority</dt>
              <dd>{r.priority === 'high' ? 'High' : r.priority === 'soon' ? 'Recommended' : 'Shared decision'}</dd>
            </dl>
          </article>
        ))}
      </div>

      <div className="results-disclaimer">
        <strong>This is a design prototype, not medical advice.</strong>{' '}
        It uses simplified versions of guidelines from the U.S. Preventive Services Task Force,
        American Cancer Society, and others. Your clinician knows your history and can adjust
        these recommendations based on personal factors this tool cannot capture. Always confirm
        a screening plan with a qualified clinician before acting on it.
      </div>

    </div>
  );
}

// ─── About modal (linked from topbar) ─────────────────────────────
function AboutModal({ open, onClose }) {
  useEffectR(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <h2>About this tool</h2>

        <p>
          A patient-facing prototype that recommends cancer screenings based on what a person
          actually has — their organs, age, family history, and behaviors — rather than their
          stated gender identity. Designed for the waiting room: a few minutes on a phone or
          shared device before walking in to clinic.
        </p>

        <h3>Why it exists</h3>
        <p>
          Trans and gender-diverse patients are systematically under-screened for cancer. A
          common reason: clinic intake systems use sex or gender to drive screening
          recommendations, even when those don't reflect the patient's actual anatomy. A trans
          woman keeps her prostate. A trans man with a cervix still needs cervical screening.
          A nonbinary person with breast tissue is at risk for breast cancer.
        </p>

        <h3>How it works</h3>
        <p>
          The intake separates identity (gender, pronouns, orientation, race) from anatomy.
          The screening logic only ever uses anatomy + age + history. Identity is collected so
          the resulting guide can use language that feels right, and so the doctor handoff
          is honest about who's in front of them.
        </p>

        <h3>Data &amp; privacy</h3>
        <p>
          Everything stays in your browser. Nothing is sent anywhere — there is no backend,
          no analytics, no logging. You can close the tab and your answers are gone.
        </p>

        <h3>Sources</h3>
        <p>
          Recommendations adapted from USPSTF, American Cancer Society, and the WPATH Standards of
          Care 8 guidance on screening trans and gender-diverse adults. Specific cadences and
          age cutoffs are simplified; a clinician should always make the final call.
        </p>

        <h3>Authors &amp; contact</h3>
        <p>
          Designed and built by Anderson Junjie Lu, PhD candidate in Epidemiology and Clinical
          Research at Stanford. For feedback, corrections, or to report a problem, see the
          contact page on the homepage.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { ResultsPage, AboutModal });
