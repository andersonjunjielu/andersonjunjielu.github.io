// data.jsx — all the static config: questions, organs, screening logic

const ORGANS = [
  { id: 'breast',   label: 'Breasts / Chest tissue', short: 'Chest',    plain: 'Most people have some breast tissue. Hormone therapy can change this.' },
  { id: 'cervix',   label: 'Cervix',                 short: 'Cervix',   plain: 'Connects the uterus to the vagina. A total hysterectomy may have removed it.' },
  { id: 'uterus',   label: 'Uterus',                 short: 'Uterus',   plain: 'Where a pregnancy can grow.' },
  { id: 'ovaries',  label: 'Ovaries',                short: 'Ovaries',  plain: 'Produce eggs and hormones.' },
  { id: 'prostate', label: 'Prostate',               short: 'Prostate', plain: 'A small gland near the bladder. Surgery rarely removes it, even after gender-affirming care.' },
  { id: 'testes',   label: 'Testes',                 short: 'Testes',   plain: 'Produce sperm and testosterone.' },
  { id: 'penis',    label: 'Penis',                  short: 'Penis',    plain: 'Outer genital anatomy.' },
  { id: 'vagina',   label: 'Vagina',                 short: 'Vagina',   plain: 'Outer genital anatomy. Can be present at birth or constructed surgically.' },
  { id: 'colon',    label: 'Colon & rectum',         short: 'Colon',    plain: 'Part of your digestive tract. Everyone has one.' },
  { id: 'lungs',    label: 'Lungs',                  short: 'Lungs',    plain: 'Especially relevant if you’ve smoked.' },
];

// 5-state organ inventory model — borrowed from clinical surveys
const ORGAN_STATES = [
  { id: 'present',     label: 'Present at birth',      sub: 'Born with it; still have it' },
  { id: 'constructed', label: 'Constructed with surgery', sub: 'Made through gender-affirming or reconstructive surgery' },
  { id: 'hormones',    label: 'Developed with hormones', sub: 'Grew or changed because of hormone therapy' },
  { id: 'removed',     label: 'Removed',               sub: 'Surgically removed (mastectomy, hysterectomy, etc.)' },
  { id: 'unsure',      label: 'Not sure',              sub: 'It’s okay not to know' },
  { id: 'na',          label: 'Does not apply to me',  sub: '' },
];

// Which states are valid for each organ (some organs can't be "developed with hormones", etc.)
const ORGAN_STATE_MAP = {
  breast:   ['present','hormones','constructed','removed','unsure','na'],
  cervix:   ['present','removed','unsure','na'],
  uterus:   ['present','removed','unsure','na'],
  ovaries:  ['present','removed','unsure','na'],
  prostate: ['present','unsure','na'],
  testes:   ['present','constructed','removed','unsure','na'],
  penis:    ['present','constructed','removed','unsure','na'],
  vagina:   ['present','constructed','removed','unsure','na'],
  colon:    ['present','removed','unsure','na'],
  lungs:    ['present','removed','unsure','na'],
};

// Sex assigned at birth
const SEX_AT_BIRTH = [
  { id: 'female', label: 'Female' },
  { id: 'male',   label: 'Male' },
  { id: 'intersex', label: 'Intersex', sub: 'Or differently assigned' },
  { id: 'unknown', label: 'I don’t know' },
  { id: 'skip',   label: 'Prefer not to say' },
];

// Gender identity — multi-select, full list
const GENDERS = [
  { id: 'woman', label: 'Woman' },
  { id: 'man', label: 'Man' },
  { id: 'trans-woman', label: 'Trans woman' },
  { id: 'trans-man', label: 'Trans man' },
  { id: 'nonbinary', label: 'Nonbinary' },
  { id: 'genderqueer', label: 'Genderqueer' },
  { id: 'agender', label: 'Agender' },
  { id: 'two-spirit', label: 'Two Spirit' },
  { id: 'questioning', label: 'Questioning or unsure' },
  { id: 'self-describe', label: 'Self-describe' },
  { id: 'skip', label: 'Prefer not to say' },
];

// Pronouns — multi-select
const PRONOUNS = [
  { id: 'she', label: 'she / her' },
  { id: 'he',  label: 'he / him' },
  { id: 'they', label: 'they / them' },
  { id: 'xe', label: 'xe / xem' },
  { id: 'self', label: 'Other' },
  { id: 'skip', label: 'Prefer not to say' },
];

// Sexual orientation
const ORIENTATIONS = [
  { id: 'straight', label: 'Heterosexual / Straight' },
  { id: 'lesbian',  label: 'Lesbian' },
  { id: 'gay',      label: 'Gay' },
  { id: 'bisexual', label: 'Bisexual' },
  { id: 'pansexual', label: 'Pansexual' },
  { id: 'queer',    label: 'Queer' },
  { id: 'asexual',  label: 'Asexual' },
  { id: 'sgl',      label: 'Same-gender loving' },
  { id: 'questioning', label: 'Questioning or unsure' },
  { id: 'skip',     label: 'Prefer not to say' },
];

// Race / ethnicity — multi-select
const RACES = [
  { id: 'white',    label: 'White' },
  { id: 'black',    label: 'Black or African American' },
  { id: 'asian',    label: 'Asian' },
  { id: 'aian',     label: 'American Indian or Alaska Native' },
  { id: 'mena',     label: 'Middle Eastern or North African' },
  { id: 'pacific',  label: 'Pacific Islander' },
  { id: 'hispanic', label: 'Hispanic or Latino/a/e' },
  { id: 'other',    label: 'Another race or ethnicity' },
  { id: 'skip',     label: 'Prefer not to say' },
];

// Family members
const FAMILY = [
  { id: 'mother', label: 'Mother' },
  { id: 'father', label: 'Father' },
  { id: 'sister', label: 'Sister' },
  { id: 'brother', label: 'Brother' },
  { id: 'daughter', label: 'Daughter' },
  { id: 'son', label: 'Son' },
  { id: 'grandparent', label: 'A grandparent' },
  { id: 'aunt-uncle', label: 'An aunt or uncle' },
  { id: 'none', label: 'No one in my family' },
];

// Each question gets a contextual "why we ask" copy for the info drawer
const INFO_COPY = {
  sex: {
    title: 'Why we ask sex assigned at birth',
    body: 'Many screening tables in medicine still use this term. It helps us figure out which body parts you may have been born with — but we’ll confirm everything in the body inventory next.',
  },
  gender: {
    title: 'Why we ask gender identity',
    body: 'How you describe yourself shapes how your guide is written and what your doctor sees on the handoff card. It does not, by itself, determine which screenings you need.',
  },
  pronouns: {
    title: 'Why we ask pronouns',
    body: 'So your guide and doctor handoff use language that feels right.',
  },
  orientation: {
    title: 'Why we ask sexual orientation',
    body: 'Some sexual health screenings (HPV, anal, STI) are recommended based on the kinds of sex you have. We never assume from this answer alone.',
  },
  race: {
    title: 'Why we ask race & ethnicity',
    body: 'Some cancers (prostate, stomach, liver) have higher rates in specific communities. Sharing this is optional — your guide works without it.',
  },
  age: {
    title: 'Why age matters',
    body: 'Most screening guidelines use age to decide when to start and stop. Your doctor mostly cares about this for the timing tables.',
  },
  body: {
    title: 'Why we ask about each body part',
    body: 'Cancer screening matches anatomy, not gender. A trans woman keeps her prostate. A trans man with a cervix still needs cervical screening. We ask each part separately so nothing is assumed.',
  },
  hpv: {
    title: 'Why we ask about HPV vaccination',
    body: 'The HPV vaccine prevents most cervical, anal, and some throat cancers. Whether and when you got it changes how often you need cervical screening.',
  },
  family: {
    title: 'Why we ask about family history',
    body: 'A close blood relative with breast, ovarian, colon, or prostate cancer can mean you should start screening earlier — or talk to a genetic counselor.',
  },
  smoking: {
    title: 'Why we ask about smoking',
    body: 'Lung cancer screening is recommended for adults 50+ with a long history of smoking. Your honest answer makes the difference.',
  },
};

// Default organ inventory inferred from sex assigned at birth (just a starting point)
const DEFAULT_ORGAN_STATES = {
  female: { breast: 'present', cervix: 'present', uterus: 'present', ovaries: 'present', vagina: 'present', colon: 'present', lungs: 'present' },
  male:   { breast: 'present', prostate: 'present', testes: 'present', penis: 'present', colon: 'present', lungs: 'present' },
  intersex: { colon: 'present', lungs: 'present' },
  unknown: { colon: 'present', lungs: 'present' },
  skip:   { colon: 'present', lungs: 'present' },
};

// Legacy: helper to build a Set of "owned" organs from organStates dict for the screening engine
function organsFromStates(states) {
  const set = new Set();
  for (const [oid, st] of Object.entries(states || {})) {
    if (['present','constructed','hormones','unsure'].includes(st)) set.add(oid);
  }
  return set;
}

// Legacy DEFAULT_ORGANS kept for older code paths
const DEFAULT_ORGANS = {
  'woman':       ['breast', 'cervix', 'uterus', 'ovaries', 'colon', 'lungs', 'vagina'],
  'man':         ['prostate', 'testes', 'colon', 'lungs', 'breast', 'penis'],
  'trans-woman': ['breast', 'prostate', 'colon', 'lungs'],
  'trans-man':   ['breast', 'cervix', 'uterus', 'ovaries', 'colon', 'lungs'],
  'nonbinary':   ['breast', 'colon', 'lungs'],
  'self-describe': ['colon', 'lungs'],
  'skip':        ['colon', 'lungs'],
};

const IDENTITIES = GENDERS;

// Screening recommendations
function buildScreenings({ organs, age, smoked, familyHistory, hpv }) {
  const recs = [];

  if (organs.has('breast') && age >= 40) {
    recs.push({
      id: 'mammogram', title: 'Mammogram', cadence: 'Every 1–2 years',
      because: 'You have breast tissue. Anyone with breast tissue can develop breast cancer — including trans women on estrogen.',
      what: 'A low-dose X-ray of the chest. Takes about 20 minutes.',
      priority: age >= 50 ? 'high' : 'soon',
    });
  }
  if (organs.has('cervix') && age >= 21 && age <= 65) {
    recs.push({
      id: 'cervical', title: 'Cervical screening (Pap / HPV)', cadence: hpv === 'yes' ? 'Every 5 years' : 'Every 3 years',
      because: 'You have a cervix. Trans men and nonbinary people with a cervix need this too — testosterone doesn’t remove the risk.',
      what: 'A small swab of the cervix. You can ask for a smaller speculum or a self-swab in some clinics.',
      priority: 'high',
    });
  }
  if (organs.has('prostate') && age >= 50) {
    recs.push({
      id: 'prostate', title: 'Prostate screening', cadence: 'Discuss with your doctor',
      because: 'You have a prostate. Trans women on estrogen still have one — surgery rarely removes it.',
      what: 'Usually a PSA blood test. Talk through pros & cons with your doctor.',
      priority: 'discuss',
    });
  }
  if (organs.has('colon') && age >= 45) {
    recs.push({
      id: 'colorectal', title: 'Colorectal screening', cadence: 'Every 1–10 years (depends on test)',
      because: 'Everyone has a colon. Risk goes up with age regardless of gender.',
      what: 'At-home stool test (yearly), sigmoidoscopy (5 yr), or colonoscopy (10 yr).',
      priority: age >= 50 ? 'high' : 'soon',
    });
  }
  if (organs.has('lungs') && age >= 50 && smoked) {
    recs.push({
      id: 'lung', title: 'Lung cancer screening', cadence: 'Yearly',
      because: 'You’ve smoked, and you’re in the recommended age range.',
      what: 'Low-dose CT scan. About 10 minutes.',
      priority: 'high',
    });
  }
  recs.push({
    id: 'sti', title: 'Sexual health check', cadence: 'Yearly, or with new partners',
    because: 'Recommended for everyone who is sexually active. Doesn’t matter who you have sex with.',
    what: 'Urine sample, blood test, or swab. You choose what’s screened.',
    priority: 'soon',
  });

  if (familyHistory) {
    recs.unshift({
      id: 'genetic', title: 'Genetic counseling conversation', cadence: 'Once, ongoing follow-up',
      because: 'You mentioned cancer in close family. A counselor can tell you if earlier or extra screening makes sense.',
      what: 'A 30–60 minute conversation. No needles unless you decide on a test.',
      priority: 'discuss',
    });
  }

  return recs;
}

// Personas for demo — updated to new shape
const PERSONAS = {
  none: null,
  maya:   { name: 'Maya, 47',   sex: 'male',   genders: ['trans-woman'], pronouns: ['she'], orientations: ['lesbian'], races: ['white'], age: 47,
            organStates: { breast: 'hormones', prostate: 'present', vagina: 'constructed', colon: 'present', lungs: 'present' },
            smoked: false, hpv: 'no', familyMembers: [] },
  jordan: { name: 'Jordan, 32', sex: 'female', genders: ['trans-man'],   pronouns: ['he'],  orientations: ['queer'], races: ['black'], age: 32,
            organStates: { breast: 'present', cervix: 'present', uterus: 'present', ovaries: 'present', colon: 'present', lungs: 'present' },
            smoked: false, hpv: 'yes', familyMembers: ['mother'] },
  sam:    { name: 'Sam, 55',    sex: 'female', genders: ['nonbinary'],   pronouns: ['they'], orientations: ['queer'], races: ['asian'], age: 55,
            organStates: { breast: 'present', cervix: 'present', uterus: 'present', ovaries: 'present', colon: 'present', lungs: 'present' },
            smoked: true, hpv: 'no', familyMembers: [] },
  ana:    { name: 'Ana, 42',    sex: 'female', genders: ['woman'],       pronouns: ['she'],  orientations: ['straight'], races: ['hispanic'], age: 42,
            organStates: { breast: 'present', cervix: 'present', uterus: 'present', ovaries: 'present', vagina: 'present', colon: 'present', lungs: 'present' },
            smoked: false, hpv: 'no', familyMembers: [] },
};

Object.assign(window, {
  ORGANS, ORGAN_STATES, ORGAN_STATE_MAP,
  SEX_AT_BIRTH, GENDERS, PRONOUNS, ORIENTATIONS, RACES, FAMILY,
  INFO_COPY, DEFAULT_ORGAN_STATES, organsFromStates,
  IDENTITIES, DEFAULT_ORGANS, buildScreenings, PERSONAS,
});
