// app.jsx — main controller, state machine, tweaks integration

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "teal",
  "persona": "none",
  "showFrame": true,
  "langVariant": "minimal"
}/*EDITMODE-END*/;

const THEMES = {
  teal: {
    label: 'Teal',
    '--bg': '#F4F1EC', '--surface': '#FFFFFF', '--surface-2': '#FAF7F2',
    '--ink': '#1B2530', '--ink-2': '#4A5560', '--ink-3': '#8A8F96',
    '--line': 'rgba(27,37,48,0.08)', '--line-2': 'rgba(27,37,48,0.14)',
    '--primary': '#2F5D5A', '--primary-soft': '#E8EFEE', '--accent': '#D4623A',
  },
  midnight: {
    label: 'Midnight',
    '--bg': '#F1F2F4', '--surface': '#FFFFFF', '--surface-2': '#F7F8FA',
    '--ink': '#0E1320', '--ink-2': '#3F485C', '--ink-3': '#8A92A3',
    '--line': 'rgba(14,19,32,0.07)', '--line-2': 'rgba(14,19,32,0.13)',
    '--primary': '#1F2A4A', '--primary-soft': '#E5E8F2', '--accent': '#C5523F',
  },
  sage: {
    label: 'Sage',
    '--bg': '#F1F0EA', '--surface': '#FFFFFF', '--surface-2': '#F9F8F2',
    '--ink': '#26302A', '--ink-2': '#4F5C53', '--ink-3': '#8B968D',
    '--line': 'rgba(38,48,42,0.07)', '--line-2': 'rgba(38,48,42,0.14)',
    '--primary': '#5A7355', '--primary-soft': '#E9EFE5', '--accent': '#B8704A',
  },
  plum: {
    label: 'Plum',
    '--bg': '#F4EFEC', '--surface': '#FFFFFF', '--surface-2': '#FBF6F3',
    '--ink': '#231722', '--ink-2': '#503B49', '--ink-3': '#94808F',
    '--line': 'rgba(35,23,34,0.07)', '--line-2': 'rgba(35,23,34,0.13)',
    '--primary': '#6E3A5E', '--primary-soft': '#F0E5EC', '--accent': '#C28A3C',
  },
};

function applyTheme(name) {
  const root = document.querySelector('.theme-root');
  if (!root) return;
  const t = THEMES[name] || THEMES.teal;
  Object.entries(t).forEach(([k, v]) => { if (k.startsWith('--')) root.style.setProperty(k, v); });
}

// New intake flow: 10 questions + review
const INTAKE_STEPS = [
  'sex', 'gender', 'pronouns', 'orientation', 'race',
  'age', 'body', 'hpv', 'family', 'smoking',
];
const TOTAL = INTAKE_STEPS.length;

const STEPS = ['language', 'welcome', 'color', ...INTAKE_STEPS, 'review', 'generating', 'guide'];

function App() {
  const [tRaw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // When embedded in an iframe (e.g. on the resource landing page),
  // skip the in-app device frame and the outer page chrome — the parent
  // page provides its own iPhone bezel.
  const isEmbedded = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('embed');
  const t = isEmbedded ? { ...tRaw, showFrame: false } : tRaw;

  const [step, setStep] = useStateA('language');
  const [language, setLanguage] = useStateA('en');

  // New data shape
  const [sex, setSex] = useStateA(null);                    // single id
  const [genders, setGenders] = useStateA([]);              // multi
  const [pronouns, setPronouns] = useStateA([]);            // multi
  const [orientations, setOrientations] = useStateA([]);    // multi
  const [races, setRaces] = useStateA([]);                  // multi
  const [age, setAge] = useStateA(35);
  const [organStates, setOrganStates] = useStateA({});      // {organ: state}
  const [hpv, setHpv] = useStateA(null);                    // 'yes'|'no'|'unsure'|'skip'
  const [familyMembers, setFamilyMembers] = useStateA([]);  // multi
  const [smoked, setSmoked] = useStateA(undefined);

  // apply theme
  useEffectA(() => { applyTheme(t.theme); }, [t.theme]);

  // apply persona preset
  useEffectA(() => {
    const p = PERSONAS[t.persona];
    if (!p) return;
    setSex(p.sex); setGenders(p.genders); setPronouns(p.pronouns);
    setOrientations(p.orientations); setRaces(p.races); setAge(p.age);
    setOrganStates(p.organStates); setHpv(p.hpv); setFamilyMembers(p.familyMembers);
    setSmoked(p.smoked);
    setStep('guide');
  }, [t.persona]);

  const goto = (s) => setStep(s);
  const nextOf = (cur) => STEPS[STEPS.indexOf(cur) + 1];
  const prevOf = (cur) => STEPS[Math.max(0, STEPS.indexOf(cur) - 1)];

  // Compute step index for each intake screen (0..TOTAL-1)
  const intakeIdx = (s) => INTAKE_STEPS.indexOf(s);

  // Generic shellProps factory
  const shell = (s, opts = {}) => ({
    step: intakeIdx(s),
    total: TOTAL,
    phase: opts.phase || 'identity',
    onBack: () => goto(prevOf(s)),
    onNext: () => goto(nextOf(s)),
    onReview: () => goto('review'),
    title: opts.title,
    subtitle: opts.subtitle,
    info: INFO_COPY[opts.infoKey || s],
    theme: t.theme,
    themes: THEMES,
    onThemeChange: (name) => setTweak('theme', name),
    ...opts.shellOverrides,
  });

  // Edit-from-review jumps back to a question, then back to review
  const editFromReview = (id) => {
    const map = {
      sex: 'sex', gender: 'gender', pronouns: 'pronouns',
      orientation: 'orientation', race: 'race',
      age: 'age', body: 'body', hpv: 'hpv',
      family: 'family', smoking: 'smoking',
    };
    if (map[id]) setStep(map[id]);
  };

  // Build legacy organs Set + legacy familyHistory bool for screening engine
  const organsForBuild = organsFromStates(organStates);
  const familyHistoryBool = familyMembers && familyMembers.length > 0 && !familyMembers.includes('none');

  let screen;
  switch (step) {
    case 'language':
      screen = <LanguageScreen variant={t.langVariant} onPick={(lang) => { setLanguage(lang); goto('welcome'); }} />;
      break;
    case 'welcome':
      screen = <WelcomeScreen onStart={() => goto('color')} clinicName="Screening for Every Body" />;
      break;
    case 'color':
      screen = <ColorScreen
        value={t.theme}
        themes={THEMES}
        onPick={(name) => { setTweak('theme', name); }}
        onContinue={() => goto('sex')}
        onBack={() => goto('welcome')} />;
      break;
    case 'sex':
      screen = <SingleSelectScreen
        shellProps={{ ...shell('sex', { phase: 'identity',
          title: <span>What sex were you <span className="serif">assigned at birth?</span></span>,
          subtitle: 'This is a starting point only — we’ll confirm your actual anatomy in a few steps.',
        }), onBack: null }}
        options={SEX_AT_BIRTH} value={sex} onChange={setSex} />;
      break;
    case 'gender':
      screen = <MultiSelectScreen
        shellProps={shell('gender', { phase: 'identity',
          title: <span>How do you describe <span className="serif">your gender?</span></span>,
          subtitle: 'Pick anything that fits. You can choose more than one.',
        })}
        options={GENDERS} value={genders} onChange={setGenders}
        exclusive={['skip']} />;
      break;
    case 'pronouns':
      screen = <MultiSelectScreen
        shellProps={shell('pronouns', { phase: 'identity',
          title: <span>What are <span className="serif">your pronouns?</span></span>,
          subtitle: 'Pick all that apply.',
        })}
        options={PRONOUNS} value={pronouns} onChange={setPronouns}
        exclusive={['skip']} />;
      break;
    case 'orientation':
      screen = <MultiSelectScreen
        shellProps={shell('orientation', { phase: 'identity',
          title: <span>What is <span className="serif">your sexual orientation?</span></span>,
          subtitle: 'Pick all that apply.',
        })}
        options={ORIENTATIONS} value={orientations} onChange={setOrientations}
        exclusive={['skip']} />;
      break;
    case 'race':
      screen = <MultiSelectScreen
        shellProps={shell('race', { phase: 'identity',
          title: <span>What race or ethnicity <span className="serif">describes you?</span></span>,
          subtitle: 'Pick all that apply. This is optional.',
        })}
        options={RACES} value={races} onChange={setRaces}
        exclusive={['skip']} />;
      break;
    case 'age':
      screen = <AgeScreenV2
        shellProps={shell('age', { phase: 'identity',
          title: <span>How old <span className="serif">are you?</span></span>,
          subtitle: 'Most screening tables use age to decide when to start.',
        })}
        value={age} onChange={setAge} />;
      break;
    case 'body':
      screen = <BodyInventoryScreen
        shellProps={shell('body', { phase: 'body',
          title: <span>About <span className="serif">your body.</span></span>,
          subtitle: 'Tap each part to tell us its current state. Nothing is filled in for you — every body is different, so we ask directly.',
        })}
        value={organStates} onChange={setOrganStates} sex={sex} />;
      break;
    case 'hpv':
      screen = <SingleSelectScreen
        shellProps={shell('hpv', { phase: 'history',
          title: <span>Did you get <span className="serif">the HPV vaccine?</span></span>,
          subtitle: 'It’s okay if you don’t remember. The vaccine prevents most cervical, anal, and some throat cancers.',
        })}
        options={[
          { id: 'yes',    label: 'Yes, full series' },
          { id: 'partial', label: 'Yes, but not the full series' },
          { id: 'no',     label: 'No' },
          { id: 'unsure', label: 'I don’t know' },
          { id: 'skip',   label: 'Prefer not to say' },
        ]} value={hpv} onChange={setHpv} />;
      break;
    case 'family':
      screen = <MultiSelectScreen
        shellProps={shell('family', { phase: 'history',
          title: <span>Has anyone in <span className="serif">your family</span> had cancer?</span>,
          subtitle: 'Blood relatives only. Pick all that apply.',
        })}
        options={FAMILY} value={familyMembers} onChange={setFamilyMembers}
        exclusive={['none']} />;
      break;
    case 'smoking':
      screen = <SingleSelectScreen
        shellProps={shell('smoking', { phase: 'history',
          title: <span>Have you ever <span className="serif">smoked regularly?</span></span>,
          subtitle: 'Lung cancer screening depends on this. Honest answers help.',
        })}
        options={[
          { id: 'long', label: 'Yes — 20+ years' },
          { id: 'some', label: 'Yes, but less than 20 years' },
          { id: 'no',   label: 'No, never regularly' },
          { id: 'skip', label: 'Prefer not to say' },
        ]}
        value={smoked === true ? 'long' : smoked === 'some' ? 'some' : smoked === false ? 'no' : smoked === null ? 'skip' : null}
        onChange={(v) => {
          if (v === 'long') setSmoked(true);
          else if (v === 'some') setSmoked('some');
          else if (v === 'no') setSmoked(false);
          else setSmoked(null);
        }} />;
      break;
    case 'review':
      screen = <ReviewScreen
        data={{ sex, genders, pronouns, orientations, races, age, organStates, hpv, familyMembers, smoked }}
        onEdit={editFromReview}
        onContinue={() => goto('generating')}
        onBack={() => goto('smoking')} />;
      break;
    case 'generating':
      screen = <GeneratingScreen onDone={() => goto('guide')} />;
      break;
    case 'guide':
      screen = <GuideScreen
        data={{
          identity: genders[0] || 'skip',
          age,
          organs: organsForBuild.size > 0 ? organsForBuild : new Set(['colon','lungs']),
          smoked: smoked === true,
          familyHistory: familyHistoryBool,
          familyMembers,
          pronouns: pronouns.map(p => {
            const item = PRONOUNS.find(x => x.id === p);
            return item ? item.label : p;
          }).join(' / '),
          hpv,
        }}
        theme={t.theme}
        themes={THEMES}
        onThemeChange={(name) => setTweak('theme', name)}
        onRestart={() => goto('review')} />;
      break;
    default:
      screen = null;
  }

  const labelMap = {
    language: '00 Language', welcome: '01 Welcome', color: '02 Color',
    sex: '03 Sex at birth', gender: '04 Gender', pronouns: '05 Pronouns',
    orientation: '06 Orientation', race: '07 Race', age: '08 Age',
    body: '09 Body', hpv: '10 HPV', family: '11 Family', smoking: '12 Smoking',
    review: '13 Review', generating: '14 Generating', guide: '15 Guide',
  };

  return (
    <div className="theme-root" style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: isEmbedded ? '0' : '24px 12px',
    }}>
      <div data-screen-label={labelMap[step]} style={{
        width: isEmbedded ? '100%' : (t.showFrame ? 'auto' : '100%'),
        height: isEmbedded ? '100%' : 'auto',
        maxWidth: isEmbedded ? 'none' : (t.showFrame ? 'none' : 480),
      }}>
        {isEmbedded ? (
          <div style={{ width: '100%', height: '100vh', background: 'var(--bg)' }}>
            <div key={step} className="screen-anim" style={{ width: '100%', height: '100%' }}>{screen}</div>
          </div>
        ) : t.showFrame ? (
          <IOSDevice width={402} height={844}>
            <div key={step} className="screen-anim" style={{ width: '100%', height: '100%' }}>{screen}</div>
          </IOSDevice>
        ) : (
          <div style={{
            width: '100%', maxWidth: 402, height: 'min(844px, calc(100vh - 60px))',
            margin: '0 auto', position: 'relative', borderRadius: 24, overflow: 'hidden',
            background: 'var(--bg)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          }}>
            <div key={step} className="screen-anim" style={{ width: '100%', height: '100%' }}>{screen}</div>
          </div>
        )}
      </div>

      {!isEmbedded && (
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakSelect label="Color theme" value={t.theme}
          options={Object.keys(THEMES).map(k => ({ value: k, label: THEMES[k].label }))}
          onChange={(v) => setTweak('theme', v)} />
        <TweakToggle label="Show device frame" value={t.showFrame}
          onChange={(v) => setTweak('showFrame', v)} />

        <TweakSection label="Demo personas" />
        <TweakSelect label="Jump to guide as…" value={t.persona}
          options={[
            { value: 'none', label: 'No persona' },
            { value: 'maya', label: 'Maya · trans woman, 47' },
            { value: 'jordan', label: 'Jordan · trans man, 32' },
            { value: 'sam', label: 'Sam · nonbinary, 55' },
            { value: 'ana', label: 'Ana · cis woman, 42' },
          ]}
          onChange={(v) => setTweak('persona', v)} />

        <TweakSection label="Navigate" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {STEPS.map(s => (
            <button key={s} onClick={() => goto(s)} style={{
              padding: '7px 8px', border: '1px solid rgba(0,0,0,0.12)',
              background: step === s ? '#29261b' : 'rgba(255,255,255,0.5)',
              color: step === s ? 'white' : '#29261b',
              fontFamily: 'inherit', fontSize: 11, fontWeight: 500,
              borderRadius: 7, cursor: 'pointer', textAlign: 'left',
            }}>{labelMap[s]}</button>
          ))}
        </div>
      </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
