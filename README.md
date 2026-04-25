# GlycoTrack — Diabetes Progression Intelligence

A clinical-grade, ML-powered diabetes progression analyser built as a
pure front-end web application. No server required.

---

## Project Structure

```
GlycoTrack/
├── index.html          ← Entry point (clean HTML, no inline CSS/JS)
├── README.md           ← This file
│
├── css/
│   └── style.css       ← All styles: variables, layout, components,
│                          timeline, loading overlay, responsive rules
│
├── js/
│   ├── model.js        ← ML model weights, staging data, clinical
│   │                      category helpers, risk factor & recommendation
│   │                      computation
│   ├── app.js          ← UI orchestration: form validation, loading
│   │                      animation, all render functions, reset logic
│   └── background.js   ← Animated canvas: floating RBC images,
│                          isometric sugar cubes, blood drops
│
└── assets/
    └── blood-cell.png  ← RBC reference image used on the canvas background
```

---

## How to Run

### Option 1 — Open directly in a browser (recommended)

Simply double-click `index.html`. Everything is self-contained; no build
step or server is needed.

> **Note:** Some browsers block loading local image files via `file://`
> (the RBC canvas particles will fall back to invisible until the image
> loads). If particles don't appear, use Option 2.

### Option 2 — Serve with a local HTTP server

Any static server works. Examples:

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080

# Node (npx)
npx serve .
# then open the URL it prints

# VS Code
# Install the "Live Server" extension, right-click index.html → Open with Live Server
```

---

## ML Model

The model is a **Ridge Regression** trained on the
[Pima Indians Diabetes Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database)
(NIDDK · UCI ML Repository · 768 patients).

Inputs are entered as **real-world clinical values** (age in years,
BMI in kg/m², cholesterol in mg/dL, etc.). The app performs z-score
normalisation internally using population statistics from the dataset,
so no manual normalisation is required.

**Features used (10 total):**

| Feature             | Unit    | Notes                              |
|---------------------|---------|------------------------------------|
| Age                 | years   |                                    |
| Biological Sex      | M / F   | Encoded as sklearn dataset floats  |
| BMI                 | kg/m²   |                                    |
| Mean Arterial Press.| mmHg    | (SBP + 2·DBP) ÷ 3                 |
| Total Cholesterol   | mg/dL   |                                    |
| LDL Cholesterol     | mg/dL   |                                    |
| HDL Cholesterol     | mg/dL   |                                    |
| TC/HDL Ratio        | —       | Total Chol ÷ HDL                   |
| Triglycerides       | mg/dL   | Log-transformed before scoring     |
| Fasting Glucose     | mg/dL   |                                    |

**Output:** A continuous progression score (25–346) mapped to five
ICD-10 referenced clinical stages.

---

## Colour Palette

Sourced from the uploaded blood-cell reference image:

| Variable     | Hex       | Role                  |
|--------------|-----------|-----------------------|
| `--maroon`   | `#3d0000` | Primary text, headers |
| `--darkred`  | `#8B1A00` | Buttons, accents      |
| `--crimson`  | `#C0310A` | Active states, labels |
| `--orange`   | `#E05A20` | Gradient ends         |
| `--cream`    | `#EDD9B8` | Button text, chips    |
| `--cream2`   | `#FAF3EA` | Page background       |

---

## File Responsibilities

### `css/style.css`
All visual styling. CSS custom properties at `:root` keep the palette
consistent. Sections are clearly commented: nav, hero, form, loading
overlay, results, timeline, recommendations, responsive breakpoints.

### `js/model.js`
Pure logic — no DOM manipulation. Exports (as globals, since no bundler
is used): `predict()`, `getStage()`, `getPct()`, `computeRisks()`,
`getRecs()`, `bmiCat()`, `glucCat()`, `lipidCat()`, `STAGES`.

### `js/app.js`
All DOM interaction. Reads from `model.js` globals. Handles form
validation, the animated loading bar (with rising blood drops), and
all result rendering (gauge, risk bars, timeline, recommendations).

### `js/background.js`
Self-contained IIFE. Loads `assets/blood-cell.png` at runtime and
renders it on the `<canvas id="bgCanvas">` alongside procedural
sugar cubes and mini blood drops, all rising with a gentle wobble.

---

## Browser Support

Modern evergreen browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+).
No polyfills required; no build tooling needed.
