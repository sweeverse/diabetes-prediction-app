/**
 * GlycoTrack — app.js
 * UI orchestration: form validation, loading animation,
 * rendering results (gauge, risk bars, timeline, recommendations).
 *
 * Depends on: model.js  (predict, getStage, getPct, computeRisks, getRecs,
 *                         bmiCat, glucCat, lipidCat)
 */

/* ════════════════════════════════════════════════════
   SEX TOGGLE
════════════════════════════════════════════════════ */
let selectedSex = null;

function setSex(s) {
  selectedSex = s;
  document.getElementById('sM').classList.toggle('on', s === 'M');
  document.getElementById('sF').classList.toggle('on', s === 'F');
}

/* ════════════════════════════════════════════════════
   LOADING ANIMATION
════════════════════════════════════════════════════ */
const LOAD_STEPS = [
  'Normalising clinical inputs',
  'Computing risk features',
  'Running ridge regression',
  'Mapping progression stages',
  'Generating recommendations',
];

/**
 * showLoading(inp)
 * Validates the form, then triggers the animated loading overlay
 * before handing off to runAnalysis().
 */
function startAnalysis() {
  // — Validation —
  const errEl  = document.getElementById('formErr');
  errEl.style.display = 'none';

  const keys   = ['age', 'bmi', 'bp', 'tchol', 'ldl', 'hdl', 'ratio', 'trig', 'glucose'];
  const inp    = {};
  const missing = [];

  keys.forEach(k => {
    const v = parseFloat(document.getElementById(k).value);
    if (isNaN(v) || v <= 0) {
      missing.push(k);
      document.getElementById(k).classList.add('err');
    } else {
      document.getElementById(k).classList.remove('err');
      inp[k] = v;
    }
  });

  if (!selectedSex) missing.push('sex');

  if (missing.length) {
    errEl.textContent    = 'Please complete: ' + missing.join(', ');
    errEl.style.display  = 'block';
    return;
  }

  inp.sex   = selectedSex;
  inp.hba1c = document.getElementById('hba1c').value;   // optional

  // — Show overlay —
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('visible');

  const fill  = document.getElementById('loadFill');
  const label = document.getElementById('loadLabel');

  // Spawn rising blood drops
  const dropsEl = document.getElementById('loadDrops');
  dropsEl.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('div');
    d.className = 'ldrop';
    d.style.left              = (5 + Math.random() * 90) + '%';
    d.style.bottom            = '0';
    d.style.animationDelay    = (Math.random() * 1.8) + 's';
    d.style.animationDuration = (1.4 + Math.random() * 0.8) + 's';
    dropsEl.appendChild(d);
  }

  // — Progress bar —
  let pct      = 0;
  let stepIdx  = 0;
  const totalMs = 2200;
  const interval = 40;
  const steps    = Math.ceil(totalMs / interval);

  const timer = setInterval(() => {
    pct = Math.min(100, pct + (100 / steps) + (Math.random() * 1.5 - 0.5));
    fill.style.width = pct + '%';

    const newIdx = Math.floor((pct / 100) * LOAD_STEPS.length);
    if (newIdx !== stepIdx && newIdx < LOAD_STEPS.length) {
      stepIdx          = newIdx;
      label.textContent = LOAD_STEPS[stepIdx];
    }

    if (pct >= 100) {
      clearInterval(timer);
      fill.style.width   = '100%';
      label.textContent  = 'Complete';
      setTimeout(() => {
        overlay.classList.remove('visible');
        runAnalysis(inp);
      }, 300);
    }
  }, interval);
}

/* ════════════════════════════════════════════════════
   RENDER HELPERS
════════════════════════════════════════════════════ */

/** Animate the semicircle gauge to a given percentile with a count-up number. */
function renderGauge(pct) {
  const pctEl = document.getElementById('pctVal');
  function ordinal(n) {
    const v = Math.round(n);
    const s = ['th','st','nd','rd'];
    const mod = v % 100;
    return v + (s[(mod - 20) % 10] || s[mod] || s[0]);
  }
  // Count-up animation
  let current = 0;
  const duration = 1400;
  const stepMs = 16;
  const increment = pct / (duration / stepMs);
  const counter = setInterval(() => {
    current = Math.min(current + increment, pct);
    pctEl.textContent = ordinal(current);
    if (current >= pct) clearInterval(counter);
  }, stepMs);

  // Arc animation
  setTimeout(() => {
    document.getElementById('gArc').style.strokeDashoffset = 257 - (pct / 100) * 257;
  }, 120);
}

/** Render the six risk-factor tiles with animated progress bars. */
function renderRisks(risks) {
  document.getElementById('riskGrid').innerHTML = risks.map(r => `
    <div class="risk-tile">
      <div class="risk-name">${r.name}</div>
      <div class="bar-bg">
        <div class="bar-fill" data-p="${r.pct}" style="background:${r.c}"></div>
      </div>
      <div class="risk-val" style="color:${r.c}">
        ${r.val}
        <span style="color:var(--muted2);font-size:0.68rem;font-weight:400"> ${r.unit}</span>
      </div>
      <div class="risk-status" style="color:${r.c}">${r.status}</div>
    </div>`
  ).join('');

  // Trigger CSS transition after a short delay (so DOM paints first)
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(b => {
      b.style.width = b.dataset.p + '%';
    });
  }, 200);
}

/**
 * Render the 5-stage vertical timeline.
 * The active (current) stage gets the glowing dot and "You are here" badge.
 */
function renderTimeline(score) {
  const cur = getStage(score);
  const stageColors = ['#5a7a30', '#8B7520', '#8B1A00', '#C0310A', '#E05A20'];

  document.getElementById('timeline').innerHTML = STAGES.map((s, i) => {
    const isActive = s.id === cur.id;
    const dotStyle = isActive
      ? ''
      : `border-color:${stageColors[i]}`;
    const innerStyle = isActive
      ? ''
      : `background:${stageColors[i]}`;

    return `
    <div class="tl-item${isActive ? ' active' : ''}">
      <div class="tl-dot" style="${dotStyle}">
        <div class="tl-dot-inner" style="${innerStyle}"></div>
      </div>
      <div class="tl-body-wrap">
        <div class="tl-header">
          <span class="tl-stage-badge">${s.label}</span>
          ${isActive ? '<span class="here-badge">● You are here</span>' : ''}
        </div>
        <div class="tl-title">${s.title}</div>
        <div class="tl-desc">${s.body}</div>
        <div class="tl-meta-row">
          <span class="tl-meta-chip">${s.icd}</span>
          <span class="tl-meta-chip">Score ${s.scoreRange}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

/** Render personalised clinical recommendations. */
function renderRecs(recs) {
  document.getElementById('recList').innerHTML = recs.map(r => `
    <div class="rec-row">
      <span class="rec-ico">${r.icon}</span>
      <div>
        <div class="rec-title">${r.title}</div>
        <div class="rec-body">${r.body}</div>
      </div>
    </div>`
  ).join('');
}

/* ════════════════════════════════════════════════════
   MAIN ANALYSIS FLOW
════════════════════════════════════════════════════ */

/**
 * runAnalysis(inp)
 * Called after the loading animation completes.
 * Computes everything and populates the results panel.
 */
function runAnalysis(inp) {
  const score = predict(inp);
  const stage = getStage(score);
  const pct   = getPct(score);
  const bmi   = bmiCat(inp.bmi);
  const gluc  = glucCat(inp.glucose);
  const lipid = lipidCat(inp.tchol, inp.ldl, inp.hdl, inp.trig);

  // — Results hero —
  const heroTitles = {
    s0: "You're metabolically healthy.",
    s1: 'Early signals worth watching.',
    s2: 'Your metabolism needs attention.',
    s3: 'Significant risk — act now.',
    s4: "Critical stage. Don't wait.",
  };
  const heroSubs = {
    s0: 'Your biomarkers are within healthy ranges. Keep up the habits that got you here.',
    s1: 'A few markers are drifting. Catching this early gives you the best chance to course-correct.',
    s2: 'Multiple markers are outside optimal ranges. Lifestyle and clinical changes can still make a real difference.',
    s3: 'Your profile shows advanced metabolic stress. Medical guidance and immediate action are strongly advised.',
    s4: 'Your values indicate critical progression. Please consult a healthcare professional without delay.',
  };
  document.getElementById('resultsHeroTitle').textContent = heroTitles[stage.id];
  document.getElementById('resultsHeroSub').textContent   = heroSubs[stage.id];

  // Show results, hide form
  document.getElementById('inputForm').style.display    = 'none';
  document.getElementById('heroSection').style.display  = 'none';
  document.getElementById('resultsPanel').style.display = 'block';

  // — Score card —
  document.getElementById('scoreVal').textContent  = score.toFixed(0);
  document.getElementById('scoreVal').className    = 'score-big ' + stage.id;
  document.getElementById('stagePill').innerHTML   =
    `<span class="stage-pill ${stage.id}">${stage.title}</span>`;

  // Build a dynamic insight line based on the actual data
  const topRisk = computeRisks(inp).sort((a, b) => b.pct - a.pct)[0];
  const momentum = score > 200 ? 'urgent intervention' : score > 120 ? 'active management' : 'preventive action';
  document.getElementById('scoreDesc').innerHTML =
    `<span style="font-weight:700;color:var(--darkred)">Primary driver:</span> ${topRisk.name} ` +
    `<span style="color:var(--muted2);font-size:0.78rem">(${topRisk.val} ${topRisk.unit})</span> · ` +
    `<span style="font-weight:700;color:var(--darkred)">Priority:</span> ${momentum}`;

  // — Gauge —
  document.getElementById('pctVal').textContent = '0th';
  renderGauge(pct);

  // — Mini metric tiles —
  const setMetric = (valId, subId, label, colour, subText) => {
    const v = document.getElementById(valId);
    const s = document.getElementById(subId);
    v.textContent = label;
    v.style.color = colour;
    s.textContent = subText;
    s.style.color = colour;
  };

  setMetric('bmiCatVal',  'bmiCatSub',  bmi.l,   bmi.c,   `BMI ${inp.bmi.toFixed(1)} kg/m²`);
  setMetric('glucCatVal', 'glucCatSub', gluc.l,  gluc.c,  `${inp.glucose} mg/dL fasting`);
  setMetric('lipidCatVal','lipidCatSub',lipid.l, lipid.c, `TC/HDL ratio ${inp.ratio.toFixed(1)}`);

  // — Detailed sections —
  renderRisks(computeRisks(inp));
  renderTimeline(score);
  renderRecs(getRecs(inp, stage, score));

  // Smooth scroll to results
  setTimeout(() => {
    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ════════════════════════════════════════════════════
   RESET
════════════════════════════════════════════════════ */

function resetForm() {
  document.getElementById('resultsPanel').style.display = 'none';
  document.getElementById('inputForm').style.display    = 'block';
  document.getElementById('heroSection').style.display  = 'block';
  document.querySelectorAll('input').forEach(i => { i.value = ''; });
  selectedSex = null;
  document.getElementById('sM').classList.remove('on');
  document.getElementById('sF').classList.remove('on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
