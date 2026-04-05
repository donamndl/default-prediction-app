import React, { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    age: "",
    income: "",
    loan_amount: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Loan Default Prediction</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="number"
          name="age"
          placeholder="Enter Age"
          value={formData.age}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="income"
          placeholder="Enter Income"
          value={formData.income}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="loan_amount"
          placeholder="Enter Loan Amount"
          value={formData.loan_amount}
          onChange={handleChange}
          required
        />

        <button type="submit">Predict</button>
      </form>

      {result && (
        <div style={styles.result}>
          <h3>Result</h3>
          <p><b>Prediction:</b> {result.prediction}</p>
          <p><b>Score:</b> {result.score}</p>
          <p><b>Probability:</b> {result.probability}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    margin: "auto",
    gap: "10px"
  },
  result: {
    marginTop: "20px",
    padding: "10px",
    border: "1px solid #ccc"
  }
};

export default App;