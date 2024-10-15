import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  activities?: string[];
}

interface TripPlannerProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const API_URL = 'http://localhost:5000/api';

const TripPlanner: React.FC<TripPlannerProps> = ({ trips, setTrips }) => {
  const [newTrip, setNewTrip] = useState<Trip>({ id: 0, destination: '', startDate: '', endDate: '' });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_URL}/trips`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'activities') {
      setNewTrip({ ...newTrip, activities: value.split(',').map(activity => activity.trim()) });
    } else {
      setNewTrip({ ...newTrip, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTrip.destination && newTrip.startDate && newTrip.endDate) {
      try {
        const response = await fetch(`${API_URL}/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTrip),
        });
        if (!response.ok) {
          throw new Error('Failed to add trip');
        }
        const addedTrip = await response.json();
        setTrips([...trips, addedTrip]);
        setNewTrip({ id: 0, destination: '', startDate: '', endDate: '' });
        setSelectedTrip(addedTrip);
      } catch (error) {
        console.error('Error adding trip:', error);
      }
    }
  };

  const handleDeleteTrip = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/trips/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }
      setTrips(trips.filter(trip => trip.id !== id));
      if (selectedTrip && selectedTrip.id === id) {
        setSelectedTrip(null);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleTripSelect = (trip: Trip) => {
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

  const generateWeeklyView = (trip: Trip): React.ReactNode[] => {
    if (!trip) return [];

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeklyView: React.ReactNode[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayActivities = trip.activities ? trip.activities[i % trip.activities.length] : '';

      weeklyView.push(
        <Card key={i} className="mb-4">
          <CardHeader>
            <CardTitle>{currentDate.toDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{dayActivities}</p>
          </CardContent>
        </Card>
      );
    }

    return weeklyView;
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Plan Your Trip</h2>
      <div className="mb-4">
        <Button onClick={toggleViewMode}>{viewMode === 'list' ? 'Map View' : 'List View'}</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <Input
          type="text"
          name="destination"
          value={newTrip.destination}
          onChange={handleInputChange}
          placeholder="Enter destination"
          required
        />
        <Input
          type="date"
          name="startDate"
          value={newTrip.startDate}
          onChange={handleInputChange}
          required
        />
        <Input
          type="date"
          name="endDate"
          value={newTrip.endDate}
          onChange={handleInputChange}
          required
        />
        <Textarea
          name="activities"
          value={newTrip.activities ? newTrip.activities.join(',') : ''}
          onChange={handleInputChange}
          placeholder="Enter activities (comma-separated)"
        />
        <Button type="submit">Add Trip</Button>
      </form>
      {viewMode === 'list' ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Trips</h3>
          {trips.map(trip => (
            <Card key={trip.id} className="cursor-pointer" onClick={() => handleTripSelect(trip)}>
              <CardHeader>
                <CardTitle>{trip.destination}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dates: {trip.startDate} to {trip.endDate}</p>
                <p>Activities: {trip.activities ? trip.activities.join(', ') : 'None'}</p>
                <Button variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}>Delete Trip</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-96 w-full">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={3}
            >
              {trips.map(trip => (
                <Marker
                  key={trip.id}
                  position={{ lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 }}
                  onClick={() => handleTripSelect(trip)}
                />
              ))}
            </GoogleMap>
          ) : (
            <div>Loading map...</div>
          )}
        </div>
      )}
      {selectedTrip && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Trip Details: {selectedTrip.destination}</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="text-lg font-semibold mb-2">Weekly Schedule</h4>
            <div className="space-y-4">
              {generateWeeklyView(selectedTrip)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TripPlanner;
