// src/Calculator.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Calculator.css';

const Calculator = () => {
  const [formInput, setFormInput] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: ''
  });
  const [result, setResult] = useState(null);
  const [macronutrients, setMacronutrients] = useState(null);
  const [idealWeight, setIdealWeight] = useState(null);
  const [activityClassification, setActivityClassification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value
    });
  };

  const handleHealthMetricsSubmit = (e) => {
    e.preventDefault();
    fetch('/api/health-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formInput)
    })
      .then(response => response.json())
      .then(data => {
        setResult(data);
        setMacronutrients(null);
        setIdealWeight(null);
        setActivityClassification(null);
      });
  };

  const handleMacronutrientsSubmit = (e) => {
    e.preventDefault();
    fetch('/api/macronutrients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tdee: result.tdee })
    })
      .then(response => response.json())
      .then(data => setMacronutrients(data));
  };

  const handleIdealWeightSubmit = (e) => {
    e.preventDefault();
    fetch('/api/ideal-weight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ height: formInput.height, gender: formInput.gender })
    })
      .then(response => response.json())
      .then(data => setIdealWeight(data));
  };

  const handleActivityLevelSubmit = (e) => {
    e.preventDefault();
    fetch('/api/activity-level', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ activityLevel: formInput.activityLevel })
    })
      .then(response => response.json())
      .then(data => setActivityClassification(data));
  };

  return (
    <div>
      <h1>Calculator</h1>
      <form className="calculator-form" onSubmit={handleHealthMetricsSubmit}>
        <input
          type="number"
          name="age"
          value={formInput.age}
          onChange={handleChange}
          placeholder="Age"
        />
        <input
          type="number"
          name="weight"
          value={formInput.weight}
          onChange={handleChange}
          placeholder="Weight (kg)"
        />
        <input
          type="number"
          name="height"
          value={formInput.height}
          onChange={handleChange}
          placeholder="Height (cm)"
        />
        <select name="gender" value={formInput.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select name="activityLevel" value={formInput.activityLevel} onChange={handleChange}>
          <option value="">Select Activity Level</option>
          <option value="sedentary">Sedentary</option>
          <option value="lightly active">Lightly Active</option>
          <option value="moderately active">Moderately Active</option>
          <option value="very active">Very Active</option>
          <option value="super active">Super Active</option>
        </select>
        <button type="submit">Calculate</button>
      </form>
      {result && (
        <div className="results">
          <h2>Results:</h2>
          <p>BMI: {result.bmi}</p>
          <p>BMR: {result.bmr}</p>
          <p>TDEE: {result.tdee}</p>
          <form className="calculator-form" onSubmit={handleMacronutrientsSubmit}>
            <button type="submit">Get Macronutrient Recommendations</button>
          </form>
          <form className="calculator-form" onSubmit={handleIdealWeightSubmit}>
            <button type="submit">Get Ideal Weight Range</button>
          </form>
          <form className="calculator-form" onSubmit={handleActivityLevelSubmit}>
            <button type="submit">Get Activity Level Classification</button>
          </form>
        </div>
      )}
      {macronutrients && (
        <div className="results">
          <h2>Macronutrients:</h2>
          <p>Protein: {macronutrients.protein} grams</p>
          <p>Carbs: {macronutrients.carbs} grams</p>
          <p>Fats: {macronutrients.fats} grams</p>
        </div>
      )}
      {idealWeight && (
        <div className="results">
          <h2>Ideal Weight:</h2>
          <p>Min Weight: {idealWeight.minWeight} kg</p>
          <p>Max Weight: {idealWeight.maxWeight} kg</p>
        </div>
      )}
      {activityClassification && (
        <div className="results">
          <h2>Activity Level:</h2>
          <p>Classification: {activityClassification.classification}</p>
        </div>
      )}
      <Link to="/data-display">View All Data</Link>
    </div>
  );
};

export default Calculator;
