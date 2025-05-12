from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load trained Ridge Regression parameters
with open("model.pkl", "rb") as f:
    data = pickle.load(f)
    weights = data["weights"]  # Manually trained weights
    mean = data["mean"]
    std = data["std"]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.json['features']  # Receive input from frontend
        input_array = np.array(input_data)  

        # Scale input using stored mean and std
        input_scaled = (input_array - mean) / std  
        input_scaled = np.insert(input_scaled, 0, 1)  # Add bias term

        # Perform Ridge Regression Prediction
        prediction = np.dot(input_scaled, weights)

        return jsonify({'prediction': float(prediction)})  # Convert to JSON serializable type

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
