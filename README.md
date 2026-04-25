# 🩸 GlycoTrack — Diabetes Progression Intelligence

## 📖 Overview

GlycoTrack is a fully client-side, ML-powered diabetes progression analyser. It uses a **Ridge Regression model** trained on the Pima Indians Diabetes Dataset to predict where a patient stands on the metabolic spectrum — mapped to a complete five-stage clinical timeline. No backend, no server, no install — just open and run.

---

## 🌟 Features

- Ridge Regression ML model trained on the Pima Indians Diabetes Dataset.
- Real-time diabetes progression scoring (25–346 scale).
- Five ICD-10 referenced clinical stages with personalised recommendations.
- Animated canvas background with floating blood cells and sugar cubes.
- Dynamic results hero that adapts tone based on the patient's stage.
- Fully self-contained — runs from a single `index.html` with zero dependencies.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| ML Model | Ridge Regression (Pima Indians Diabetes Dataset) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Visualisation | Canvas API (animated background) |
| Styling | CSS custom properties, Cormorant Garamond + DM Mono |
| Tools | VS Code / any text editor |
| Deployment | GitHub Pages / any static host |

---

## 📂 Folder Structure

```
glycotrack-out/
├── index.html              ← Entry point
├── README.md               ← This file
│
├── css/
│   └── style.css           ← All styles: variables, layout, components,
│                              timeline, loading overlay, responsive rules
│
├── js/
│   ├── model.js            ← ML model weights, staging data, clinical
│   │                          helpers, risk factor & recommendation logic
│   ├── app.js              ← UI orchestration: form validation, loading
│   │                          animation, all render functions, reset logic
│   └── background.js       ← Animated canvas: floating RBC images,
│                              isometric sugar cubes
│
└── assets/
    └── blood-cell.png      ← RBC image used on the canvas background
```

---

## 📋 Requirements

- ✅ A modern browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
- ✅ No installs, no build tools, no server required

---

## 🔍 How It Works

### 🧠 ML Model (`model.js`)

- Accepts 10 clinical biomarkers as input.
- Performs z-score normalisation internally using dataset population statistics.
- Outputs a continuous progression score mapped to five clinical stages.
- Computes per-biomarker risk percentages and generates personalised recommendations.

### 🎨 Frontend (`app.js` + `style.css`)

- Validates and collects clinical inputs from the form.
- Runs the model and renders the score, gauge, risk bars, timeline, and recommendations.
- Displays a dynamic results hero with stage-specific messaging.
- Animated loading screen with rising bubble particles during processing.

### 🖼️ Background (`background.js`)

- Self-contained canvas animation.
- Renders floating red blood cells (PNG) and procedural isometric sugar cubes.
- All particles drift and wobble continuously in the background.

---

## 🧬 Biomarkers Used

| Feature | Unit | Notes |
|---|---|---|
| Age | years | |
| Biological Sex | M / F | Encoded as floats |
| BMI | kg/m² | |
| Mean Arterial Pressure | mmHg | (SBP + 2·DBP) ÷ 3 |
| Total Cholesterol | mg/dL | |
| LDL Cholesterol | mg/dL | |
| HDL Cholesterol | mg/dL | |
| TC/HDL Ratio | — | Total Chol ÷ HDL |
| Triglycerides | mg/dL | Log-transformed before scoring |
| Fasting Glucose | mg/dL | |

---

## 🚀 Getting Started

### Option 1 — Open directly in browser (recommended)

Double-click `index.html`. Everything is self-contained — no build step or server needed.

### Option 2 — Serve with a local HTTP server

```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080

# Node (npx)
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

### Option 3 — Deploy to GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Set branch to `main`, folder to `/ (root)`.
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`.

---

## 🌐 Live Demo

👉 [diabetes-prediction-app-one.vercel.app](https://diabetes-prediction-app-one.vercel.app)

---

## 🎨 Colour Palette

| Variable | Hex | Role |
|---|---|---|
| `--maroon` | `#3d0000` | Primary text, headers |
| `--darkred` | `#8B1A00` | Buttons, accents |
| `--crimson` | `#C0310A` | Active states, labels |
| `--orange` | `#E05A20` | Gradient ends |
| `--cream` | `#EDD9B8` | Button text, chips |
| `--cream2` | `#FAF3EA` | Page background |

---

## 🔐 Note on the ML Model

- The Ridge Regression weights are embedded directly in `model.js`.
- No API keys or external services are used — everything runs locally in the browser.
- The model was trained on the [Pima Indians Diabetes Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) (NIDDK · UCI ML Repository · 768 patients).

> ⚠️ GlycoTrack is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
