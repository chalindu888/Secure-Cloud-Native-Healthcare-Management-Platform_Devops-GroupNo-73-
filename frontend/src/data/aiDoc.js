// Rule-based content for the AI-DOC symptom assistant. This is general guidance only: it does not
// diagnose anything. Hospital staff should review the symptoms, lab-test suggestions and wording.

export const SYMPTOMS = [
  { id: 'headache', en: 'Headache', si: 'ඔලුව කැක්කුම' },
  { id: 'fever', en: 'Fever / chills', si: 'උණ' },
  { id: 'bodyAches', en: 'Body aches / joint pain', si: 'සන්ධි වේදනාව' },
  { id: 'fatigue', en: 'Fatigue / weakness', si: 'තෙහෙට්ටුව' },
  { id: 'cough', en: 'Cough', si: 'කැස්ස' },
  { id: 'soreThroat', en: 'Sore throat', si: 'උගුරේ අමාරුව' },
  { id: 'runnyNose', en: 'Runny / stuffy nose', si: 'සෙම්ප්‍රතිශ්‍යාව / නාසය වැසී යාම' },
  { id: 'shortBreath', en: 'Shortness of breath', si: 'හුස්ම ගැනීමේ අපහසුව' },
  { id: 'chestPain', en: 'Chest pain / discomfort', si: 'පපුවේ අමාරුව' },
  { id: 'nausea', en: 'Nausea / vomiting', si: 'ඔක්කාරය / වමනය' },
  { id: 'diarrhea', en: 'Diarrhea', si: 'පාචනය' },
  { id: 'abdominal', en: 'Abdominal pain', si: 'බඩේ අමාරුව' },
];

export const symptomLabel = (s) => `${s.en} - ${s.si}`;

// Clickable regions of the body diagram
export const BODY_AREAS = [
  { id: 'head', label: 'Head' },
  { id: 'neck', label: 'Neck / throat' },
  { id: 'chest', label: 'Chest' },
  { id: 'abdomen', label: 'Abdomen' },
  { id: 'pelvis', label: 'Pelvis / hips' },
  { id: 'rightArm', label: 'Right arm' },
  { id: 'leftArm', label: 'Left arm' },
  { id: 'rightLeg', label: 'Right leg' },
  { id: 'leftLeg', label: 'Left leg' },
  { id: 'whole', label: 'Whole body' },
];

export const DURATIONS = ['Less than a day', '1 to 3 days', '4 to 7 days', 'More than a week', 'More than a month'];
export const SEVERITIES = [
  { id: 'mild', label: 'Mild', hint: 'Noticeable, but I can do my normal activities' },
  { id: 'moderate', label: 'Moderate', hint: 'It limits some of what I can do' },
  { id: 'severe', label: 'Severe', hint: 'Very painful or I cannot do my normal activities' },
];

// Any of these means "get urgent help now"
export const RED_FLAGS = [
  { id: 'breathing', label: 'Severe difficulty breathing, or I cannot speak a full sentence' },
  { id: 'chestRadiating', label: 'Chest pain spreading to my arm, jaw or back, with sweating' },
  { id: 'faint', label: 'I fainted or nearly fainted' },
  { id: 'confusion', label: 'Sudden confusion, weakness on one side, or trouble speaking' },
  { id: 'bleeding', label: 'Heavy bleeding that will not stop' },
  { id: 'stiffNeck', label: 'High fever with a stiff neck, or a spreading rash' },
];

const TESTS = {
  headache: ['Blood pressure check', 'Full Blood Count (FBC)'],
  fever: ['Full Blood Count (FBC)', 'C-reactive protein (CRP)', 'Dengue NS1 antigen', 'Urine full report'],
  bodyAches: ['Full Blood Count (FBC)', 'C-reactive protein (CRP)', 'ESR'],
  fatigue: ['Full Blood Count (FBC)', 'Fasting blood sugar', 'Thyroid function (TSH)', 'Serum creatinine'],
  cough: ['Chest X-ray', 'Full Blood Count (FBC)', 'C-reactive protein (CRP)'],
  soreThroat: ['Throat swab culture', 'Full Blood Count (FBC)'],
  runnyNose: ['Full Blood Count (FBC)'],
  shortBreath: ['Chest X-ray', 'ECG', 'Full Blood Count (FBC)', 'Oxygen saturation check'],
  chestPain: ['ECG', 'Troponin', 'Lipid profile', 'Chest X-ray'],
  nausea: ['Urine full report', 'Serum electrolytes', 'Liver function tests'],
  diarrhea: ['Stool full report', 'Serum electrolytes', 'Full Blood Count (FBC)'],
  abdominal: ['Ultrasound scan of the abdomen', 'Urine full report', 'Liver function tests', 'Serum amylase'],
};

const SPECIALTIES = {
  headache: 'Neurology',
  fever: 'General Medicine',
  bodyAches: 'General Medicine',
  fatigue: 'General Medicine',
  cough: 'General Medicine',
  soreThroat: 'ENT',
  runnyNose: 'ENT',
  shortBreath: 'General Medicine',
  chestPain: 'Cardiology',
  nausea: 'Gastroenterology',
  diarrhea: 'Gastroenterology',
  abdominal: 'Gastroenterology',
};

// Combine the answers into a suggestion: urgency, lab tests (with the symptoms that triggered
// them) and the specialties worth seeing.
export const analyse = ({ symptoms, severity, duration, redFlags }) => {
  const chosen = SYMPTOMS.filter((s) => symptoms.includes(s.id));

  let urgency = 'routine';
  if (severity === 'severe' || duration === 'More than a week' || duration === 'More than a month') urgency = 'soon';
  if (
    redFlags.length > 0
    || (symptoms.includes('chestPain') && severity === 'severe')
    || (symptoms.includes('shortBreath') && severity === 'severe')
  ) urgency = 'emergency';

  const tests = new Map();
  chosen.forEach((s) => (TESTS[s.id] || []).forEach((name) => {
    if (!tests.has(name)) tests.set(name, []);
    tests.get(name).push(s.en);
  }));

  const specialtyCount = {};
  chosen.forEach((s) => { specialtyCount[SPECIALTIES[s.id]] = (specialtyCount[SPECIALTIES[s.id]] || 0) + 1; });
  const specialties = Object.entries(specialtyCount).sort((a, b) => b[1] - a[1]).map(([name]) => name).slice(0, 2);

  return {
    urgency,
    tests: [...tests.entries()].map(([name, because]) => ({ name, because })),
    specialties,
  };
};
