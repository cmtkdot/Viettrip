import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import AIChatbot from './AIChatbot';
import './TripPlanner.css';

function TripPlanner({ trips, setTrips }) {
  const [newTrip, setNewTrip] = useState({ destination: '', startDate: '', endDate: '', activities: '' });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrip({ ...newTrip, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTrip.destination && newTrip.startDate && newTrip.endDate) {
      const activities = newTrip.activities.split(',').map(activity => activity.trim());
      const newTripWithId = { ...newTrip, id: Date.now(), activities };
      setTrips([...trips, newTripWithId]);
      setNewTrip({ destination: '', startDate: '', endDate: '', activities: '' });
      setSelectedTrip(newTripWithId);
    }
  };

  const handleDeleteTrip = (id) => {
    setTrips(trips.filter(trip => trip.id !== id));
    if (selectedTrip && selectedTrip.id === id) {
      setSelectedTrip(null);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
  };

  useEffect(() => {
    if (selectedTrip) {
      // In a real application, you would use a geocoding service to get the coordinates
      // For this example, we'll use random coordinates
      setMapCenter({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180
      });
    }
  }, [selectedTrip]);

  const generateWeeklyView = (trip) => {
    if (!trip) return null;

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const weeklyView = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayActivities = trip.activities[i % trip.activities.length];

      weeklyView.push(
        <div key={i} className="day-view">
          <h4>{currentDate.toDateString()}</h4>
          <p>{dayActivities}</p>
        </div>
      );
    }

    return weeklyView;
  };

  const handleAISuggest = (suggestedTrip) => {
    setNewTrip(suggestedTrip);
  };

  const handleAIAddTrip = (trip) => {
    if (Array.isArray(trip)) {
      // If it's an array, it's an update operation
      setTrips(trip);
    } else {
      // If it's a single object, it's an add operation
      const newTripWithId = { ...trip, id: Date.now() };
      setTrips([...trips, newTripWithId]);
    }
  };

  return (
    <div className="trip-planner">
      <h2>Plan Your Trip</h2>
      <AIChatbot onSuggest={handleAISuggest} onAddTrip={handleAIAddTrip} trips={trips} />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            type="text"
            name="destination"
            value={newTrip.destination}
            onChange={handleInputChange}
            placeholder="Enter destination"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            value={newTrip.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            value={newTrip.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="activities">Activities</label>
          <textarea
            id="activities"
            name="activities"
            value={newTrip.activities}
            onChange={handleInputChange}
            placeholder="Enter activities (comma-separated)"
          />
        </div>
        <button type="submit">Add Trip</button>
      </form>
      <div className="trip-list">
        <h3>Your Trips</h3>
        {trips.map(trip => (
          <div key={trip.id} className="trip-item" onClick={() => handleTripSelect(trip)}>
            <h4>{trip.destination}</h4>
            <p>Dates: {trip.startDate} to {trip.endDate}</p>
            <p>Activities: {trip.activities.join(', ')}</p>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}>Delete Trip</button>
          </div>
        ))}
      </div>
      {selectedTrip && (
        <div className="trip-details">
          <h3>Trip Details: {selectedTrip.destination}</h3>
          <div className="map-view">
            <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                center={mapCenter}
                zoom={10}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            </LoadScript>
          </div>
          <div className="weekly-view">
            <h4>Weekly Schedule</h4>
            <div className="week-container">
              {generateWeeklyView(selectedTrip)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripPlanner;
