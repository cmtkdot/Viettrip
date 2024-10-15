import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TripPlanner from './components/TripPlanner';
import TodoList from './components/TodoList';
import WeatherForecast from './components/WeatherForecast';
import CurrencyConverter from './components/CurrencyConverter';
import './App.css';

function App() {
  const [trips, setTrips] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Trip Itinerary Guide</h1>
          <button className="menu-toggle" onClick={toggleMenu}>
            ☰
          </button>
          <nav className={isMenuOpen ? 'open' : ''}>
            <ul>
              <li><Link to="/" onClick={toggleMenu}>Trip Planner</Link></li>
              <li><Link to="/todo" onClick={toggleMenu}>To-Do List</Link></li>
              <li><Link to="/weather" onClick={toggleMenu}>Weather Forecast</Link></li>
              <li><Link to="/currency" onClick={toggleMenu}>Currency Converter</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<TripPlanner trips={trips} setTrips={setTrips} />} />
            <Route path="/todo" element={<TodoList />} />
            <Route path="/weather" element={<WeatherForecast />} />
            <Route path="/currency" element={<CurrencyConverter />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2023 Trip Itinerary Guide. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
