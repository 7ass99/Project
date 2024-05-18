// src/components/DataDisplay.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DataDisplay = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/health-metrics')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1></h1>
      <h2>All Data</h2>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Age</th>
              <th>Weight</th>
              <th>Height</th>
              <th>Gender</th>
              <th>Activity Level</th>
              <th>BMI</th>
              <th>BMR</th>
              <th>TDEE</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.age}</td>
                <td>{item.weight}</td>
                <td>{item.height}</td>
                <td>{item.gender}</td>
                <td>{item.activityLevel}</td>
                <td>{item.bmi}</td>
                <td>{item.bmr}</td>
                <td>{item.tdee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
      <button onClick={() => navigate('/')}>Return to Calculator</button>
    </div>
  );
};

export default DataDisplay;
