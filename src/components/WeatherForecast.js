import React, { useState } from 'react';
import './WeatherForecast.css';

function WeatherForecast() {
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (city.trim()) {
      try {
        const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok) {
          setForecast(data);
          setError('');
        } else {
          setError('City not found. Please try again.');
          setForecast(null);
        }
      } catch (error) {
        setError('An error occurred. Please try again later.');
        setForecast(null);
      }
    }
  };

  return (
    <div className="weather-forecast">
      <h2>Weather Forecast</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          placeholder="Enter city name"
        />
        <button type="submit">Get Forecast</button>
      </form>
      {error && <p className="error">{error}</p>}
      {forecast && (
        <div className="forecast-results">
          <h3>{forecast.city.name}, {forecast.city.country}</h3>
          <ul>
            {forecast.list.slice(0, 5).map((item, index) => (
              <li key={index}>
                <p>Date: {new Date(item.dt * 1000).toLocaleDateString()}</p>
                <p>Temperature: {item.main.temp}°C</p>
                <p>Description: {item.weather[0].description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WeatherForecast;
