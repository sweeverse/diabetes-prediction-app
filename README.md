# 🩺 Diabetes Progression Predictor

## 📖 Overview

This project is a machine learning web application that predicts the progression of diabetes using clinical features. It uses a **custom implementation of Ridge Regression**, trained from scratch using **gradient descent** on the **Scikit-learn Diabetes Dataset**. The backend is built with Flask and NumPy, and the frontend is a responsive interface designed with HTML, CSS, and JavaScript.

---


## 🌟 Features

- Predicts diabetes progression score based on 10 normalized health metrics.
- Ridge Regression implemented manually (no external ML libraries).
- Custom training loop using gradient descent and L2 regularization.
- Flask-based REST API for model inference.
- Responsive and animated frontend with clean form-based UI.
- Model saved in `.pkl` format for quick reuse and deployment.

---


## ⚙️ Tech Stack

- **Machine Learning**: Scikit-learn Diabetes Dataset, Ridge Regression (Manual), Gradient Descent
- **Backend**: Python 3, Flask, NumPy, Pickle
- **Frontend**: HTML5, CSS3 (Responsive UI), Vanilla JavaScript (AJAX)
- **Deployment Ready**: Can be deployed locally or on cloud platforms like Render, Heroku, or AWS

---


## 📂 Folder Structure
```bash
diabetes-prediction-app/
├── backend/
│   ├── train_model.py
│   ├── server.py
│   ├── model.pkl
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## 📋 Requirements 
Make sure the following are installed before running the project:

- 🐍 **Python 3.12.6**
- 🌐 **Flask** – Web framework for the backend
- 🧮 **NumPy** – Numerical computations
- 📊 **scikit-learn** – Machine learning utilities


## 🔍 How It Works

### 🧠 Model Training (`train_model.py`)
- Loads diabetes dataset from Scikit-learn.
- Standardizes input features manually.
- Adds bias term and trains weights using gradient descent.
- Saves model weights, mean, and std as `model.pkl`.

### 🖥️ Backend (`server.py`)
- Loads the saved model on startup.
- Accepts feature data via `/predict` POST request.
- Scales input and returns the predicted progression score.

### 💻 Frontend
- User inputs clinical values in a simple form.
- On submit, JavaScript sends the data to Flask backend via `fetch`.
- Displays the predicted progression score on the same page.

---


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sweeverse/diabetes-progression-predictor.git
cd diabetes-progression-predictor
```

### 2. Create a Virtual Environment (Optional)
```bash
python -m venv venv
```
Activate it:
```bash
source venv/bin/activate     # macOS/Linux
venv\Scripts\activate        # Windows
```

### 3. Install Dependencies
To install the necessary dependencies, run the following command:
```bash
pip install flask numpy scikit-learn
```
Alternatively, if you have a requirements.txt file, you can install all dependencies at once by running:
```bash
pip install -r requirements.txt
```

### 4. Set Up the Backend

### Train the Model
To train the model, run the following command:
```bash
python train_model.py
```
Start the Flask Server
To start the Flask server, use the following command:
```bash
python server.py
```

### 5. Launch the Frontend
1. Open `frontend/index.html` in your browser.
2. Fill in the form with normalized inputs.
3. Click **"Predict"** to see the results.


## 🖼️ Screenshots
![Screenshot (3)](https://github.com/user-attachments/assets/7603e306-35a5-45cf-aee7-a60083dabbea)
![image](https://github.com/user-attachments/assets/a0384112-56fe-4234-8620-cfde844026ef)
