from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model and files
model = joblib.load("credit_model.pkl")
feature_names = joblib.load("feature_names.pkl")
label_encoders = joblib.load("label_encoders.pkl")


@app.route("/")
def home():
    return "API is running 🚀"


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    try:
        # Convert input into correct format
        input_data = []

        for feature in feature_names:
            value = data.get(feature)

            # Handle categorical encoding
            if feature in label_encoders:
                encoder = label_encoders[feature]
                value = encoder.transform([value])[0]

            input_data.append(value)

        input_array = np.array([input_data])

        # Prediction
        prediction = model.predict(input_array)[0]
        probability = model.predict_proba(input_array)[0][1]

        # Custom scoring logic (you can upgrade later)
        score = round(probability * 100, 2)

        result = {
            "prediction": "Default" if prediction == 1 else "Not Default",
            "probability": float(probability),
            "score": score
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)