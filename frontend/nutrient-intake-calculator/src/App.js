// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from './components/Calculator';
import DataDisplay from './components/DataDisplay';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1>Nutrient Intake Calculator</h1>
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/data-display" element={<DataDisplay />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
