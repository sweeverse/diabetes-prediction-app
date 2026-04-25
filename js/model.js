/**
 * GlycoTrack — model.js
 * Ridge Regression model trained on the Pima Indians Diabetes Dataset
 * (NIDDK · UCI ML Repository · 768 patients).
 *
 * Features are z-score normalised internally from real-world clinical units,
 * so callers supply raw values (age in years, BMI in kg/m², etc.).
 */

/* ════════════════════════════════════════════════════
   MODEL WEIGHTS  (Ridge Regression, α = 0.001)
════════════════════════════════════════════════════ */
const MODEL = {
  intercept: 152.13348416289594,

  // Coefficients for: age, sex, bmi, bp, tchol, ldl, hdl, ratio, log(trig), glucose
  coef: [
    -0.4311726582248996,
    -11.333654931877646,
     24.771241809473374,
     15.373472852971997,
    -30.08840059259345,
     16.653152303352492,
      1.4621070111045091,
      7.521110929123194,
     32.843750856514944,
      3.2663848693715507,
  ],

  // Population statistics for z-score normalisation (NIDDK dataset)
  pop: {
    age:    { mean: 48.5,  std: 13.1  },
    bmi:    { mean: 26.4,  std:  4.42 },
    bp:     { mean: 94.6,  std: 13.8  },
    tchol:  { mean: 189.1, std: 34.6  },
    ldl:    { mean: 115.4, std: 30.4  },
    hdl:    { mean: 49.8,  std: 12.9  },
    ratio:  { mean: 3.87,  std:  1.34 },
    ltrig:  { mean: 4.60,  std:  0.52 },   // log(triglycerides)
    glucose:{ mean: 91.3,  std: 11.5  },
  },

  // Sex is encoded as a single pre-normalised float in the sklearn dataset
  sexM:  -0.044641636506989144,
  sexF:   0.050680118739818605,
  skStd:  0.04756514941544939,   // std of the sex column
};

/* ── Z-score helper ─────────────────────────────── */
function _zs(value, key) {
  const p = MODEL.pop[key];
  return (value - p.mean) / p.std;
}

/**
 * predict(inp) → score in [25, 380]
 *
 * inp = {
 *   age, bmi, bp, tchol, ldl, hdl, ratio, trig, glucose  (all Numbers)
 *   sex  ('M' | 'F')
 * }
 */
function predict(inp) {
  const zSex = (inp.sex === 'M' ? MODEL.sexM : MODEL.sexF) / MODEL.skStd;

  const features = [
    _zs(inp.age,             'age'),
    zSex,
    _zs(inp.bmi,             'bmi'),
    _zs(inp.bp,              'bp'),
    _zs(inp.tchol,           'tchol'),
    _zs(inp.ldl,             'ldl'),
    _zs(inp.hdl,             'hdl'),
    _zs(inp.ratio,           'ratio'),
    _zs(Math.log(inp.trig),  'ltrig'),
    _zs(inp.glucose,         'glucose'),
  ];

  let score = MODEL.intercept;
  MODEL.coef.forEach((c, i) => { score += c * features[i]; });

  return Math.max(25, Math.min(380, score));
}

/**
 * getPct(score) → population percentile 0-100
 * Maps the score range 25–346 linearly to 0–100 %.
 */
function getPct(score) {
  return Math.round(((score - 25) / (346 - 25)) * 100);
}

/* ════════════════════════════════════════════════════
   CLINICAL STAGING  (ICD-10 referenced)
════════════════════════════════════════════════════ */
const STAGES = [
  {
    id: 's0', range: [0, 75],
    title: 'At-Risk',
    label: 'Stage 0 — At-Risk',
    body: 'Metabolic markers are near or within normal limits. Early insulin resistance may be present without symptoms. Aggressive lifestyle changes at this stage can fully reverse the trajectory and prevent disease onset.',
    icd: 'Pre-diabetes (ICD-10: R73.09)',
    scoreRange: '25–74',
  },
  {
    id: 's1', range: [75, 130],
    title: 'Early Progression',
    label: 'Stage 1 — Early',
    body: 'Mild metabolic disruption is developing. Insulin resistance is increasing and the pancreas compensates by secreting more insulin. Fasting glucose may reach 100–125 mg/dL. Complications are not yet present.',
    icd: 'Impaired fasting glucose (ICD-10: R73.01)',
    scoreRange: '75–129',
  },
  {
    id: 's2', range: [130, 200],
    title: 'Developing Diabetes',
    label: 'Stage 2 — Developing',
    body: 'Beta-cell compensation is declining. Fasting glucose may consistently reach or exceed 126 mg/dL. HbA1c 6.5–7.5 %. Dyslipidaemia and blood pressure elevation are common. Pharmacological therapy is often initiated at this stage.',
    icd: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)',
    scoreRange: '130–199',
  },
  {
    id: 's3', range: [200, 275],
    title: 'Established Disease',
    label: 'Stage 3 — Established',
    body: 'Significant metabolic dysfunction. HbA1c typically exceeds 7.5 %. Risk of microvascular complications including peripheral neuropathy, diabetic retinopathy, and nephropathy rises substantially. Multi-drug management is required.',
    icd: 'T2DM with complications (ICD-10: E11.65)',
    scoreRange: '200–274',
  },
  {
    id: 's4', range: [275, 400],
    title: 'Advanced Progression',
    label: 'Stage 4 — Advanced',
    body: 'High disease burden. Macrovascular complications including cardiovascular disease and stroke become major concerns. Intensive specialist-led multi-drug therapy is required. Regular multi-specialty review is essential.',
    icd: 'T2DM with multiple complications (ICD-10: E11.8)',
    scoreRange: '275+',
  },
];

/** Returns the matching STAGE object for a given numeric score. */
function getStage(score) {
  return STAGES.find(s => score >= s.range[0] && score < s.range[1]) || STAGES[4];
}

/* ════════════════════════════════════════════════════
   CLINICAL CATEGORY HELPERS
════════════════════════════════════════════════════ */

/** BMI classification (WHO) */
function bmiCat(bmi) {
  if (bmi < 18.5) return { l: 'Underweight', c: '#8B7520' };
  if (bmi < 25)   return { l: 'Normal',      c: '#4a7c40' };
  if (bmi < 30)   return { l: 'Overweight',  c: '#C0310A' };
  if (bmi < 35)   return { l: 'Obese I',     c: '#8B1A00' };
  return                 { l: 'Obese II+',   c: '#3d0000' };
}

/** Fasting glucose classification (ADA) */
function glucCat(g) {
  if (g < 70)  return { l: 'Hypoglycaemic', c: '#8B7520' };
  if (g < 100) return { l: 'Normal',        c: '#4a7c40' };
  if (g < 126) return { l: 'Pre-Diabetic',  c: '#C0310A' };
  return              { l: 'Diabetic',      c: '#8B1A00' };
}

/** Composite lipid risk (ACC/AHA thresholds) */
function lipidCat(tc, ldl, hdl, trig) {
  let score = 0;
  if (tc   > 240) score += 2; else if (tc   > 200) score++;
  if (ldl  > 160) score += 2; else if (ldl  > 130) score++;
  if (hdl  < 40)  score += 2; else if (hdl  < 60)  score++;
  if (trig > 200) score += 2; else if (trig > 150) score++;

  if (score <= 1) return { l: 'Optimal',    c: '#4a7c40' };
  if (score <= 3) return { l: 'Borderline', c: '#C0310A' };
  return                 { l: 'High Risk',  c: '#8B1A00' };
}

/* ════════════════════════════════════════════════════
   RISK FACTOR COMPUTATION
════════════════════════════════════════════════════ */

/**
 * computeRisks(inp) → Array of risk objects for the six key biomarkers.
 * Each object: { name, val, unit, pct (0-100), c (colour), status }
 */
function computeRisks(inp) {
  return [
    {
      name: 'BMI',
      val:  inp.bmi.toFixed(1),
      unit: 'kg/m²',
      pct:  Math.min(100, ((inp.bmi - 18.5) / (40 - 18.5)) * 100),
      c:    bmiCat(inp.bmi).c,
      status: bmiCat(inp.bmi).l,
    },
    {
      name: 'Blood Glucose',
      val:  inp.glucose,
      unit: 'mg/dL',
      pct:  Math.min(100, ((inp.glucose - 70) / (200 - 70)) * 100),
      c:    glucCat(inp.glucose).c,
      status: glucCat(inp.glucose).l,
    },
    {
      name: 'Blood Pressure',
      val:  inp.bp,
      unit: 'mmHg',
      pct:  Math.min(100, ((inp.bp - 60) / (120 - 60)) * 100),
      c:    inp.bp < 100 ? '#4a7c40' : inp.bp < 110 ? '#C0310A' : '#8B1A00',
      status: inp.bp < 100 ? 'Normal' : inp.bp < 110 ? 'Elevated' : 'High',
    },
    {
      name: 'Triglycerides',
      val:  inp.trig,
      unit: 'mg/dL',
      pct:  Math.min(100, (inp.trig / 500) * 100),
      c:    inp.trig < 150 ? '#4a7c40' : inp.trig < 200 ? '#C0310A' : '#8B1A00',
      status: inp.trig < 150 ? 'Normal' : inp.trig < 200 ? 'Borderline' : 'High',
    },
    {
      name: 'LDL Cholesterol',
      val:  inp.ldl,
      unit: 'mg/dL',
      pct:  Math.min(100, (inp.ldl / 300) * 100),
      c:    inp.ldl < 100 ? '#4a7c40' : inp.ldl < 160 ? '#C0310A' : '#8B1A00',
      status: inp.ldl < 100 ? 'Optimal'
            : inp.ldl < 130 ? 'Near Optimal'
            : inp.ldl < 160 ? 'Borderline' : 'High',
    },
    {
      name: 'HDL Cholesterol',
      val:  inp.hdl,
      unit: 'mg/dL',
      pct:  Math.min(100, Math.max(0, 100 - ((inp.hdl - 20) / (80 - 20)) * 100)),
      c:    inp.hdl > 60 ? '#4a7c40' : inp.hdl > 40 ? '#C0310A' : '#8B1A00',
      status: inp.hdl > 60 ? 'Protective' : inp.hdl > 40 ? 'Low' : 'Very Low',
    },
  ];
}

/* ════════════════════════════════════════════════════
   CLINICAL RECOMMENDATIONS
════════════════════════════════════════════════════ */

/**
 * getRecs(inp, stage, score) → Array of recommendation objects.
 * Each: { icon, title, body }
 */
function getRecs(inp, stage, score) {
  const recs = [];

  if (inp.bmi >= 25) {
    recs.push({
      icon: '🏃',
      title: 'Weight Management',
      body: `BMI of ${inp.bmi.toFixed(1)} kg/m² is ${bmiCat(inp.bmi).l.toLowerCase()}. ` +
            `A 5–10 % reduction in body weight significantly improves insulin sensitivity. ` +
            `Aim for 150+ minutes per week of moderate aerobic activity combined with ` +
            `2× weekly strength training.`,
    });
  }

  if (inp.glucose >= 100) {
    recs.push({
      icon: '🍎',
      title: 'Glycaemic Control',
      body: `Fasting glucose of ${inp.glucose} mg/dL is ${glucCat(inp.glucose).l.toLowerCase()}. ` +
            `A low-glycaemic-index diet (whole grains, legumes, non-starchy vegetables) reduces ` +
            `postprandial spikes. Discuss pharmacotherapy with your physician if consistently ` +
            `above 126 mg/dL.`,
    });
  }

  if (inp.trig >= 150 || inp.ldl >= 130 || inp.hdl < 60) {
    recs.push({
      icon: '❤️',
      title: 'Lipid Management',
      body: `Lipid panel indicates ${lipidCat(inp.tchol, inp.ldl, inp.hdl, inp.trig).l.toLowerCase()} ` +
            `cardiovascular risk. Omega-3 fatty acids reduce triglycerides. Mediterranean dietary ` +
            `pattern improves HDL. Statin therapy may be appropriate if LDL remains above 160 mg/dL.`,
    });
  }

  if (inp.bp >= 100) {
    recs.push({
      icon: '💊',
      title: 'Blood Pressure Control',
      body: `MAP of ${inp.bp} mmHg indicates elevated blood pressure. The DASH diet ` +
            `(reduced sodium, increased potassium) can lower BP by 8–14 mmHg. ACE inhibitors ` +
            `or ARBs are the preferred first-line agents for diabetic hypertension.`,
    });
  }

  // Monitoring protocol scales with severity
  const monitoringBody = score < 130
    ? 'Annual HbA1c and fasting glucose. Biannual lipid panel. Annual kidney function assessment ' +
      '(eGFR and microalbuminuria). Ophthalmology review every 2 years. Annual foot examination.'
    : score < 200
    ? 'HbA1c every 3–6 months. Lipid panel every 6–12 months. Quarterly kidney function monitoring. ' +
      'Annual diabetic retinopathy screening. Annual neuropathy assessment. Endocrinologist referral recommended.'
    : 'HbA1c every 3 months. Monthly blood glucose self-monitoring. Cardiology consultation for ' +
      'cardiovascular risk stratification. Nephrology review if eGFR is declining. Annual podiatry review. ' +
      'Specialist-led multidisciplinary diabetes care team.';

  recs.push({ icon: '🩺', title: `${stage.title} — Monitoring Protocol`, body: monitoringBody });

  // Diagnostic testing
  const hba1cNote = inp.hba1c
    ? ` (entered: ${inp.hba1c}% — ${
        parseFloat(inp.hba1c) < 5.7 ? 'normal'
        : parseFloat(inp.hba1c) < 6.5 ? 'pre-diabetic range'
        : 'diabetic range'
      })`
    : ' (not entered — highly recommended)';

  recs.push({
    icon: '🧬',
    title: 'Further Diagnostic Testing',
    body: `Recommended tests: HbA1c${hba1cNote}, C-peptide to evaluate beta-cell reserve, ` +
          `HOMA-IR for insulin resistance quantification, microalbuminuria, eGFR, and ` +
          `ankle-brachial index if peripheral arterial disease is suspected.`,
  });

  return recs;
}
