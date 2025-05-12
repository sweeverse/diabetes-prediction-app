import numpy as np
import pickle
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split

# Load dataset
diabetes = load_diabetes()
X, y = diabetes.data, diabetes.target

# Manually compute mean and std for feature scaling
mean = np.mean(X, axis=0)
std = np.std(X, axis=0)
X_scaled = (X - mean) / std  # Standardize features

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Add bias term (column of ones) for intercept
X_train = np.c_[np.ones(X_train.shape[0]), X_train]
X_test = np.c_[np.ones(X_test.shape[0]), X_test]

# Initialize Ridge Regression parameters
alpha = 0.001   # Regularization strength
learning_rate = 0.01  # Step size for weight updates
epochs = 5000   # Number of training iterations
m, n = X_train.shape  # Number of samples (m) and features (n)

# Initialize weights randomly
weights = np.zeros(n)

# Train Ridge Regression using Gradient Descent
for epoch in range(epochs):
    predictions = np.dot(X_train, weights)  # Compute predictions
    error = predictions - y_train  # Compute error
    gradient = (1/m) * np.dot(X_train.T, error) + (alpha * weights)  # Ridge Gradient
    weights -= learning_rate * gradient  # Update weights

# Compute Mean Squared Error (MSE) on test data
y_pred_test = np.dot(X_test, weights)
mse = np.mean((y_test - y_pred_test) ** 2)

# Save trained model
with open("model.pkl", "wb") as f:
    pickle.dump({"weights": weights, "mean": mean, "std": std}, f)

# Print Model Details
print("Model trained and saved successfully!\n")
print("--- Ridge Regression Parameters ---")
print("Final Weights:\n", weights)
print("\nMean of Features:\n", mean)
print("\nStandard Deviation of Features:\n", std)
print("\nModel Performance:")
print("Mean Squared Error (MSE):", mse)
# Display actual vs predicted values
# Display actual vs predicted values
print("\nActual vs Predicted Values (Test Set):")
for i in range(len(X_test)):  # Loop through all test samples
    print(f"Sample {i+1}: Actual={y_test[i]:.2f}, Predicted={y_pred_test[i]:.2f}")

